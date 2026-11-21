---
title: "Supplier Data Is Messy: Cleaning Hotel Data on the Way In"
description: "Star ratings like \"4*\", names in ALL CAPS and coordinates that are not numbers. How I validate and normalise supplier hotel data with Pydantic before it reaches the database."
pubDate: 2026-11-21T12:00:00+06:00
tags: ["Python", "Pydantic", "Data Quality"]
draft: false
---

## Garbage in, garbage everywhere

Hotel data comes from suppliers, and every supplier has its own idea of what a field means. Here are four records for hotels in Dhaka, one from each supplier:

```json
[
  {"supplier": "alpha", "hotel_id": "A-1",  "name": "EXAMPLE GRAND - DHAKA", "stars": "4*",   "geo": "23.7925,90.4078", "country": "bd"},
  {"supplier": "beta",  "hotel_id": "B-77", "name": "  example grand dhaka ", "stars": "****", "lat": 23.7926, "lng": 90.4079, "country": "BD"},
  {"supplier": "gamma", "hotel_id": "G-9",  "name": "Example Grand Dhaka",    "stars": "4.0",  "geo": "23.79,abc",       "country": "BD"},
  {"supplier": "delta", "hotel_id": "",     "name": "",                       "stars": "seven", "lat": 123, "lng": 90.4,  "country": "Bangladesh"}
]
```

In just four records:

* Stars come as `"4*"`, `"****"`, `"4.0"` and `"seven"`.
* Names are ALL CAPS, all lower case with extra spaces, or have a dash in the middle.
* Location is one `"geo"` string for some suppliers and two numbers for others.
* One record has a latitude of 123, which does not exist on Earth.
* Country is `"bd"`, `"BD"` or `"Bangladesh"`.

If this goes straight into the database, every query, every search filter and every matching step after it has to deal with the mess again. So I deal with it **once, on the way in**.

The rule I follow: **every record leaves the import step either clean or rejected with a reason.** Nothing half-clean gets through.

---

## The tool: a Pydantic model

