---
title: "R3C"
summary: "Rate Collection Command Center: a live dashboard for collecting hotel rates from many suppliers across a rolling 90-day window."
stack: ["Python", "JavaScript", "Chart.js"]
order: 9
domain: "Hotel and travel tech"
imageAlt: "Concept screen of the R3C Command Center: hotels-with-rate totals, the live processing stream and each supplier's run progress"
imageIsConcept: true
problem: "Hotel rates come from 14 suppliers, for every country and every check-in date. The team needed to see, as it happened, what was running, what was done and what needed a look."
constraints:
  - label: "Sources"
    value: "14 suppliers"
    note: "Each with its own API, request limits and credentials."
  - label: "Window"
    value: "90 check-in days"
    note: "Missing dates are fetched every hour; past dates are cleaned up."
  - label: "Scale"
    value: "Millions of rates"
    note: "Counted per supplier, per check-in date and per country, live."
architecture:
  - { name: "Supplier APIs", kind: "caller" }
  - { name: "Rate workers", kind: "service" }
  - { name: "rate_db", kind: "store" }
  - { name: "Command Center", kind: "service" }
dataModel:
  - "runs"
  - "check-in dates"
  - "countries"
  - "hotel rates"
galleryCaptions:
  - "Every supplier's run at a glance"
  - "Countries lighting up as they are collected"
  - "Starting a run, and the audit log"
---

## What I built

- A live command center for supplier rate collection: totals, a per-minute processing stream and the progress of every supplier's run, refreshed while the page is open.
- A country board that lights up the country each running supplier is collecting, with hotels-with-rate counts for each check-in date.
- Clear run states (running, done, stopped, failed, no heartbeat, wrong credentials, pending), so a run that needs attention stands out at once.
- Run controls for admins (supplier, hotels, check-in dates and workers), a read-only viewer role, and an audit log of run controls and user changes.
- A rolling 90-day check-in window, kept fresh by an hourly job that fetches missing dates and deletes the files of past ones.
