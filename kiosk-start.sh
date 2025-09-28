#!/usr/bin/env bash
set -euo pipefail

# Launch local server and Chromium kiosk on Raspberry Pi
# Usage: ./kiosk-start.sh [PORT]

PORT="${1:-${PORT:-8080}}"
# Optional rotation: left | right | inverted | normal
# Can be passed as $2 or via ROTATE env var
ROTATE="${2:-${ROTATE:-}}"
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

# If a rotation was requested, apply it and map touch to the primary output
apply_rotation_and_mapping() {
  [ -z "$ROTATE" ] && return 0

  # Normalize rotation value
  case "$ROTATE" in
    left|right|inverted|normal) ;;
    90) ROTATE=right ;;
    180) ROTATE=inverted ;;
    270) ROTATE=left ;;
    *) echo "Unknown ROTATE value: $ROTATE (use left|right|inverted|normal)" >&2; return 0 ;;
  esac

  if [ "${XDG_SESSION_TYPE:-x11}" = "wayland" ] && command -v wlr-randr >/dev/null 2>&1; then
    # Map xrandr terms to wlr-randr angles (clockwise)
    case "$ROTATE" in
      right) WL_ANGLE=90 ;;
      inverted) WL_ANGLE=180 ;;
      left) WL_ANGLE=270 ;;
      normal) WL_ANGLE=normal ;;
    esac
    # Find first enabled output
    OUT=$(wlr-randr | awk '/enabled/{print name}{name=$1}' | head -n1)
    if [ -n "$OUT" ]; then
      wlr-randr --output "$OUT" --transform "$WL_ANGLE" || true
    fi
  elif command -v xrandr >/dev/null 2>&1; then
    # Determine active output (prefer primary)
    OUT=$(xrandr --query 2>/dev/null | awk '/ connected primary/{print $1; exit} / connected/{print $1; exit}')
    if [ -n "$OUT" ]; then
      xrandr --output "$OUT" --rotate "$ROTATE" || true
      # Map touchscreen to the rotated output if we can find a touch device
      if command -v xinput >/dev/null 2>&1; then
        TOUCH_ID=$(xinput list 2>/dev/null | awk -F'=' '/[Tt]ouch|[Tt]ouchscreen/ && /pointer/ {print $2; exit}' | cut -d'\t' -f1)
        if [ -n "$TOUCH_ID" ]; then
          xinput map-to-output "$TOUCH_ID" "$OUT" || true
        fi
      fi
    fi
  fi
}

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

# Build Chromium flags with better touch support
CHROME_FLAGS=(
  --kiosk
  --incognito
  --noerrdialogs
  --disable-translate
  --disable-features=Translate,TabHoverCards
  --touch-events=enabled
  --enable-features=TouchInitiatedDrag,TouchpadAndWheelScrollLatching
  --overscroll-history-navigation=0
  --disable-pinch
)

# If running on Wayland (Pi OS Bookworm default), prefer Ozone Wayland
if [ "${XDG_SESSION_TYPE:-}" = "wayland" ]; then
  CHROME_FLAGS+=(--enable-features=UseOzonePlatform --ozone-platform=wayland)
fi

# Launch Chromium in kiosk mode to our localhost server
chromium-browser "http://localhost:${PORT}" "${CHROME_FLAGS[@]}" \
  > /tmp/kiosk-chromium.log 2>&1 &

echo "Kiosk started: http://localhost:${PORT} (logs in /tmp/kiosk-*.log)"
