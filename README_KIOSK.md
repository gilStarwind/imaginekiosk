Kiosk Setup (Raspberry Pi + Chromium)

Overview
- Serves this folder over localhost so Chromium treats it as a secure context (enables modern browser features) and runs in fullscreen kiosk mode.
- Uses Python 3’s built‑in static server; no extra installs required on Raspberry Pi OS.

Files
- serve.py: Local HTTP server bound to 127.0.0.1
- kiosk-start.sh: Starts the server, disables screen blanking, launches Chromium kiosk

One‑time prep
1) Make the launcher executable:
   chmod +x kiosk-start.sh

2) Test run from the project directory:
   ./kiosk-start.sh 8080
   Then you should see the kiosk at http://localhost:8080

Autostart on boot (LXDE session)
1) Create the autostart dir if needed:
   mkdir -p ~/.config/lxsession/LXDE-pi

2) Open the autostart file:
   nano ~/.config/lxsession/LXDE-pi/autostart

3) Add these lines (adjust the path to your project):
   @xset s off
   @xset -dpms
   @xset s noblank
   @/bin/bash -lc '/home/pi/imagineKiosk/kiosk-start.sh 8080'

4) Reboot:
   sudo reboot

Alternative: systemd user service
1) Create a user service:
   mkdir -p ~/.config/systemd/user
   nano ~/.config/systemd/user/kiosk.service

2) Paste and adjust paths:
   [Unit]
   Description=Imagine Kiosk (localhost + Chromium)
   After=graphical-session.target

   [Service]
   Type=simple
   ExecStart=/bin/bash -lc '/home/pi/imagineKiosk/kiosk-start.sh 8080'
   Restart=on-failure
   Environment=DISPLAY=:0
   Environment=XAUTHORITY=%h/.Xauthority

   [Install]
   WantedBy=default.target

3) Enable + start:
   systemctl --user daemon-reload
   systemctl --user enable kiosk.service
   systemctl --user start kiosk.service

Notes
- File System Access API: Works on Chromium when served over http://localhost. Avoid file:// URLs.
- Logs: Check /tmp/kiosk-server.log and /tmp/kiosk-chromium.log for troubleshooting.
- Exit kiosk: Press Alt+F4 (or switch to TTY with Ctrl+Alt+F1).

