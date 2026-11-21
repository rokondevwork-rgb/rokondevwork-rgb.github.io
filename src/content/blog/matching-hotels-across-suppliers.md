---
title: "Matching 19 Million Hotels: How InnHoSel Finds the Same Hotel Across 29 Suppliers"
description: "The same hotel arrives from dozens of suppliers with different IDs, names and addresses. How candidate search, a match score and a human review queue map them to one master ID."
pubDate: 2026-11-21T14:00:00+06:00
tags: ["Hotel Mapping", "Python", "Data Quality"]
draft: false
---

## The problem: one hotel, many copies

A hotel booking platform does not get its hotels from one place. It gets them from suppliers: wholesalers, bed banks and channel managers. Each supplier sends its own copy of the same hotel, with:

* its own hotel ID
* its own spelling of the name
* its own address format
* its own coordinates, sometimes a few hundred metres off
* its own star rating, sometimes missing

Before a hotel can be sold, every supplier's copy has to point at **one master hotel ID**. Otherwise the same hotel shows up five times in search results, with five different prices and five different photos.

That is what InnHoSel does. Today it covers:

* **29 supplier feeds**
* about **19.6 million supplier hotels** on the supplier servers
* about **14.3 million** of them already mapped to a master ID, with 4.6 million still pending
* more than **3.2 million** matches confirmed by people through the review queue
* a team of **27 users**, each working on their own suppliers

This post explains how the matching works, in a simplified form you can run yourself.

---

## Why exact matching fails

Here is one real hotel, as two suppliers send it:

| Field | Supplier A | Supplier B |
| --- | --- | --- |
| Name | Orange Hotel (Yuyao Colorful City) | Orange Hotel Yuyao Colorful City |
| Address | No. 468 Yeshan Road | No. 468 Yezhan Road, Yuyao, Ningbo |
| Stars | 3 | 3 |
| Coordinates | 30.0685, 121.182 | 30.0685, 121.182 |

A human sees at once that this is the same hotel. A computer comparing strings sees two different names (brackets) and two different streets (*Yeshan* versus *Yezhan*). An exact match on name or address finds nothing.

So matching has to be **fuzzy**, and it has to look at several fields together.

---

## Step 1: Normalise before you compare

Most of the difference between two copies is noise: capital letters, brackets, the word "hotel", extra spaces. Removing it first makes every later comparison fairer.

```python
import re

NOISE = re.compile(r"\b(hotel|hotels|the|by|and|&)\b|[^\w\s]")


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", NOISE.sub(" ", text.lower())).strip()


norm("Orange Hotel (Yuyao Colorful City)")  # 'orange yuyao colorful city'
```

---

## Step 2: Only compare hotels that are close

Comparing every hotel with every other hotel is impossible at this size. 19.6 million hotels compared pairwise is around 190 trillion comparisons.

The trick is called **blocking**: put hotels into buckets, and only compare hotels inside the same or neighbouring buckets. For hotels, location is the obvious bucket. Two copies of the same hotel are almost never more than a few kilometres apart.

```python
import math


def grid_key(lat: float, lng: float, size: float = 0.05) -> tuple[int, int]:
    """Cells of about 5 km: only hotels in nearby cells are compared."""
    return (math.floor(lat / size), math.floor(lng / size))
```

Every hotel goes into its cell once. To find candidates for a hotel, look in its own cell and the 8 cells around it. That turns trillions of comparisons into a few dozen per hotel.

---

## Step 3: Score each candidate

Each candidate gets one number that says how close it is to the source hotel. In my simplified version the score runs from 0 to 100 and mixes four signals:

* **Name similarity** (the strongest signal)
* **Distance** between the coordinates
* **Address similarity**
* **Stars**, as a small tie-breaker

