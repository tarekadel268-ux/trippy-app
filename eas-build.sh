#!/bin/bash
# Run this script from ANYWHERE in the repo to build the Trippy Events app.
# Usage: ./eas-build.sh [preview|production|development]
# Default profile: preview

set -e

PROFILE="${1:-preview}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/artifacts/egypt-app"

echo "==> Building Trippy Events (profile: $PROFILE)"
echo "==> Project dir: $PROJECT_DIR"
echo ""

cd "$PROJECT_DIR"

echo "==> Installing dependencies (pnpm, standalone)..."
pnpm install --ignore-workspace --no-frozen-lockfile

echo ""
echo "==> Starting EAS build..."
eas build -p android --profile "$PROFILE" --non-interactive
