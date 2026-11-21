---
title: "Never Charge Twice: Idempotency Keys and Point Refunds in a Paid API"
description: "A script retries, the same conversion arrives twice, and the customer pays twice. How an Idempotency-Key header, a hold on the points and a refund on failure keep a paid API fair."
pubDate: 2026-11-21T13:00:00+06:00
tags: ["FastAPI", "API Design", "SQLAlchemy"]
draft: false
---

## The problem: retries cost money

[ConvaterPro](/projects/convaterpro/) is a file conversion platform with a REST API. Every conversion costs **3 points**. Teams call the API from their own scripts, and scripts do what scripts should do when the network fails: **they retry**.

Here is the dangerous case:

1. A script sends "convert `site-plan.pdf` to Excel".
2. The server does the conversion and takes 3 points.
3. The response is lost on the way back (timeout, Wi-Fi drop, proxy restart).
4. The script never saw an answer, so it sends the same request again.
5. The server does the work again and takes **another** 3 points.

The customer asked for one conversion and paid for two. They did nothing wrong, and neither did their script.

There is a second unfair case: **a conversion that fails** (a broken PDF, for example) should not cost anything.

ConvaterPro solves both:

* An **`Idempotency-Key`** header makes a retried request return the first answer instead of running again.
* Points are **held** when a job starts and **refunded** if it fails.

This post shows how to build that in FastAPI and SQLAlchemy. The code is a small, complete version you can run.

---

## What "idempotent" means here

A request is idempotent if sending it twice has the same effect as sending it once.

`GET` requests are idempotent by nature. `POST /conversions` is not: each call creates a new job. The `Idempotency-Key` header makes it idempotent on purpose:

* The client creates a unique key for each **logical** operation (a UUID is fine) and sends it with the request.
* On a retry, the client sends the **same key** again.
* The server remembers each key and the answer it gave. When it sees a key a second time, it returns the stored answer and does nothing else.

```bash
curl -X POST https://api.example.com/v3/conversions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: 6f1c2a9e-1d4b-4f7e-9a51-3e0b6c1f2d77" \
  -H "Content-Type: application/json" \
  -d '{"tool": "pdf-to-excel", "file_name": "site-plan.pdf"}'
```

---

## The tables

Three tables are enough:

```python
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

COST = 3


class Base(DeclarativeBase):
    pass


class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    points: Mapped[int]


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), primary_key=True)
    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    request_hash: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(20), default="in_progress")  # in_progress | done
    response: Mapped[str | None]


class Ledger(Base):
    __tablename__ = "ledger"
    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))
    key: Mapped[str] = mapped_column(String(100))
    kind: Mapped[str] = mapped_column(String(10))  # hold | refund
    points: Mapped[int]
```

Two details matter:

* **The primary key of `idempotency_keys` is `(account_id, key)`.** The database itself refuses a second row with the same key. That is the lock. No application code can race past it.
* **The ledger is append-only.** Points never change silently: every hold and every refund is a row. The balance is a cache; the ledger is the history.

---

## The endpoint, in three steps

