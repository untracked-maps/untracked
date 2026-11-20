#!/usr/bin/env bash
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = true ] || exit 0

NODE_24=/opt/node24/bin

echo "export PATH=\"$NODE_24:\$PATH\"" >> "$CLAUDE_ENV_FILE"
export PATH="$NODE_24:$PATH"

exec "$CLAUDE_PROJECT_DIR/.devcontainer/setup.sh"
