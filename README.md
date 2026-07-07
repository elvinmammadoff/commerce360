# Commerce360 AI — Frontend

Premium B2B SaaS frontend for **Commerce360 AI**: turn one product photo into
a 360° viewer, orbit video, 72 studio frames, and marketplace-ready image
sets.

**Phase 1 — frontend only.** No backend, database, auth, or AI APIs. Every
screen runs on realistic demo data and a client-side pipeline simulator so
the product feels live. The docs in [`docs/`](docs/) are the source of truth.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (types + lint)
```

## Stack

Next.js 15 (App Router, Server Components) · TypeScript · Tailwind CSS v4 ·
shadcn/ui (Radix) · Motion · Recharts · Lucide · Geist

## Map

| Area | Where |
| --- | --- |
| Marketing (landing, pricing, login, 404) | `src/app/(marketing)`, `(auth)`, `not-found.tsx` |
| App (dashboard, products, upload, history, credits, billing, API, settings, admin) | `src/app/(app)` |
| Fullscreen 360° viewer route | `src/app/(viewer)/products/[id]/viewer` |
| Domain models | `src/lib/types.ts` |
| Data access seam (swap for Supabase in Phase 2) | `src/lib/data/` — pages never import fixtures directly |
| Demo fixtures (products, jobs, credits, invoices…) | `src/lib/data/fixtures/` |
| Pipeline definition (stages, timings) | `src/lib/pipeline.ts` |
| Client render simulator (localStorage-persisted) | `src/lib/simulation/` |
| Video → poster/frames canvas utilities | `src/lib/media/video-frames.ts` |
| 360° turntable viewer (drag, keys, inertia, fullscreen) | `src/components/app/viewer/turntable-viewer.tsx` |

## Demo assets

The two bundled orbit videos in `public/demo/` (`chair.mp4`, `bed.mp4`) power
the viewer, orbit previews, frame galleries, and simulated renders. Product
posters and the 72-frame galleries are extracted **client-side** from these
videos via canvas — no image files to maintain. To swap in CDN/storage URLs
later, update `src/lib/demo-assets.ts` and the two completed products in
`src/lib/data/fixtures/products.ts`.

## Phase 2 notes

- Replace the bodies of `src/lib/data/index.ts` with Supabase queries —
  signatures and UI stay unchanged.
- Replace `SimulationProvider` actions with real job creation + realtime
  subscriptions; pipeline stage ids in `src/lib/pipeline.ts` already mirror
  the production architecture.
- Auth: `/login` and `/signup` are styled mocks that route to `/dashboard`.
