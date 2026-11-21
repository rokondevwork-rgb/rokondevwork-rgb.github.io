---
title: "InnHoSel"
summary: "A hotel mapping panel that matches every supplier's hotels to one master ID: 29 suppliers, about 19.6 million supplier hotels, scored candidates and a human review queue."
stack: ["Python", "FastAPI", "MySQL", "Next.js", "Linux"]
featured: true
order: 3
domain: "Hotel and travel tech"
imageAlt: "Recreated InnHoSel dashboard: users, hotels verified, active suppliers and coverage, an ITTID coverage ring at 75% and each supplier's done-versus-pending pipeline"
imageIsConcept: true
problem: "The same hotel arrives from dozens of suppliers, each with its own ID, spelling and address. Before a hotel can be sold, every supplier's copy has to point at one master hotel ID, and most of that matching was done by hand."
constraints:
  - label: "Suppliers"
    value: "29 feeds"
    note: "Each with its own hotel IDs, names, addresses and data quality."
  - label: "Scale"
    value: "19.6M hotels"
    note: "Supplier hotels on the servers; about 14.3 million already carry a master ID."
  - label: "Team"
    value: "27 users"
    note: "Reviewers, admins and superusers, each with their own suppliers to work on."
architecture:
  - { name: "Supplier feeds", kind: "caller" }
  - { name: "ID-separation script", kind: "service" }
  - { name: "Matching and scoring API", kind: "service" }
  - { name: "MySQL", kind: "store" }
  - { name: "Review panel", kind: "service" }
dataModel:
  - "hotels: itt_id · supplier · hotel_id · status · score"
  - "candidates: source · match · score"
  - "change log: day · supplier · new · updated"
  - "users: role · supplier permissions · focus suppliers"
results:
  - "14.3 million supplier hotels mapped to a master ID, with 4.6 million still pending."
  - "More than 3.2 million hotels confirmed by people through the review queue."
  - "Reviewers see the best match first and confirm it in one click, instead of searching for it."
galleryCaptions:
  - "Reviewing a match: the source hotel and its scored candidates"
  - "The un-verified queue, filtered to my focus suppliers"
  - "Change log: new and updated hotel IDs per day"
---

## What I built

- **Matching and scoring:** each supplier hotel is compared with hotels from the other suppliers by name, address, coordinates and stars. The candidates are ranked by a score, so the closest match comes first.
- **Review queue:** un-verified hotels come with their best candidates. A reviewer checks the source hotel, picks a match (or creates a new ID or a new mapping) and confirms it in one step.
- **Supplier dashboard:**
  - Users, hotels verified, active suppliers and coverage, compared with last week.
  - Master-ID coverage across all suppliers.
  - A done-versus-pending pipeline for every supplier server.
  - Who verified what, day by day.
- **Change log:** daily counts of new and updated hotel IDs from the ID-separation script, per supplier and per month. Click a day to see its hotel IDs.
- **Access control:** users, admins and superusers, with supplier permissions per user and "focus suppliers", so each reviewer only works on their own queue. Every user also has a profile with their own stats.
- **Tools for checking hotels:**
  - Hotel and provider lookups, ITT hotel search and search by name.
  - A primary-photo check.
  - An API log.
  - Lambda searches for hotels and rates near a place or a hotel, across all suppliers.
