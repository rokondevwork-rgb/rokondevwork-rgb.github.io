---
title: "Hotel Content API"
summary: "Content provider API platform serving normalized hotel content to B2B clients."
stack: ["FastAPI", "MySQL", "SQLAlchemy", "JWT", "Redis", "Docker"]
featured: true
order: 1
domain: "Hotel and travel tech"
imageAlt: "Concept screen of the Hotel Content API docs: a property endpoint with its parameters and a JSON response"
imageIsConcept: true
problem: "Every supplier describes the same hotel differently. Clients wanted one answer."
constraints:
  - label: "Data volume"
    value: "Large datasets"
    note: "Content for many properties that must stay fast to query."
  - label: "Sources"
    value: "Many suppliers"
    note: "XML and JSON in different shapes and quality."
  - label: "Access"
    value: "Per client"
    note: "Each client sees only the content it is allowed to."
architecture:
  - { name: "B2B client", kind: "caller" }
  - { name: "JWT auth", kind: "gate" }
  - { name: "FastAPI", kind: "service" }
  - { name: "Redis", kind: "store" }
  - { name: "MySQL", kind: "store" }
dataModel:
  - "properties"
  - "rooms"
  - "images"
  - "amenities"
excavation:
  raw:
    - { supplier: "A", text: "EXAMPLE GRAND - DHAKA" }
    - { supplier: "B", text: "example grand dhaka" }
    - { supplier: "C", text: "Exmpl Grand Htl Dhk" }
  clean: "DAC0412 · Example Grand Dhaka"
  feeds: ["A xml", "B json", "C xml", "D json", "E xml", "F json"]
  keys:
    - { name: "Key 1 · content", ok: true }
    - { name: "Key 2 · rooms", ok: true }
    - { name: "Key 3 · images", ok: false }
  answer: '{ "id": "DAC0412", "name": "Example Grand Dhaka", "rooms": [ … ], "images": [ … ] }'
  outcome: "One clean answer per hotel, for every client"
  readout:
    - "3 spellings → 1 record"
    - "6 feeds · 3 client keys"
    - "request → cache → answer"
    - "4 tables written"
    - "clean JSON sent"
  log:
    - "normalize · supplier B · DAC0412 · name, stars, geo ✓"
    - "dedupe · A + B + C → DAC0412"
    - "cache · set properties:DAC0412"
    - "auth · key 2 · scope rooms ✓"
    - "reject · key 3 · images not in scope"
    - "write · rooms × 3 · images × 12"
galleryCaptions:
  - "API usage dashboard"
  - "B2B clients and their scopes"
  - "Try-it request and response"
---

## What I built

- REST APIs serving normalized hotel content (properties, rooms, images, and amenities) to B2B clients.
- JWT authentication and access control for client access.
- Optimized MySQL queries for large datasets.
