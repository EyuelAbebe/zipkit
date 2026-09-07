# Versioning Guide

This document defines how versions are managed and incremented in ZipKit.

## Semantic Versioning

ZipKit follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

### Version Components

- **MAJOR**: Incompatible API changes or breaking changes
- **MINOR**: New functionality in a backwards-compatible manner
- **PATCH**: Backwards-compatible bug fixes

### Examples

- `1.0.0`: First stable release
- `1.1.0`: Added new feature (backwards-compatible)
- `1.1.1`: Fixed bug (no new features)
- `2.0.0`: Breaking change (incompatible with 1.x.x)

## Pre-1.0.0 Versioning

**During initial development (0.x.x):**

ZipKit is currently in pre-1.0.0 phase, which has special rules:

```
0.MINOR.PATCH
```

### Pre-1.0.0 Rules

1. **MINOR version increments**:
   - New features
   - Breaking changes are allowed
   - Significant functionality additions

2. **PATCH version increments**:
   - Bug fixes
   - Small improvements
   - Documentation updates

3. **Stability**:
   - API is not yet stable
   - Breaking changes can occur in MINOR releases
   - Use with caution in production environments

### When to Release 1.0.0

Release `1.0.0` when:
- Core functionality is complete and stable
- API is finalized and documented
- Extensive testing has been performed
- Ready for production use
- Commitment to semantic versioning for breaking changes

## Version Synchronization

Versions must be synchronized across multiple files:

### Required Files

1. **`package.json`**
   ```json
   {
     "version": "0.1.0"
   }
   ```

2. **`apps/extension/manifest.json`** (when implemented)
   ```json
   {
     "version": "0.1.0"
   }
   ```

3. **Git Tags**
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   ```

### Synchronization Process

**Before each release:**

1. Update version in `package.json`
2. Update version in `apps/extension/manifest.json`
3. Commit changes
4. Create Git tag with `v` prefix
5. Push commits and tags

**Example:**
```bash
# Update package.json version to 0.2.0
# Update manifest.json version to 0.2.0
git add package.json apps/extension/manifest.json
git commit -m "chore: bump version to 0.2.0"
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

## Tag Format

### Release Tags

**Format:** `vX.Y.Z`

**Examples:**
- `v0.1.0`: First pre-release
- `v0.2.0`: Second pre-release with new features
- `v1.0.0`: First stable release
- `v1.1.0`: Minor release with new features
- `v1.1.1`: Patch release with bug fixes

### Release Candidate Tags

**Format:** `vX.Y.Z-rc.N`

Where `N` is the release candidate number (1, 2, 3, etc.)

**Examples:**
- `v0.1.0-rc.1`: First release candidate for v0.1.0
- `v0.1.0-rc.2`: Second release candidate for v0.1.0
- `v1.0.0-rc.1`: First release candidate for v1.0.0

### Pre-release Tags

**Other pre-release identifiers (when needed):**
- `vX.Y.Z-alpha.N`: Alpha releases (very unstable)
- `vX.Y.Z-beta.N`: Beta releases (feature complete, stabilizing)
- `vX.Y.Z-rc.N`: Release candidates (final testing)

## Changelog Format

Maintain `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/):

### Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features not yet released

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

## [0.2.0] - 2024-03-15

### Added
- Archive security scanning feature
- Password protection for ZIP files
- Batch archive processing

### Changed
- Improved UI performance
- Updated compression algorithm

### Fixed
- Fixed extraction error with nested folders
- Resolved memory leak in file preview

## [0.1.0] - 2024-02-01

### Added
- Initial release
- ZIP file creation
- ZIP file extraction
- File preview
```

### Changelog Sections

Use these standard sections (in order):

1. **Added**: New features
2. **Changed**: Changes in existing functionality
3. **Deprecated**: Soon-to-be removed features
4. **Removed**: Now removed features
5. **Fixed**: Bug fixes
6. **Security**: Security fixes

### Changelog Maintenance

**During development:**
- Add entries to "Unreleased" section
- Keep entries organized by section
- Use clear, user-facing language
- Include issue/PR references when relevant

