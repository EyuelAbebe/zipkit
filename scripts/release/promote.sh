#!/usr/bin/env bash

# Promote release candidate to final release
# Usage: ./scripts/release/promote.sh <rc-tag>

set -euo pipefail

RC_TAG="${1:-}"

if [[ -z "$RC_TAG" ]]; then
  echo "Usage: ./scripts/release/promote.sh <rc-tag>"
  echo "Example: ./scripts/release/promote.sh v0.1.0-rc.1"
  exit 1
fi

# Verify RC tag exists
if ! git rev-parse "$RC_TAG" >/dev/null 2>&1; then
  echo "❌ Release candidate tag $RC_TAG does not exist"
  exit 1
fi

# Extract version from RC tag
VERSION=$(echo "$RC_TAG" | sed -E 's/v([0-9]+\.[0-9]+\.[0-9]+)-rc\.[0-9]+/\1/')
FINAL_TAG="v${VERSION}"

echo "🚀 Promoting $RC_TAG to $FINAL_TAG"

# Check if final tag already exists
if git rev-parse "$FINAL_TAG" >/dev/null 2>&1; then
  echo "❌ Final release tag $FINAL_TAG already exists"
  exit 1
fi

# Verify package.json version matches
PACKAGE_VERSION=$(node -p "require('./package.json').version")
if [[ "$PACKAGE_VERSION" != "$VERSION" ]]; then
  echo "❌ package.json version ($PACKAGE_VERSION) doesn't match release version ($VERSION)"
  exit 1
fi

# Create final tag from RC commit
RC_COMMIT=$(git rev-parse "$RC_TAG")
git tag -a "$FINAL_TAG" "$RC_COMMIT" -m "Release $FINAL_TAG"
git push origin "$FINAL_TAG"

echo ""
echo "✅ Promoted to final release: $FINAL_TAG"
echo "   GitHub Actions will create the official release."
echo "   Monitor: https://github.com/eyuelabebe/zipkit/actions"