```python
import hashlib
import json

from fastapi import Depends, FastAPI, Header, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

app = FastAPI()


class ConversionIn(BaseModel):
    tool: str
    file_name: str


@app.post("/v3/conversions")
def create_conversion(
    body: ConversionIn,
    response: Response,
    idempotency_key: str = Header(min_length=8, max_length=100),
    db: Session = Depends(get_db),
):
    account_id = 1  # from the Bearer token in the real API
    request_hash = hashlib.sha256(body.model_dump_json().encode()).hexdigest()

    # 1. Claim the key and hold the points in ONE transaction.
    try:
        db.add(IdempotencyKey(account_id=account_id, key=idempotency_key, request_hash=request_hash))
        db.flush()  # the primary key makes a second claim fail right here
    except IntegrityError:
        db.rollback()
        seen = db.get(IdempotencyKey, (account_id, idempotency_key))
        if seen.request_hash != request_hash:
            raise HTTPException(422, "This Idempotency-Key was used with a different request.")
        if seen.status != "done":
            raise HTTPException(409, "A request with this Idempotency-Key is still running.")
        response.headers["Idempotent-Replayed"] = "true"
        return json.loads(seen.response)

    # One UPDATE checks and takes the points, so two requests can't both spend the last 3.
    held = db.execute(
        update(Account)
        .where(Account.id == account_id, Account.points >= COST)
        .values(points=Account.points - COST)
    )
    if held.rowcount == 0:
        db.rollback()
        raise HTTPException(402, "Not enough points.")
    db.add(Ledger(account_id=account_id, key=idempotency_key, kind="hold", points=-COST))
    db.commit()

    # 2. Do the work outside the transaction.
    try:
        output = run_conversion(body)
        result = {"status": "success", "output": output, "points": COST}
    except Exception as err:
        result = {"status": "failed", "error": str(err), "points": 0}

    # 3. Settle: keep the hold on success, refund it on failure, and store the answer.
    if result["status"] == "failed":
        db.execute(update(Account).where(Account.id == account_id).values(points=Account.points + COST))
        db.add(Ledger(account_id=account_id, key=idempotency_key, kind="refund", points=COST))
    seen = db.get(IdempotencyKey, (account_id, idempotency_key))
    result["balance"] = db.get(Account, account_id).points
    seen.status, seen.response = "done", json.dumps(result)
    db.commit()
    return result
```

### Step 1: claim and hold

Claiming the key and taking the points happen in **one transaction**. Either both happen or neither does. If two copies of the same request arrive at the same moment, only one can insert the key. The other gets an `IntegrityError` and goes down the "seen before" path.

The points are taken with a single `UPDATE ... WHERE points >= 3`. The check and the change happen in the same statement, so two different requests can never both spend the last 3 points.

### Step 2: do the work

The conversion runs **outside** the transaction. Conversions can take seconds, and holding a database transaction open that long blocks other requests.

### Step 3: settle

* **Success:** the hold simply stays. The customer paid 3 points for a finished file.
* **Failure:** a refund row puts the 3 points back.

Either way, the answer is stored on the key, so a retry gets exactly the same answer.

---

## The three answers to a repeated key

When a key has been seen before, the server has three possible answers:

| Situation | Answer | Why |
| --- | --- | --- |
| Same key, same body, finished | `200` with the **stored** response, header `Idempotent-Replayed: true` | This is a retry. Return what the first call returned. |
| Same key, same body, still running | `409 Conflict` | The first call has not finished. The client should wait and retry. |
| Same key, **different** body | `422` | A bug on the client side: one key must mean one operation. |

The request hash is what catches the third case. Without it, a client that reused a key by mistake would get the answer for a *different* file and never notice.

---

## Running it

```text
200 {'status': 'success', 'output': 'site-plan.xlsx', 'points': 3, 'balance': 7}
200 {'status': 'success', 'output': 'site-plan.xlsx', 'points': 3, 'balance': 7}  Idempotent-Replayed: true
422 {'detail': 'This Idempotency-Key was used with a different request.'}
200 {'status': 'failed', 'error': 'could not read the PDF', 'points': 0, 'balance': 7}
```

The account started with 10 points:

* The first call converts the file and holds 3 points. Balance: 7.
* The retry gets the same answer, and the balance is **still 7**.
* Reusing the key for another file is refused.
* A broken PDF with a new key holds 3 points, fails, and gets them back. Balance: **still 7**.

The ledger tells the whole story:

```text
[('hold', -3), ('hold', -3), ('refund', 3)]
```

---

## Things to add in production

* **Expire old keys.** Keep them long enough to cover any retry (24 hours is common), then delete them.
* **Recover stuck jobs.** If the server crashes between step 1 and step 3, a key stays `in_progress` with points held. A small background job should find old `in_progress` keys, refund them and mark them failed.
* **Tell clients how to use it.** Document that the key must be unique per operation and reused on retries. Most retry bugs come from clients that create a new key on every attempt.

---

## Summary

* Networks fail, so clients retry. **A paid API must expect the same request twice.**
* An **`Idempotency-Key`** stored with the answer turns a retry into a replay.
* A **database constraint** is the lock, not application code.
* **Hold, then settle:** take the points before the work, refund them if it fails.
* An **append-only ledger** makes every point explainable.

The result is simple to state: **a customer pays exactly once for each file that converts, and never for one that doesn't.**
