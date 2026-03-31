#!/usr/bin/env bash
set -euo pipefail

# This script is designed to be run periodically via a Linux crontab (e.g. at 3:00 AM every night)
# It pulls the latest code from GitHub and reboots the physical kiosk if changes were found.
# Example Crontab entry (run `crontab -e` and paste):
# 0 3 * * * /path/to/imaginekiosk/cron-update.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "[$(date)] Running scheduled kiosk update check..."

# Ping a public DNS root server to guarantee web connection
if ping -q -c 1 -W 2 8.8.8.8 >/dev/null 2>&1 || ping -q -c 1 -W 2 1.1.1.1 >/dev/null 2>&1; then
  
  GIT_OUTPUT=$(git pull origin main 2>&1 || true)
  
  if [[ "$GIT_OUTPUT" != *"Already up to date."* ]]; then
    echo "[$(date)] Updates Pulled! Halting kiosk and applying upgrade..."
    
    # We trigger the build immediately
    npm install
    npm run build
    
    echo "[$(date)] Rebuilding complete. Pushing a highly requested soft restart to the graphics layer."
    # A standard reboot ensures Chromium exits cleanly and the `/tmp/` Next.js locks are freed!
    sudo reboot
  else
    echo "[$(date)] System is securely up to date. No action strictly required."
  fi
else
  echo "[$(date)] Internet severely unreachable. Retrying again on next scheduled chronometer tick."
fi
