#!/usr/bin/env bash

# Create release candidate
# Usage: ./scripts/release/create-rc.sh [rc-number]

set -euo pipefail

RC_NUMBER="${1:-1}"

# Run verification
./scripts/release/verify.sh || exit 1

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}-rc.${RC_NUMBER}"

echo ""
echo "📦 Creating release candidate: $TAG"

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "❌ Tag $TAG already exists"
  exit 1
fi

# Create and push tag
git tag -a "$TAG" -m "Release candidate $TAG"
git push origin "$TAG"

echo ""
echo "✅ Release candidate created: $TAG"
echo "   GitHub Actions will build and create the prerelease."
echo "   Monitor: https://github.com/eyuelabebe/zipkit/actions"
