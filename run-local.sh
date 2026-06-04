#!/usr/bin/env bash
# Launch this extension in a VS Code Extension Development Host from the terminal.
# Equivalent to pressing F5 inside VS Code (see .vscode/launch.json).
#
# Usage: ./run-local.sh [path-to-open]
#   The optional argument is a folder/file to open in the dev host window
#   so you have something to click line numbers in. Defaults to this repo.

set -euo pipefail

EXT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPEN_TARGET="${1:-$EXT_DIR}"

if ! command -v code >/dev/null 2>&1; then
  echo "error: 'code' CLI not found on PATH." >&2
  echo "In VS Code, run the command: 'Shell Command: Install 'code' command in PATH'." >&2
  exit 1
fi

exec code --extensionDevelopmentPath="$EXT_DIR" "$OPEN_TARGET"
