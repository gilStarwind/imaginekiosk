#!/usr/bin/env bash

# --- Configuration ---
DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$DIR/config.json"

# Read config from JSON if available, otherwise use env vars or defaults.
if [ -f "$CONFIG_FILE" ] && command -v jq >/dev/null; then
  # Use `jq -r` to get raw string; add fallback `// "default"`
  PORT_FROM_CONFIG=$(jq -r '.port // "8080"' "$CONFIG_FILE")
  ROTATE_FROM_CONFIG=$(jq -r '.screenRotation // "normal"' "$CONFIG_FILE")
  # jq returns "null" for missing keys; treat it as empty
  [ "$PORT_FROM_CONFIG" = "null" ] && PORT_FROM_CONFIG=""
  [ "$ROTATE_FROM_CONFIG" = "null" ] && ROTATE_FROM_CONFIG=""
elif [ -f "$CONFIG_FILE" ]; then
    echo "Warning: 'jq' command not found. Cannot read from config.json. Using defaults." >&2
fi

# Precedence: command-line arg -> env var -> config file -> default
PORT="${1:-${PORT:-${PORT_FROM_CONFIG:-8080}}}"
ROTATE="${2:-${ROTATE:-${ROTATE_FROM_CONFIG:-normal}}}"

# --- Environment Setup ---
# Ensure we point at the active X display when launched from SSH/TTY
if [ -z "${DISPLAY:-}" ]; then
  export DISPLAY=:0
fi

# Load NVM (Node Version Manager) if installed, so 'npm' is found securely in GUI/Autostart contexts
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
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

# --- Rotation Logic ---
apply_rotation_and_mapping() {
  [ -z "$ROTATE" ] || [ "$ROTATE" = "normal" ] && return 0

  # Normalize rotation value
  case "$ROTATE" in
    left|right|inverted) ;;
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
        # USB touchscreens can register after X11 starts — retry a few times
        for _attempt in 1 2 3; do
          TOUCH_ID=$(xinput list 2>/dev/null | awk -F'=' '/[Tt]ouch|[Tt]ouchscreen/ && /pointer/ {gsub(/\t.*/,"",$2); print $2; exit}')
          if [ -n "$TOUCH_ID" ]; then
            xinput map-to-output "$TOUCH_ID" "$OUT" || true
            break
          fi
          sleep 2
        done
      fi
    fi
  fi
}

# --- Service Execution ---
# Apply rotation before starting services
apply_rotation_and_mapping

# --- Intelligent Auto-Update (Git) ---
cd "$DIR"

# Wait to verify network is available before checking Github
if ping -q -c 1 -W 2 8.8.8.8 >/dev/null 2>&1 || ping -q -c 1 -W 2 1.1.1.1 >/dev/null 2>&1; then
  echo "Internet connection detected. Checking for updates from GitHub..."
  
  # Fetch latest changes
  GIT_OUTPUT=$(git pull origin main 2>&1 || true)
  echo "$GIT_OUTPUT"
  
  # Rebuild if new code was downloaded, or if .next doesn't exist yet
  if [[ "$GIT_OUTPUT" != *"Already up to date."* ]] || [ ! -d "$DIR/.next" ]; then
    echo "New code detected! Ensuring dependencies are met and rebuilding Next.js..."
    npm install
    npm run build
  else
    echo "Files are already up-to-date. Skipping Next.js build."
  fi
else
  echo "Warning: No internet connection found. Booting with existing cached firmware."
fi

# Start the Next.js production server in the background
cd "$DIR" && nohup npm run start -- -p "$PORT" \
  > /tmp/kiosk-server.log 2>&1 &

# Give the Next.js server a moment to start
sleep 5

# Prevent screen blanking
if command -v xset >/dev/null 2>&1 && xset q >/dev/null 2>&1; then
  xset s off >/dev/null 2>&1 || true
  xset -dpms >/dev/null 2>&1 || true
  xset s noblank >/dev/null 2>&1 || true
else
  echo "Warning: unable to reach display \"$DISPLAY\"; skipping xset tweaks" >&2
fi

# Build Chromium flags
CHROME_FLAGS=(
  --kiosk
  --start-fullscreen
  --window-position=0,0
  --incognito
  --noerrdialogs
  --disable-translate
  --disable-features=Translate,TabHoverCards
  --touch-events=enabled
  --enable-features=TouchInitiatedDrag
  --overscroll-history-navigation=0
  --disable-pinch
  --no-proxy-server
  --enable-gpu-rasterization
  --ignore-gpu-blocklist
  --password-store=basic
  # Ensures touch coordinates align with CSS pixels on the 32" USB screen
  --force-device-scale-factor=1
  # Snappier scroll response on Pi 4
  --disable-smooth-scrolling
)

# If running on Wayland (Pi OS Bookworm default), prefer Ozone Wayland but combine features safely
if [ "${XDG_SESSION_TYPE:-}" = "wayland" ]; then
  CHROME_FLAGS=( "${CHROME_FLAGS[@]/--enable-features=TouchInitiatedDrag,TouchpadAndWheelScrollLatching/--enable-features=TouchInitiatedDrag,TouchpadAndWheelScrollLatching,UseOzonePlatform}" )
  CHROME_FLAGS+=(--ozone-platform=wayland)
fi

# Launch Chromium in kiosk mode
chromium "http://localhost:${PORT}" "${CHROME_FLAGS[@]}" \
  > /tmp/kiosk-chromium.log 2>&1 &

echo "Kiosk started: http://localhost:${PORT} (logs in /tmp/kiosk-*.log)"
