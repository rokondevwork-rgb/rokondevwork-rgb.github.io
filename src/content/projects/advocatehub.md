---
title: "AdvocateHub"
summary: "Legal practice management SaaS for law firms and advocates: clients, cases, hearing dates, documents, reminders, billing, and a client portal."
stack: ["Next.js", "React.js", "TypeScript", "FastAPI", "Python", "MySQL", "Redis", "Celery", "Docker"]
order: 7
---

## What I built

- A multi-tenant SaaS where each law firm gets its own private workspace for clients, cases, hearings, meetings, tasks, notes, and documents.
- A hearing and meeting tracker with a shared calendar and automatic reminders by in-app notification, email, SMS, and WhatsApp, so lawyers stop missing dates.
- A client portal where the firm's clients see case status, the next hearing date, shared documents, and invoices, and can message the lawyer instead of phoning for updates.
- Billing for firms (subscription plans, trials, usage limits, online payment) and for their clients (fee agreements, time and expenses, invoices, payments).
- A platform admin console to manage firms, plans, trials, offline payments, and data export or deletion.
- A Bangla and English interface built for Bangladeshi practice: local courts and judges, a court holiday calendar, and a court fee calculator.

## Who it is for

| User | What they get |
| --- | --- |
| Solo advocate | One place for every client, case, and hearing date, on a low-cost plan |
| Law firm or chamber | Team roles and permissions, task assignment, shared calendar, reports, audit log |
| The firm's clients | A free portal for case status, next date, documents, and messages |
| Platform operator | A console for firms, subscriptions, revenue, and support |

## Key features

- **Clients and cases** with custom fields, tags, case parties, and a conflict-of-interest check against opposite parties at intake.
- **Hearings** with next date, adjournment history, court notes, and a warning when a date falls on a court holiday.
- **Documents** in per-case folders with versioning, virus scanning, previews, sharing with the client, and acknowledgement receipts.
- **Notes** kept strictly internal or shared with the client, so private notes never reach the portal.
- **Public intake link** that turns website or walk-in enquiries into screened leads.
- **Global search** across clients, cases, case numbers, mobile numbers, and document text.
- **Dashboard and reports** showing today's hearings, upcoming dates, outstanding fees, and firm performance, with CSV export.
- **Integrations**: SSLCommerz payments, SMS gateway, WhatsApp Business, Google and Outlook calendar sync, push notifications (installable PWA), and API keys with webhooks.
- **AI assistance** that summarizes cases and documents and classifies uploaded files.

## How it works

```mermaid
flowchart LR
    subgraph Users
        L["Lawyers and staff"]
        C["Clients (portal)"]
        A["Platform admin"]
    end

    L --> W["Next.js web app"]
    C --> W
    A --> W

    W -->|"REST API"| API["FastAPI backend"]
    API --> DB[("MySQL")]
    API --> R[("Redis")]
    API --> S[("S3 document storage")]

    R --> WK["Celery workers"]
    WK --> N["Email, SMS, WhatsApp, push"]
    WK --> P["Payments and calendar sync"]
    WK --> AI["AI summaries and OCR"]
    WK --> DB
```

The web app handles the screens; the backend owns all business rules and data. Anything slow (sending reminders, scanning uploads, generating reports, AI work) runs in background workers, so the app stays fast for the user.

## A case from start to finish

```mermaid
flowchart TD
    A["Enquiry via intake link or walk-in"] --> B["Client added"]
    B --> C{"Conflict check"}
    C -->|"Clear"| D["Case opened"]
    C -->|"Match found"| X["Flagged for the lawyer to review"]
    D --> E["Hearing scheduled"]
    E --> F["Reminders sent to lawyer and client"]
    F --> G["Hearing held or adjourned"]
    G -->|"Next date set"| E
    G -->|"Judgment"| H["Case disposed"]
    D --> T["Tasks, notes, documents"]
    D --> I["Invoice and payment"]
    H --> Z["Archived"]
```

## How a reminder reaches the client

```mermaid
sequenceDiagram
    participant Lawyer
    participant App as AdvocateHub
    participant Worker as Background worker
    participant Client

    Lawyer->>App: Sets next hearing date
    App->>App: Checks court holiday calendar
    App->>Worker: Schedules reminders
    Worker-->>Lawyer: In-app and email reminder
    Worker-->>Client: SMS or WhatsApp reminder
    Client->>App: Opens portal to see case status and documents
```

## Subscription lifecycle

```mermaid
stateDiagram-v2
    [*] --> Trial: Firm signs up
    Trial --> Active: Pays for a plan
    Trial --> Expired: Trial ends unpaid
    Active --> PastDue: Payment missed
    PastDue --> Active: Payment received
    PastDue --> Expired: Grace period ends
    Expired --> Active: Renews
    Active --> Cancelled: Firm cancels
    note right of Expired: Read-only, data kept
```

A firm whose subscription lapses moves to read-only mode instead of being locked out, so its records are never lost.

## Security and data protection

- Every firm's data is isolated, and an automated test suite checks that no firm can read another firm's records.
- Role-based permissions (owner, admin, senior and junior lawyer, paralegal, staff, accountant), with an audit log of every change.
- Optional two-factor sign-in and session management.
- Uploaded files are virus-scanned and served through short-lived, signed links.
- Firms can export all their data or request deletion.
