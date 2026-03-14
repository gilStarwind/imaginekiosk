#!/usr/bin/env bash
set -euo pipefail

# Build a production Tailwind CSS from the app sources into tailwind.min.css
# Requires Node.js and npx available on your dev machine.

ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR"

echo "Building Tailwind CSS → tailwind.min.css"
npx tailwindcss -i styles/tailwind.input.css -o tailwind.min.css -m
echo "Done."