**Before release:**
- Move "Unreleased" items to new version section
- Add release date: `## [X.Y.Z] - YYYY-MM-DD`
- Create new empty "Unreleased" section
- Add comparison links at bottom

## Version Increment Decision Tree

### Should I increment MAJOR? (X.0.0)

**Post-1.0.0:**
- Breaking API changes
- Removal of deprecated features
- Fundamental architectural changes
- Incompatible with previous version

**Pre-1.0.0:**
- Not applicable (stay at 0.x.x)

### Should I increment MINOR? (0.Y.0)

**Post-1.0.0:**
- New features (backwards-compatible)
- New functionality
- Deprecation of features (not removal)
- Significant internal improvements

**Pre-1.0.0:**
- New features (may include breaking changes)
- Significant functionality additions
- Major improvements

### Should I increment PATCH? (0.0.Z)

**Post-1.0.0 and Pre-1.0.0:**
- Bug fixes
- Security patches
- Performance improvements (no new features)
- Documentation updates
- Dependency updates (no API changes)

## Chrome Web Store Versioning

### Manifest Version Field

Chrome extensions use a specific version format:

```json
{
  "version": "0.1.0",
  "version_name": "0.1.0 Beta" // Optional display name
}
```

### Rules

1. Version must be 1-4 dot-separated integers
2. Each integer must be 0-65535
3. `version_name` is optional (user-facing display)

### Examples

**Valid:**
- `"version": "0.1.0"`
- `"version": "1.0.0"`
- `"version": "1.2.3.4"`

**Invalid:**
- `"version": "1.0"` (too few components)
- `"version": "1.0.0-rc.1"` (contains non-numeric characters)

### Handling Pre-releases

For release candidates, use `version_name`:

```json
{
  "version": "0.1.0",
  "version_name": "0.1.0 RC1"
}
```

## Deprecation Policy

### Announcing Deprecations

1. Add `@deprecated` JSDoc comment
2. Add console warning in code
3. Document in CHANGELOG under "Deprecated"
4. Update documentation

### Deprecation Timeline

**Post-1.0.0:**
- Deprecate in MINOR release (e.g., 1.1.0)
- Remove in next MAJOR release (e.g., 2.0.0)
- Minimum 1 MAJOR version notice period

**Pre-1.0.0:**
- Deprecate in one MINOR release
- May remove in next MINOR release
- At least 1 MINOR version notice period recommended

## Version Comparison

### Precedence Rules

When comparing versions:

1. MAJOR version takes precedence
2. Then MINOR version
3. Then PATCH version
4. Pre-release versions have lower precedence than release versions

**Examples (lowest to highest):**
- `0.1.0-alpha.1`
- `0.1.0-beta.1`
- `0.1.0-rc.1`
- `0.1.0`
- `0.1.1`
- `0.2.0`
- `1.0.0`

## Best Practices

### DO

- Keep versions synchronized across all files
- Tag every release in Git
- Maintain detailed changelog
- Follow semantic versioning strictly (post-1.0.0)
- Use release candidates for validation
- Document breaking changes clearly

### DON'T

- Skip versions
- Reuse version numbers
- Mix version formats
- Release without updating changelog
- Create tags without corresponding releases
- Bump MAJOR version pre-1.0.0

## Automation

### Current State

- Manual version updates
- Manual changelog maintenance
- Manual Git tagging

### Future Improvements

Consider automating:
- Version bumping with scripts
- Changelog generation from commits
- Tag creation from version
- Conventional Commits integration
- Semantic Release tooling

### Example Automation Script

```bash
#!/bin/bash
# scripts/release/bump-version.sh

VERSION=$1
TYPE=$2 # major, minor, patch

if [ -z "$VERSION" ]; then
  echo "Usage: ./bump-version.sh <version> [type]"
  exit 1
fi

# Update package.json
npm version $VERSION --no-git-tag-version

# Update manifest.json
# (add logic here)

# Update changelog
# (add logic here)

echo "Version bumped to $VERSION"
echo "Please review changes and commit"
```

## References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Chrome Extension Manifest Version](https://developer.chrome.com/docs/extensions/mv3/manifest/version/)
- [Conventional Commits](https://www.conventionalcommits.org/)
