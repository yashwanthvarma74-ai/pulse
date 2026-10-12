#!/usr/bin/env bash
# Starts (or stops) a production-like local stack for the measurement scripts: the built API and
# worker, and a production build of the web app, on their own database and ports (see perf/env.sh).
#
#   perf/stack.sh start     seed if needed, build, start everything, wait until it answers
#   perf/stack.sh stop
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGS="${PERF_LOGS:-/tmp/pulse-perf}"
mkdir -p "$LOGS"
# shellcheck source=env.sh
source "$ROOT/perf/env.sh"

# Each service is stopped by the port it listens on, which is the process that really holds it (the
# npm wrapper that started it is not enough). The worker has no port but its metrics one.
stop() {
  for port in "$API_PORT" 3200 "$WORKER_METRICS_PORT" "$API_METRICS_PORT"; do
    lsof -ti "TCP:$port" -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  done
  rm -f "$LOGS"/*.pid
  sleep 1
}

wait_for() { # wait_for <url> <name>
  for _ in $(seq 1 60); do curl -fs "$1" >/dev/null 2>&1 && return 0; sleep 1; done
  echo "$2 did not start; see $LOGS/$2.log" >&2
  exit 1
}

case "${1:-start}" in
  stop) stop ;;
  start)
    stop
    cd "$ROOT"
    if [ "${SKIP_SEED:-}" != "1" ]; then npm run seed -w @pulse/api; fi
    npm run build
    (cd apps/api && nohup node dist/server.js >"$LOGS/api.log" 2>&1 & echo $! >"$LOGS/api.pid")
    (cd apps/worker && nohup node dist/server.js >"$LOGS/worker.log" 2>&1 & echo $! >"$LOGS/worker.pid")
    (cd apps/web && NODE_ENV=production nohup npx next start --port 3200 >"$LOGS/web.log" 2>&1 & echo $! >"$LOGS/web.pid")
    wait_for "$API_URL/health" api
    wait_for "http://localhost:3200" web
    # a real request through the web server's proxy, so a broken build is caught here and not in a measurement
    COOKIE=$(curl -fsS -D - -o /dev/null -X POST -H 'Content-Type: application/json' -d '{"handle":"alice"}' "$API_URL/auth/demo" | tr -d '\r' | grep -i '^set-cookie: pulse_session' | cut -d';' -f1 | cut -d' ' -f2)
    curl -fs -H "Cookie: $COOKIE" "http://localhost:3200/api/feed?limit=1" >/dev/null || { echo "The web server could not reach the API; see $LOGS/web.log" >&2; exit 1; }
    echo "Stack is up: web http://localhost:3200, API $API_URL (logs in $LOGS)"
    ;;
  *) echo "usage: perf/stack.sh start|stop" >&2; exit 1 ;;
esac
