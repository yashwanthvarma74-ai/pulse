#!/usr/bin/env bash
# Puts the app on a temporary public address for free, from this machine, with no account:
#
#   brew install cloudflared      (once)
#   scripts/share.sh
#
# It builds and starts a production stack (with the demo accounts), serves it on one port and opens a
# Cloudflare quick tunnel. The address ends when you press Ctrl+C or close the laptop.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
command -v cloudflared >/dev/null || { echo "Install cloudflared first: brew install cloudflared" >&2; exit 1; }

# the browser opens the socket on whatever address it was given
export NEXT_PUBLIC_WS_URL=same-origin
"$ROOT/perf/stack.sh" start
trap '"$ROOT/perf/stack.sh" stop; kill 0' EXIT
node "$ROOT/scripts/share.mjs" &
sleep 1
echo "Look for the https://....trycloudflare.com address below."
cloudflared tunnel --url http://localhost:8080
