#!/usr/bin/env bash
#
# Safe production deploy for the Next.js frontend (c360-next).
#
# Guarantees:
#   - The build runs BEFORE any restart. Its real exit code is checked
#     directly (never piped through tail/grep, which would mask a failure).
#   - PM2 is only restarted when the build succeeds. A broken build can
#     never take down the running app — that is what caused the 502.
#   - A post-restart health check confirms the new process actually serves.
#
# Run on the VPS from the repo root:
#   bash scripts/deploy.sh
#
set -euo pipefail

APP_DIR="/var/www/commerce360"
PM2_APP="c360-next"
HEALTH_URL="http://localhost:3000/"

cd "$APP_DIR"

echo "==> git pull"
git pull origin main

# Install deps only when the lockfile changed since last deploy.
if ! git diff --quiet HEAD@{1} HEAD -- package-lock.json 2>/dev/null; then
  echo "==> lockfile changed, running npm ci"
  npm ci
fi

echo "==> building (blocking; exit code is checked, not masked)"
if ! npm run build; then
  echo "!! BUILD FAILED — leaving the current running app untouched." >&2
  exit 1
fi

echo "==> build OK, restarting $PM2_APP"
pm2 restart "$PM2_APP" --update-env

echo "==> health check ($HEALTH_URL)"
for i in $(seq 1 10); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || true)
  if [ "$code" = "200" ]; then
    echo "==> healthy (HTTP 200), deploy complete"
    exit 0
  fi
  echo "   attempt $i: HTTP $code, retrying in 2s..."
  sleep 2
done

echo "!! Health check never returned 200 — inspect: pm2 logs $PM2_APP" >&2
exit 1
