#!/usr/bin/env bash

# Release verification script
# Validates that repository is ready for release

set -euo pipefail

echo "🔍 Verifying release preconditions..."

# Check working tree is clean
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Working tree is not clean. Commit or stash changes."
  git status --short
  exit 1
fi

# Check we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "❌ Not on main branch. Current branch: $CURRENT_BRANCH"
  exit 1
fi

# Check main is up to date with remote
git fetch origin main
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [[ "$LOCAL" != "$REMOTE" ]]; then
  echo "❌ Local main is not up to date with remote."
  exit 1
fi

# Verify package.json and manifest.json versions match
PACKAGE_VERSION=$(node -p "require('./package.json').version")
MANIFEST_VERSION=$(node -p "require('./apps/extension/manifest.json').version" 2>/dev/null || echo "N/A")

if [[ "$MANIFEST_VERSION" != "N/A" && "$PACKAGE_VERSION" != "$MANIFEST_VERSION" ]]; then
  echo "❌ Version mismatch:"
  echo "   package.json: $PACKAGE_VERSION"
  echo "   manifest.json: $MANIFEST_VERSION"
  exit 1
fi

echo "✅ Working tree clean"
echo "✅ On main branch"
echo "✅ Up to date with remote"
echo "✅ Versions synchronized: $PACKAGE_VERSION"

# Run all checks
echo ""
echo "🧪 Running quality checks..."

npm run format:check || { echo "❌ Formatting check failed"; exit 1; }
npm run lint || { echo "❌ Linting failed"; exit 1; }
npm run typecheck || { echo "❌ Type checking failed"; exit 1; }
npm run test || { echo "❌ Tests failed"; exit 1; }
npm run build || { echo "❌ Build failed"; exit 1; }

echo ""
echo "✅ All checks passed. Repository is ready for release."
echo "   Version: $PACKAGE_VERSION"
