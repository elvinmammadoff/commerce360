# Deployment

Production runs on a single DigitalOcean VPS. The frontend (Next.js) and the
Laravel backend are both served through Nginx and supervised by PM2.

## Processes (PM2)

| id | name          | what it runs                                  |
|----|---------------|-----------------------------------------------|
| 0  | c360-next     | `next start` on port 3000 (fork mode)         |
| 1  | c360-worker   | render pipeline worker                        |
| 2  | laravel-queue | `php artisan queue:work` for backend jobs     |

Config lives in `ecosystem.config.js`. `c360-next` runs a single instance in
**fork** mode — not cluster — so `pm2 reload` is effectively a restart here
(true zero-downtime reload would need cluster mode + multiple instances, which
this VPS does not have the RAM for).

## Deploying the frontend

Always deploy with the script — never restart PM2 by hand after a raw build.

```bash
ssh root@178.62.206.235 'cd /var/www/commerce360 && bash scripts/deploy.sh'
```

`scripts/deploy.sh` guarantees:

1. **git pull**, then `npm ci` only if `package-lock.json` changed.
2. **Build first, restart never before it.** The build's exit code is checked
   directly (`if ! npm run build`). It is *not* piped through `tail`/`grep` —
   doing so masks the real exit code and is exactly what once let a broken
   build reach `pm2 restart` and take the site down with a Cloudflare 502.
3. **Restart only on a green build**, then poll `/api/health` for HTTP 200
   (up to 10 × 2s).
4. **Auto-rollback**: if the new version never goes healthy, `git reset --hard`
   to the previous commit, rebuild, and restart, so users are not stranded on
   a 502. A successful rollback exits non-zero (deploy failed, old code live).
5. **Logging**: appends `SUCCESS` / `ROLLBACK` / `CRITICAL` to `deploy.log`
   (gitignored) with the commit SHA and build duration.

Exit codes: `0` deployed, `1` rolled back to previous working version,
`2` both the new build and the rollback failed (app is down — inspect
`pm2 logs c360-next`).

## Health check

`GET /api/health` → `{ "status": "ok", ... }`. Intentionally does no auth, no
DB, no SSR, so it stays 200 as long as the Node process is up — more stable to
probe than the SSR homepage, which can change with auth/middleware/caching.

## The 502 post-mortem (2026-07-23)

- **Symptom**: Cloudflare "Bad gateway 502", Host = Error.
- **Cause**: a `"use client"` component imported `api-client.ts`, which imports
  `next/headers` (server-only). Turbopack build failed, so `.next` was missing.
  The old deploy command piped the build through `tail` before `&& pm2 restart`,
  so `&&` saw `tail`'s exit code (always 0) and restarted anyway onto a missing
  build — PM2 crash-looped and Nginx had nothing to proxy to.
- **Fix**: moved the mark-read calls to server actions (client no longer imports
  server-only code) and replaced the deploy command with `scripts/deploy.sh`.

## Backend (Laravel)

After changing any Laravel PHP file on the VPS:

```bash
cd /var/www/backend && composer dump-autoload -o && php artisan config:clear
```

Migrations in production need `--force`:

```bash
php artisan migrate --force
```
