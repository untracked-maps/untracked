#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

node --version | grep -qE '^v(2[4-9]|[3-9][0-9])\.' || {
  echo "Untracked Maps needs Node.js 24 or later, found $(node --version)." >&2
  exit 1
}

pnpm install --frozen-lockfile
pnpm exec prek install --install-hooks
pnpm exec playwright install --with-deps chromium
