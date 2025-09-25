#!/usr/bin/env bash
set -euo pipefail

# Launch local server and Chromium kiosk on Raspberry Pi
# Usage: ./kiosk-start.sh [PORT]

PORT="${1:-${PORT:-8080}}"
DIR="$(cd "$(dirname "$0")" && pwd)"

# Start the local server in the background (localhost only)
nohup python3 "$DIR/serve.py" --port "$PORT" --dir "$DIR" \
  > /tmp/kiosk-server.log 2>&1 &

# Give the server a moment to start
sleep 1

# Prevent screen blanking (ignore errors if X not ready)
xset s off || true
xset -dpms || true
xset s noblank || true

# Launch Chromium in kiosk mode to our localhost server
chromium-browser \
  --kiosk \
  --incognito \
  --noerrdialogs \
  --disable-translate \
  --disable-features=Translate,TabHoverCards \
  "http://localhost:${PORT}" \
  > /tmp/kiosk-chromium.log 2>&1 &

echo "Kiosk started: http://localhost:${PORT} (logs in /tmp/kiosk-*.log)"

