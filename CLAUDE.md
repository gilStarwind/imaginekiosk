# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server (default port 8080)
npm run lint     # Run ESLint
```

There are no automated tests in this project.

### Kiosk Deployment

```bash
./kiosk-start.sh [PORT] [ROTATE]   # Start prod server + Chromium kiosk mode
                                    # ROTATE: normal|left|right|inverted|90|180|270
./cron-update.sh                    # Pull updates from GitHub and reboot if changed
                                    # Intended for crontab: 0 3 * * * /path/to/cron-update.sh
```

## Architecture

This is a **Next.js 16 / React 19** touchscreen kiosk app for Imagine Church to display missions information. It runs on a Raspberry Pi (or similar device) in a locked-down Chromium kiosk environment.

### Data Flow

- `missions.json` — primary data store for all mission cards (read/written by the server)
- `config.json` — kiosk settings (theme, idle timeout, splash text, Google Sheets URL)
- `lib/data.ts` — all file I/O: `getMissions()`, `saveMissions()`, `getSettings()`, `saveSettings()`
- `lib/types.ts` — shared `Mission` and `Settings` interfaces

Data is loaded server-side at page render (`app/(kiosk)/page.tsx` uses `force-dynamic`) and passed as props to the client component.

### Google Sheets Sync

`POST /api/sync` fetches the configured Google Sheets URL (auto-converting `/edit` links to `/export?format=csv`), parses it into `Mission[]`, and writes to `missions.json`. This is triggered automatically on idle reset (if `sheetUrl` is set in settings) and manually from the Admin Dashboard.

The CSV must have columns matching `Mission` fields: `id`, `title`, `subtitle`, `focus`, `involved`, `contact`, `body`, `image`, `links`. The `links` column uses the format `Label|URL;Label2|URL2`.

### Routes

| Route | Description |
|---|---|
| `/` | Main kiosk UI (the `(kiosk)` route group) |
| `/admin` | Admin dashboard — PIN protected (hardcoded: `112200`) |
| `/api/missions` | GET/POST `missions.json` |
| `/api/settings` | GET/POST `config.json` |
| `/api/sync` | POST — sync from Google Sheets |
| `/api/upload` | POST — upload image files to `public/images/` |

### KioskApp Component

`components/kiosk/KioskApp.tsx` is the entire kiosk UI as a single client component. It manages three view modes via local state:

- `splash` — attract screen shown on idle; resets after `idleMs` (default 60s) of inactivity
- `home` — mission card grid
- `detail` — expanded mission view with QR code buttons

Idle reset fires `POST /api/sync` silently in the background to keep content fresh.

### Theming

Five CSS themes are defined in `app/globals.css` via `[data-theme="..."]` selectors: `evergreen` (default), `ocean`, `ember`, `sunrise`, `lagoon`. The theme is applied by setting `data-theme` on `<html>` based on `settings.theme`. Use the CSS variables `--color-brand`, `--color-surface`, `--color-text-base`, etc. for new UI elements. Reusable utility classes: `.glass-panel` (glassmorphism card), `.btn-premium` (branded button), `.animate-floaty`.

### Image Storage

Uploaded images are stored in:
- `public/images/general/` — logo and general assets
- `public/images/missions/` — per-mission card images

Images from Google Sheets sync must be publicly accessible URLs (not local paths).
