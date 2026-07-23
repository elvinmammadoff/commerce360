#!/usr/bin/env bash
#
# Safe production deploy for the Next.js frontend (c360-next).
#
# Guarantees:
#   - The build runs BEFORE any restart. Its exit code is checked directly
#     (never piped through tail/grep, which would mask a failure).
#   - PM2 is only restarted when the build succeeds. A broken build can
#     never take down the running app — that is what caused the 502.
#   - A post-restart health check confirms the new process serves 200.
#   - If the new version is unhealthy, it auto-rolls back to the previous
#     commit, rebuilds, and restarts, so users are not left on a 502.
#   - Every deploy appends a line to deploy.log for later inspection.
#
# Run on the VPS from the repo root:
#   bash scripts/deploy.sh
#
set -euo pipefail

APP_DIR="/var/www/commerce360"
PM2_APP="c360-next"
HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="$APP_DIR/deploy.log"

cd "$APP_DIR"

log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') | $*" | tee -a "$LOG_FILE"; }

# build_and_restart: build the current checkout, restart PM2, health-check.
# Returns 0 only when the app answers HTTP 200, non-zero otherwise.
build_and_restart() {
  local start=$SECONDS
  if ! npm run build; then
    return 1
  fi
  BUILD_SECONDS=$((SECONDS - start))
  pm2 restart "$PM2_APP" --update-env
  for i in $(seq 1 10); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" || true)" = "200" ]; then
      return 0
    fi
    echo "   health attempt $i: not 200 yet, retrying in 2s..."
    sleep 2
  done
  return 1
}

PREV_COMMIT="$(git rev-parse HEAD)"

echo "==> git pull"
git pull origin main
NEW_COMMIT="$(git rev-parse HEAD)"

# Install deps only when the lockfile changed since the last deploy.
if ! git diff --quiet "$PREV_COMMIT" "$NEW_COMMIT" -- package-lock.json 2>/dev/null; then
  echo "==> lockfile changed, running npm ci"
  npm ci
fi

echo "==> building + restarting $NEW_COMMIT"
if build_and_restart; then
  log "SUCCESS commit=$NEW_COMMIT build=${BUILD_SECONDS}s"
  echo "==> healthy (HTTP 200), deploy complete"
  exit 0
fi

echo "!! New version unhealthy — rolling back to $PREV_COMMIT" >&2
git reset --hard "$PREV_COMMIT"
if build_and_restart; then
  log "ROLLBACK failed=$NEW_COMMIT restored=$PREV_COMMIT"
  echo "==> rolled back to previous working version" >&2
  exit 1
fi

log "CRITICAL both failed=$NEW_COMMIT and rollback=$PREV_COMMIT"
echo "!! Rollback ALSO failed — app is down. Inspect: pm2 logs $PM2_APP" >&2
exit 2
