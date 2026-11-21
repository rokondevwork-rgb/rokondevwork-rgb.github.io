---
title: "Test Email Without Spamming Anyone: MailHog, Celery and FastAPI"
description: "Catch every email your app sends during development: MailHog as a fake SMTP server, Celery to send in the background, and FastAPI on top. Plus how to check emails in automated tests."
pubDate: 2026-11-21T10:00:00+06:00
tags: ["FastAPI", "Celery", "Docker", "Email"]
draft: false
---

## Why you need a fake mail server

Sooner or later every backend sends email: sign-up confirmations, password resets, reminders, reports. Testing that during development is awkward:

* With a real SMTP account, test emails go to real people. One wrong seed script and a customer gets "Hello {name}".
* With no SMTP server at all, the code that sends email never runs, so its bugs show up in production.

The answer is a **fake SMTP server**. It accepts every email like a real one, but instead of delivering it, it keeps it and shows it in a web inbox. **MailHog** is the classic one:

* SMTP server on port **1025**
* Web inbox and JSON API on port **8025**

In this post we put it together with **Celery** (so email is sent in the background) and **FastAPI** (so a request returns at once).

```text
FastAPI ──► Redis (queue) ──► Celery worker ──► MailHog (SMTP :1025)
                                                  │
                                       you, at http://localhost:8025
```

> **A note on MailHog:** it still works, but it has had no real release since 2020 and is no longer maintained. [Mailpit](https://github.com/axllent/mailpit) is the maintained replacement and uses the **same ports**, so everything below works with it too. Just swap the image for `axllent/mailpit`.

---

## Step 1: Start Redis and MailHog

`docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # web inbox
```

```bash
docker compose up -d
```

Open http://localhost:8025. The inbox is empty for now.

---

## Step 2: The Celery task that sends the email

Install the packages:

```bash
pip install fastapi uvicorn "celery[redis]" "pydantic[email]"
```

`tasks.py`:

```python
import os
import smtplib
from email.message import EmailMessage

from celery import Celery

celery = Celery("mail", broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"))

SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
MAIL_FROM = os.getenv("MAIL_FROM", "hello@example.com")


@celery.task(
    autoretry_for=(smtplib.SMTPException, ConnectionError),
    retry_backoff=True,
    max_retries=5,
)
def send_welcome(to: str, name: str) -> None:
    msg = EmailMessage()
    msg["From"] = MAIL_FROM
    msg["To"] = to
    msg["Subject"] = f"Welcome, {name}"
    msg.set_content(f"Hi {name},\n\nYour account is ready.\n")
    msg.add_alternative(f"<p>Hi {name},</p><p>Your account is <b>ready</b>.</p>", subtype="html")

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
        smtp.send_message(msg)
```

Things to notice:

* **SMTP settings come from environment variables.** In development they point at MailHog. In production you set them to your real provider. The code does not change.
* **Each email has a plain-text part and an HTML part.** MailHog shows both, so you can check that the plain version still reads well.
* **Retries are automatic.** If the mail server is down for a moment, Celery tries again with growing delays (`retry_backoff`) up to 5 times, instead of losing the email.

---

## Step 3: The FastAPI endpoint

`main.py`:

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

from tasks import send_welcome

app = FastAPI()


class SignUp(BaseModel):
    email: EmailStr
    name: str


@app.post("/signup", status_code=202)
def signup(body: SignUp):
    # ...save the user here...
    send_welcome.delay(body.email, body.name)
    return {"queued": True}
```

`send_welcome.delay(...)` puts a message on the Redis queue and returns straight away. The user does not wait for an SMTP conversation, and a slow mail server can never make your API slow. The response is `202 Accepted`, which means exactly that: accepted, and it will happen soon.

---

## Step 4: Run it

Two terminals:

```bash
# terminal 1: the worker
celery -A tasks worker --loglevel=info

# terminal 2: the API
uvicorn main:app --reload
```

Send a sign-up:

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Rokon"}'
```

```json
{"queued": true}
```

The worker log shows the task running, and the email appears at http://localhost:8025 a moment later. You can open it, switch between the HTML and plain-text views, and see the raw headers. Nobody's real inbox was touched.

---

## Step 5: Check emails in automated tests

MailHog also has a JSON API on the same port, so a test can check what was sent instead of only checking that no error was raised.

```python
import httpx

from tasks import send_welcome

MAILHOG = "http://localhost:8025"


def test_welcome_email():
    httpx.delete(f"{MAILHOG}/api/v1/messages")   # start with an empty inbox

    send_welcome("test@example.com", "Rokon")    # call the task directly, no worker needed

    messages = httpx.get(f"{MAILHOG}/api/v2/messages").json()
    assert messages["total"] == 1
    headers = messages["items"][0]["Content"]["Headers"]
    assert headers["Subject"] == ["Welcome, Rokon"]
    assert headers["To"] == ["test@example.com"]
```

Calling `send_welcome(...)` directly (without `.delay`) runs the task in the test process. The test needs MailHog running, but not Redis or a Celery worker.

> With Mailpit, the API paths differ: messages are at `/api/v1/messages` and the JSON is flatter. The idea is the same.

---

## Step 6: Put the app in Docker too (optional)

If your API and worker also run in Docker Compose, point them at the service names instead of `localhost`:

```yaml
  api:
    build: .
    command: uvicorn main:app --host 0.0.0.0
    environment:
      CELERY_BROKER_URL: redis://redis:6379/0
      SMTP_HOST: mailhog
      SMTP_PORT: "1025"
    ports:
      - "8000:8000"

  worker:
    build: .
    command: celery -A tasks worker --loglevel=info
    environment:
      CELERY_BROKER_URL: redis://redis:6379/0
      SMTP_HOST: mailhog
      SMTP_PORT: "1025"
```

Inside Docker, `localhost` means "this container", so `SMTP_HOST: mailhog` is the most common thing people forget.

---

## Summary

* Use a **fake SMTP server** in development, so no test email ever reaches a real person.
* Send email from a **background task**, so the API stays fast and failures are retried.
* Keep **SMTP settings in environment variables**, so the same code works in development and production.
* **Check emails in tests** through the inbox API, not just "no error was raised".

MailHog taught a lot of developers this habit. For a new project, Mailpit gives you the same setup and is still maintained.
