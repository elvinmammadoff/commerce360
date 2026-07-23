# Architecture

High-level map of how Orbittify fits together. This describes *responsibilities
and data flow*, not implementation. For deploy mechanics see
[deployment.md](./deployment.md); for the *why* behind these choices see
[decisions.md](./decisions.md).

## Components

| Component      | Responsibility                                                        |
|----------------|-----------------------------------------------------------------------|
| Browser        | The customer- and admin-facing UI.                                    |
| Next.js        | Renders the app (SSR + Server Actions), proxies auth, serves uploads. |
| Laravel API    | Source of truth: auth, workspaces, products, jobs, credits, notifications. |
| Worker (Node)  | Runs the render pipeline for a queued job.                            |
| Laravel queue  | Processes deferred backend work (e.g. sending emails).                |
| PostgreSQL     | Primary datastore.                                                    |
| Redis          | Cache + queue backend.                                                |

Two runtimes on purpose: PHP/Laravel owns business state and APIs; Node owns the
media-heavy render pipeline. They talk over HTTP, never share a process.

## Request flow (typical page)

```
Browser
  → Next.js (SSR / Server Action, attaches the session token)
    → Laravel API (Sanctum-authenticated)
      → PostgreSQL / Redis
```

The browser never calls Laravel directly for authenticated data — Next.js holds
the session cookie and makes the call server-side. This is why client components
must not import server-only modules (see ADR-005 in decisions.md).

## Render flow

```
User starts a render
  → Laravel creates a queued job (debits a credit)
  → Worker (Node) picks it up and runs the pipeline:
       normalize → detect → render (orbit) → frames → 3D (geo) → marketplace → package
  → Worker reports progress/finish back to Laravel:  PATCH /api/jobs/{id}
  → On completed/failed, Laravel:
       - writes an in-app notification (always)
       - queues an email if the user's preference for that event is on
  → Rendered assets are served back through Next.js at /api/uploads/...
```

The worker never writes notifications or emails itself — it only reports job
status. All notification logic lives in one place in Laravel (see ADR-004).

## Notifications & email

- **In-app bell** = full history. Always shows every render event, regardless of
  settings.
- **Email** = opt-out, per-event. The Settings "Email notifications" switches
  control email only. Emails are transactional and queued.
- Only `render_completed` and `render_failed` are wired today. `weekly_digest`
  and `product_news` are separate, not-yet-built flows.

## Auth

- Email/password and Google OAuth both end in a Sanctum token stored in an
  httpOnly cookie by Next.js.
- Middleware gates `/admin/*` on a role cookie.

## What is NOT here yet

- Real email delivery (provider account + domain verification pending; code is
  ready behind a log driver).
- Stripe payments (stub deployed, keys deferred).
- Weekly-digest / product-news emails.
- Marketplace Compliance engine.