[Pydantic](https://docs.pydantic.dev/) turns this into one class. Each field says what it must be, and validators fix what can be fixed before the type check runs.

```python
import re
import unicodedata

from pydantic import BaseModel, Field, ValidationError, field_validator

SMALL_WORDS = {"and", "of", "the", "de", "la", "by"}


def tidy_name(raw: str) -> str:
    text = unicodedata.normalize("NFC", raw)
    text = re.sub(r"\s*[-–|/]\s*", " ", text)  # "GRAND - DHAKA" -> "GRAND DHAKA"
    text = re.sub(r"\s+", " ", text).strip()
    if text.isupper() or text.islower():
        words = text.lower().split(" ")
        text = " ".join(
            w if i and w in SMALL_WORDS else w.capitalize() for i, w in enumerate(words)
        )
    return text


class SupplierHotel(BaseModel):
    supplier: str
    hotel_id: str = Field(min_length=1)
    name: str
    stars: int | None = Field(default=None, ge=0, le=5)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    country: str = Field(pattern=r"^[A-Z]{2}$")

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("name is empty")
        return tidy_name(v)

    @field_validator("stars", mode="before")
    @classmethod
    def parse_stars(cls, v):
        if v in (None, "", "N/A", "-"):
            return None
        if isinstance(v, (int, float)):
            return round(v)
        match = re.search(r"\d+(\.\d+)?", str(v))  # "4*", "4 stars", "4.0"
        if match:
            return round(float(match.group()))
        if str(v).count("*") or str(v).count("★"):
            return str(v).count("*") + str(v).count("★")  # "****"
        raise ValueError(f"cannot read stars from {v!r}")

    @field_validator("country", mode="before")
    @classmethod
    def upper_country(cls, v: str) -> str:
        return str(v).strip().upper()
```

A few choices worth explaining:

* **`mode="before"` validators** run on the raw value, before Pydantic checks the type. That is where `"4*"` becomes `4`.
* **Range checks live on the field** (`ge=-90, le=90`), not in custom code. They are easy to read and Pydantic reports them clearly.
* **Names only get re-cased when they are all one case.** `"McDonald's Hotel"` is left alone; `"EXAMPLE GRAND"` becomes `"Example Grand"`.
* **Country must be a two-letter code.** I do not try to turn `"Bangladesh"` into `"BD"` here, because a lookup table that is wrong is worse than a clear rejection. That mapping belongs in its own tested step.

---

## Fix the shape before the fields

Some suppliers send one `"geo"` string instead of `lat` and `lng`. That is a difference in **shape**, not in value, so I fix it before the model sees the record:

```python
def split_geo(record: dict) -> dict:
    """Some feeds send one "geo" string instead of lat and lng."""
    geo = record.pop("geo", None)
    if geo is not None:
        parts = [p.strip() for p in str(geo).split(",")]
        if len(parts) != 2:
            raise ValueError(f"geo must be 'lat,lng', got {geo!r}")
        record["lat"], record["lng"] = parts
    return record
```

Pydantic then turns `"23.7925"` into a float, and refuses `"abc"`.

---

## Running the import

```python
clean, rejected = [], []
for record in raw_feed:
    try:
        clean.append(SupplierHotel.model_validate(split_geo(dict(record))))
    except (ValidationError, ValueError) as err:
        rejected.append((record["supplier"], record["hotel_id"], err))
```

The two good records come out identical, even though they came from different suppliers in different formats:

```text
{'supplier': 'alpha', 'hotel_id': 'A-1',  'name': 'Example Grand Dhaka', 'stars': 4, 'lat': 23.7925, 'lng': 90.4078, 'country': 'BD'}
{'supplier': 'beta',  'hotel_id': 'B-77', 'name': 'Example Grand Dhaka', 'stars': 4, 'lat': 23.7926, 'lng': 90.4079, 'country': 'BD'}
```

That matters a lot later. When two supplier records look the same, a matcher can see that they are the same hotel.

The other two are rejected, **with every problem listed at once**:

```text
gamma G-9 [('lng', 'Input should be a valid number, unable to parse string as a number')]
delta (no id) [('hotel_id', 'String should have at least 1 character'),
               ('name', 'Value error, name is empty'),
               ('stars', "Value error, cannot read stars from 'seven'"),
               ('lat', 'Input should be less than or equal to 90'),
               ('country', "String should match pattern '^[A-Z]{2}$'")]
```

Pydantic does not stop at the first error. One run tells you everything that is wrong with a record, which is exactly what you want to send back to a supplier.

---

## What to do with rejected records

Rejected does not mean deleted. I keep them, with:

* the supplier and the supplier's hotel ID
* the raw record, exactly as it arrived
* the list of errors
* the time of the import

This gives three things:

1. **A report per supplier.** If one supplier suddenly has 10% of its records rejected, something changed on their side, and you can tell them exactly what.
2. **A way to re-run.** When a validator gets smarter (for example, it learns to read `"seven"`), the stored raw records can be imported again.
3. **Trust.** Everything downstream can assume that `stars` is a number from 0 to 5 and `lat` is a real latitude. No query has to check again.

---

## Use it in FastAPI too

The same model works as the body of an API endpoint. FastAPI validates the request with it, and a bad record gets a `422` response that lists every field error:

```python
from fastapi import FastAPI

app = FastAPI()


@app.post("/hotels", status_code=201)
def add_hotel(hotel: SupplierHotel):
    # hotel is already clean here
    return hotel
```

One model, one set of rules, for both the bulk import and the API.

---

## Summary

* Clean data **once, at the edge**, not in every query.
* Fix the **shape** first, then the **values**, then **check** them.
* Make every record end up **clean or rejected with reasons**.
* **Keep the rejects**, so you can report them and import them again.

This is the first of three principles I build on: *trust the data*. If the data at the bottom is wrong, nothing built on top of it can be right.
