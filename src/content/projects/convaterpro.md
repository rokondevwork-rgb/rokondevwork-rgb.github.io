---
title: "ConvaterPro"
summary: "A web conversion platform for GIS, survey, mapping and engineering teams: 29 file conversions in one workspace, with per-user access, a points ledger and a REST API."
stack: ["Python", "FastAPI", "Next.js", "PostgreSQL"]
order: 4
domain: "Data conversion for GIS and engineering teams"
link: "https://convaterpro.innsightmap.com/"
imageAlt: "ConvaterPro admin dashboard: points issued, active users, API requests, recent point activity, top point holders and system status"
imageIsConcept: false
problem: "Survey and engineering teams move data between PDFs, plan sets, spreadsheets, images and archives every day. They used a different tool for each job, with no control over who could run what and no record of what each conversion cost."
constraints:
  - label: "Tools"
    value: "29 conversions"
    note: "Tabular, documents and office, PDF and plan sets, imagery, and packaging, all in one workspace."
  - label: "Billing"
    value: "3 points a job"
    note: "Points are held when a job starts and refunded if it fails, so nobody pays for a failed run."
  - label: "Access"
    value: "4 roles"
    note: "Plus tool permissions per user: each account only sees the conversions it may run."
architecture:
  - { name: "Next.js web app", kind: "caller" }
  - { name: "Bearer auth", kind: "gate" }
  - { name: "FastAPI v2 / v3", kind: "service" }
  - { name: "Conversion workers", kind: "service" }
  - { name: "PostgreSQL", kind: "store" }
dataModel:
  - "users: role · tool permissions"
  - "conversions: tool · file · status · points · created_at"
  - "points ledger: hold · charge · refund · top-up"
  - "api keys: idempotency keys · usage"
results:
  - "One workspace instead of a separate tool for every format."
  - "Failed jobs refund their points on their own, and every job is logged with file, status, cost and time."
  - "Teams can script it through the REST API, and retries never charge twice."
galleryCaptions:
  - "App Center: every allowed tool, grouped and searchable"
  - "A conversion: upload, options, response summary and history"
  - "Usage dashboard: 30-day volume, success rate and top tools"
---

## What I built

- **App Center:** 29 conversion tools in five groups (tabular data, documents and office, PDF and plan sets, imagery, packaging), searchable and filtered by what each user is allowed to run.
- **Conversion workspace:** upload a file, set the options the tool needs, and read the result from a response summary with status, cost, balance and job ID.
- **Built-in preview** for 11 file types (PDF, Word, Excel, CSV, PowerPoint, Markdown, JSON, XML, YAML, images, and text and code), plus page organizing and a background-removal studio.
- **Points ledger:** a flat 3 points per conversion. Points are held when a job starts, charged when it succeeds and refunded when it fails. Every job is logged with file name, status, cost and time, and the result can be downloaded from history for 30 minutes.
- **Access control:** four roles and tool permissions per user, so each account only exposes the conversions that person should run.
- **Dashboards:** request volume over 30 days, success and failure share, most-used tools and recent activity for users, and points issued, active users, flagged activity and system status for admins.
- **REST API with Bearer tokens:**
  - v2 for login, token refresh and the current user.
  - v3 for conversions, points balance, permissions, dashboard data and admin.
  - An `Idempotency-Key` header, so a script that retries never pays twice.
- **Deployment:** a free 8-day demo account, and a private deployment option for teams that need to run it on their own infrastructure.
