# Architecture Decision Records

Each ADR records *why* a design choice was made, so the reasoning survives even
after the code changes. If a decision is later reversed, add a new ADR that
supersedes the old one rather than editing history.

Where the original rationale isn't evident from the code or our discussions, the
Reason is left as **`TODO: Confirm with project owner`** rather than guessed —
please fill those in.

---

## ADR-001 — Laravel as the backend, separate from Next.js API routes

- **Status:** Accepted
- **Context:** The frontend is Next.js, which can itself expose API routes. We
  instead run a separate Laravel application as the source of truth.
- **Decision:** Business state and APIs (auth, workspaces, products, jobs,
  credits, notifications) live in Laravel. Next.js calls it server-side.
- **Reason:** `TODO: Confirm with project owner.` (Observed benefits in use: a
  mature queue/worker system, Sanctum auth, and Eloquent for business data.)
- **Consequences:**
  - Pros: proven queue + auth ecosystem; business logic isolated from the UI.
  - Cons: two runtimes to deploy and monitor; some data shapes are mapped twice
    (snake_case API ↔ camelCase UI).

## ADR-002 — Render pipeline runs in a separate Node worker

- **Status:** Accepted
- **Context:** Rendering is CPU/GPU- and media-heavy (orbit video, frames, 3D,
  packaging).
- **Decision:** A standalone Node worker runs the pipeline and reports status
  back to Laravel over HTTP (`PATCH /api/jobs/{id}`). It shares no process with
  the web app.
- **Reason:** `TODO: Confirm with project owner.` (Observed: the media tooling is
  Node-based; isolating it keeps heavy work off the web request path.)
- **Consequences:**
  - Pros: render load never blocks web requests; the pipeline can be scaled or
    restarted independently.
  - Cons: an extra process and an HTTP boundary between worker and Laravel.

## ADR-003 — Marketplace generation is a distinct pipeline stage

- **Status:** Accepted
- **Context:** The pipeline produces both the interactive orbit/3D assets and a
  marketplace export set. These are separate stages (`marketplace`, `package`).
- **Decision:** Keep marketplace/packaging as their own stages rather than
  folding them into rendering.
- **Reason:** `TODO: Confirm with project owner.` (A plausible motivation is that
  new export formats can be added without touching the render stages — please
  confirm this was the intent.)
- **Consequences:**
  - Pros: exporters can evolve independently of rendering.
  - Cons: more stages to coordinate and track progress across.

## ADR-004 — Notifications are event-driven and created only in Laravel

- **Status:** Accepted
- **Context:** Users need to know when a render finishes or fails, both in-app
  and (optionally) by email.
- **Decision:** When a job transitions to completed/failed, `JobController`
  writes a row to the `notifications` table and, if the user's preference is on,
  queues an email. The worker never creates notifications or emails.
- **Reason:** Keeping all notification logic in one place avoids duplication and
  keeps the worker focused on rendering; a persisted table gives read-tracking
  that survives refresh.
- **Consequences:**
  - Pros: single source of notification truth; in-app read state persists.
  - Cons: renders completed *before* this table existed have no notification
    (no backfill).

## ADR-005 — In-app notifications always show; email is opt-out per event

- **Status:** Accepted
- **Context:** Settings has switches labelled "Email notifications".
- **Decision:** The in-app bell is a full history and always shows every event.
  The switches control **email only**. Emails are transactional and opt-out
  (default on) per event type.
- **Reason:** A notification history you can silence is confusing; users expect
  the bell to be complete and settings to govern what reaches their inbox.
- **Consequences:**
  - Pros: predictable UX; no "where did my notification go" confusion.
  - Cons: the switch label must stay email-specific or it reads as controlling
    the bell too.

## ADR-006 — Client components must not import server-only modules

- **Status:** Accepted
- **Context:** A `"use client"` component imported a module that pulls in
  `next/headers` (server-only). The Turbopack build failed, `.next` went
  missing, and the site returned a Cloudflare 502.
- **Decision:** Client components reach the backend through **Server Actions**,
  never by importing the server-side API client.
- **Reason:** `next/headers`/`cookies()` only exist server-side; importing them
  into a client bundle is a build-breaking error, not a runtime one.
- **Consequences:**
  - Pros: a clear, enforceable boundary; auth cookies stay server-side.
  - Cons: each client-triggered backend call needs a small Server Action wrapper.

## ADR-007 — Deploy is build-gated with health check and auto-rollback

- **Status:** Accepted
- **Context:** The 502 above reached production because the old deploy piped the
  build through `tail` before `&& pm2 restart`, so the restart ran even though
  the build had failed.
- **Decision:** Deploy only via `scripts/deploy.sh`: check the build's exit code
  directly, restart only on success, health-check `/api/health`, and auto-roll
  back to the previous commit if the new version is unhealthy.
- **Reason:** A failed build must never replace a working app; recovery should
  not require a human at 2am.
- **Consequences:**
  - Pros: a broken build can't take the site down; failures self-recover.
  - Cons: rollback rebuilds (~3 min), so it's automatic recovery, not true
    zero-downtime. `c360-next` runs single-instance fork mode, so `pm2 reload`
    is not a zero-downtime option here.
