#!/bin/bash
set -e

PROFILE="${1:-preview}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/artifacts/egypt-app"

echo "==> Building Trippy Events (profile: $PROFILE)"
echo "==> Project dir: $PROJECT_DIR"
echo ""

cd "$PROJECT_DIR"

echo "==> Installing dependencies..."
pnpm install --ignore-workspace --no-frozen-lockfile

echo ""
echo "==> Starting EAS build (no-VCS mode — uploads only egypt-app, not full repo)..."
EAS_NO_VCS=1 eas build -p android --profile "$PROFILE" --non-interactive
