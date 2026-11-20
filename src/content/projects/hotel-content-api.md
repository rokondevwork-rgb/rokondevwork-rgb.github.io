---
title: "Hotel Content API"
summary: "Content provider API platform serving normalized hotel content to B2B clients."
stack: ["FastAPI", "MySQL", "SQLAlchemy", "JWT", "Redis", "Docker"]
featured: true
order: 1
domain: "Hotel and travel tech"
image: "../../assets/projects/hotel-content-api.jpg"
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
---

## What I built

- REST APIs serving normalized hotel content (properties, rooms, images, and amenities) to B2B clients.
- JWT authentication and access control for client access.
- Optimized MySQL queries for large datasets.