For name and address I use [RapidFuzz](https://github.com/rapidfuzz/RapidFuzz). `token_set_ratio` ignores word order and extra words, which fits hotel names well.

```python
from dataclasses import dataclass

from rapidfuzz import fuzz


@dataclass
class Hotel:
    supplier: str
    hotel_id: str
    name: str
    address: str
    lat: float
    lng: float
    stars: int | None


def km_between(a: Hotel, b: Hotel) -> float:
    """Haversine distance in kilometres."""
    r = 6371.0
    p1, p2 = math.radians(a.lat), math.radians(b.lat)
    dp, dl = p2 - p1, math.radians(b.lng - a.lng)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def score(source: Hotel, cand: Hotel) -> float:
    """0-100. Name matters most, then distance, then address and stars."""
    name = fuzz.token_set_ratio(norm(source.name), norm(cand.name))
    km = km_between(source, cand)
    distance = max(0.0, 100 - km * 20)  # 0 km -> 100, 5 km or more -> 0
    address = fuzz.token_set_ratio(norm(source.address), norm(cand.address))
    if source.stars is None or cand.stars is None:
        stars = 50
    else:
        stars = 100 if source.stars == cand.stars else 60 if abs(source.stars - cand.stars) == 1 else 0
    return round(0.50 * name + 0.30 * distance + 0.15 * address + 0.05 * stars, 1)
```

Then rank the candidates from the nearby cells, skipping hotels from the same supplier:

```python
def candidates(source: Hotel, index: dict) -> list[tuple[float, Hotel]]:
    gx, gy = grid_key(source.lat, source.lng)
    nearby = [h for dx in (-1, 0, 1) for dy in (-1, 0, 1) for h in index.get((gx + dx, gy + dy), [])]
    ranked = [(score(source, h), h) for h in nearby if h.supplier != source.supplier]
    return sorted(ranked, key=lambda pair: pair[0], reverse=True)
```

Running it for the Orange Hotel against four nearby hotels:

```text
 96.4  agoda  Orange Hotel Yuyao Colorful City
 64.3  agoda  Orange Hotel Yuyao International Convention and Exhibition Center
 53.2  ean    Hilton Yuyao
 52.2  agoda  Fairfield by Marriott Yuyao
```

The real match is far ahead. The second candidate is interesting: same brand, same city, 2 km away. That is exactly the kind of hotel that fools a matcher which only looks at names.

---

## Step 4: Let people decide the hard cases

A score is not a decision. Some matches are obvious, but many are not:

* two hotels of the same chain on the same street
* a hotel that was renamed
* a supplier with wrong coordinates
* a serviced apartment and a hotel in the same building

So in InnHoSel a pending hotel does not get mapped on its score alone. It goes into a **review queue** with its best candidates already ranked. (Some hotels arrive already mapped by the provider or by a base mapping; the queue is for the rest.) The reviewer sees the source hotel on one side (name, address, coordinates, stars, supplier IDs) and the candidates on the other, best first. Then they choose one of three things:

1. **Confirm the best match.** One click, and the supplier hotel gets that master ID.
2. **Pick another candidate**, when the top one is wrong.
3. **Create a new ID** or a new mapping, when the hotel truly does not exist yet.

The reviewer never searches for a match from scratch. The system does the searching, and the person makes the decision. That is why one team can confirm millions of matches.

A few things make the queue work at scale:

* **Focus suppliers.** Each reviewer works on their own set of suppliers, so two people never review the same hotel.
* **Permissions per user.** Admins choose which suppliers each person can see.
* **Progress per supplier.** The dashboard shows done versus pending for every supplier server, so it is clear where the work is.

---

## Step 5: Keep up with new hotels

Supplier data never stops changing. New hotels appear, old IDs get updated, and some suppliers change thousands of records in one day.

An ID-separation script runs every day and splits each supplier's records into **new hotel IDs** and **updated hotel IDs**. The Change Log page shows those counts per supplier and per day, so the team can see when a supplier suddenly sends a large batch. New IDs go through matching and into the review queue.

---

## What I learned

* **Normalise first.** Most of the "difference" between two copies is formatting.
* **Block by location.** Without it, the problem does not fit in any amount of time.
* **Score with several fields.** A name alone matches the wrong hotel of the same chain.
* **Rank, don't decide.** A good ranking plus a person beats a fully automatic matcher on data this messy.
* **Measure the pipeline.** Done versus pending per supplier tells you more than one global accuracy number.

The code in this post is a simplified version, written to explain the idea. A production matcher also needs language-aware normalisation, transliteration for non-Latin names, and a lot of supplier-specific rules. The basic shape stays the same, though: **find nearby candidates, score them, and let a person confirm.**
