#!/usr/bin/env bash
set -euo pipefail

# Launch local server and Chromium kiosk on Raspberry Pi
# Usage: ./kiosk-start.sh [PORT]

PORT="${1:-${PORT:-8080}}"
DIR="$(cd "$(dirname "$0")" && pwd)"

# Ensure we point at the active X display when launched from SSH/TTY
if [ -z "${DISPLAY:-}" ]; then
  export DISPLAY=:0
fi

# Attempt to reuse the desktop session's Xauthority cookie if not provided
if [ -z "${XAUTHORITY:-}" ]; then
  for candidate in "$HOME/.Xauthority" "/home/imagine/.Xauthority"; do
    if [ -r "$candidate" ]; then
      export XAUTHORITY="$candidate"
      break
    fi
  done
fi

# Start the local server in the background (localhost only)
nohup python3 "$DIR/serve.py" --port "$PORT" --dir "$DIR" \
  > /tmp/kiosk-server.log 2>&1 &

# Give the server a moment to start
sleep 1

# Prevent screen blanking (ignore if we still cannot talk to X)
if command -v xset >/dev/null 2>&1 && xset q >/dev/null 2>&1; then
  xset s off >/dev/null 2>&1 || true
  xset -dpms >/dev/null 2>&1 || true
  xset s noblank >/dev/null 2>&1 || true
else
  echo "Warning: unable to reach display \"$DISPLAY\"; skipping xset tweaks" >&2
fi

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
