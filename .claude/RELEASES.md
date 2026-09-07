# Release Process

ZipKit uses a disciplined release process based on semantic versioning, Git tags, release candidates, and GitHub Releases.

## Versioning

### Semantic Versioning

ZipKit follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes or incompatible behavior (after 1.0.0)
- **MINOR**: Backward-compatible new features
- **PATCH**: Backward-compatible bug fixes

### Pre-1.0.0

Before `1.0.0`, the project is experimental:

- **0.MINOR.PATCH** format
- Breaking changes may occur in MINOR versions
- MVP is developed during 0.x versions

### Version Sources

Version must be synchronized across:

- `package.json` → `"version"`
- `apps/extension/manifest.json` → `"version"`
- Git tag → `vX.Y.Z`

Version drift is prevented by automated validation.

## Release Types

### Development

- Branch: `main`
- Purpose: Active development
- Stability: Unstable
- Releases: None

### Release Candidate (RC)

- Tag: `vX.Y.Z-rc.N` (e.g., `v0.1.0-rc.1`)
- Purpose: Pre-release testing and validation
- Stability: Testing
- Artifacts: Packaged extension
- GitHub Release: Marked as prerelease

### Official Release

- Tag: `vX.Y.Z` (e.g., `v0.1.0`)
- Purpose: Stable public release
- Stability: Production
- Artifacts: Packaged extension with checksums
- GitHub Release: Official
- Distribution: Chrome Web Store (eventually)

## Release Workflow

### 1. Prepare Release

**Prerequisites:**

- All planned issues for the release are complete
- All PRs are merged to `main`
- `main` branch is in releasable state
- All CI checks pass on `main`

**Preparation:**

1. Ensure version in `package.json` and `manifest.json` match target release
2. Update `CHANGELOG.md` with release notes
3. Create PR with version bump and changelog:
   ```
   chore: prepare release v0.1.0
   ```
4. Merge PR after review

### 2. Create Release Candidate

Run release script:

```bash
npm run release:rc
```

This script:

1. Verifies working tree is clean
2. Verifies on `main` branch
3. Validates version format
4. Runs full test suite
5. Builds production artifacts
6. Packages extension
7. Generates checksums
8. Creates Git tag: `vX.Y.Z-rc.N`
9. Pushes tag to remote

Or use GitHub Actions workflow:

```bash
gh workflow run release.yml -f release-type=rc -f version=0.1.0 -f rc-number=1
```

### 3. Validate Release Candidate

**Automated validation** (via CI):

- ✅ Format check
- ✅ Lint
- ✅ Typecheck
- ✅ Unit tests
- ✅ Integration tests
- ✅ E2E tests
- ✅ Build verification
- ✅ Extension manifest validation

**Manual validation:**

- Load unpacked extension in Chrome
- Test core workflows:
  - Create archive
  - Inspect archive
  - Extract archive
  - Security warnings
  - Large file handling
  - Cancellation
- Cross-platform testing (Windows, macOS, Linux, ChromeOS)
- Test with real-world archives
- Verify extension permissions are minimal

**Sign-off:**

- RC testing results documented
- Critical bugs fixed
- New RC created if needed
- Final RC approved for promotion

### 4. Promote to Official Release

When RC validation passes:

```bash
npm run release:promote
```

This script:

1. Verifies RC tag exists
2. Verifies RC passed all checks
3. Creates final tag: `vX.Y.Z`
4. Pushes tag to remote
5. Triggers GitHub Release creation

Or use GitHub Actions:

```bash
gh workflow run release.yml -f release-type=final -f version=0.1.0
```

**Do not rebuild from different commit.** Promote the exact tested RC commit/artifacts.

### 5. Publish GitHub Release

GitHub Actions automatically:

1. Creates GitHub Release from tag
2. Adds release notes from `CHANGELOG.md`
3. Attaches packaged extension
4. Attaches checksums
5. Marks as official release (not prerelease)

### 6. Distribute

**Chrome Web Store** (when ready):

1. Upload packaged extension to Chrome Web Store Developer Dashboard
2. Update store listing if needed
3. Submit for review
4. Publish after approval

**Announce:**

- Update README.md with new version
- Post to relevant channels (if any)

## Release Scripts

### `scripts/release/verify.sh`

Validates release preconditions:

- Clean working tree
- Correct branch
- Version format valid
- Version matches across files
- All tests pass

### `scripts/release/build.sh`

Creates production build:

- Cleans previous builds
- Runs full test suite
- Builds all packages
- Builds extension
- Validates build artifacts

### `scripts/release/package-extension.sh`

Packages Chrome extension:

- Creates distributable `.zip` or `.crx`
- Generates checksums
- Validates package structure

### `scripts/release/create-rc.sh`

Creates release candidate:

- Runs verification
- Runs build
- Packages extension
- Creates RC tag
- Pushes tag

### `scripts/release/promote.sh`

Promotes RC to final:

- Verifies RC tag exists
- Verifies RC validation passed
- Creates final tag
- Pushes tag

## Automated GitHub Release

`.github/workflows/release.yml` handles:

- Tag-based release creation
- Artifact generation
- GitHub Release creation
- Prerelease vs. final distinction

Triggered by:

- Tags matching `v*` pattern
- Manual workflow dispatch

## Changelog

`CHANGELOG.md` format:

```markdown
# Changelog

## [0.1.0] - 2026-09-15

### Added

- ZIP archive inspection and extraction
- TAR archive support
- Path traversal detection
- Archive expansion risk analysis

### Fixed

- Memory leak in large archive processing

### Security

- Blocked extraction outside destination directory

## [0.0.1] - 2026-09-01

### Added

- Initial repository setup
- Core architecture documentation
```

Update changelog before each release, not after.

## Version Bumping

### Automated (Recommended)

```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.1 → 0.2.0
npm version major  # 0.2.0 → 1.0.0
```

This updates `package.json` automatically.

**Remember to also update `apps/extension/manifest.json` manually.**

### Manual

1. Edit `package.json` → `"version"`
2. Edit `apps/extension/manifest.json` → `"version"`
3. Verify versions match
4. Commit: `chore: prepare release vX.Y.Z`

## Hotfix Releases

For critical production bugs:

1. **Do not wait for next planned release**
2. Create hotfix branch from release tag:
   ```bash
   git checkout -b fix/critical-security-issue v0.1.0
   ```
3. Fix the issue with focused commits
4. Bump PATCH version
5. Update changelog
6. Create PR
7. Follow normal RC process
8. Release as patch: `v0.1.1`
9. Backport fix to `main` if needed

## Release Checklist

Before creating RC:

- [ ] All planned issues complete
- [ ] All PRs merged
- [ ] Version bumped in `package.json` and `manifest.json`
- [ ] Changelog updated
- [ ] CI passing on `main`
- [ ] No uncommitted changes

Before promoting to final:

- [ ] RC created and tagged
- [ ] RC automated tests pass
- [ ] RC manual validation complete
- [ ] Critical bugs fixed (new RC if needed)
- [ ] Cross-platform testing done
- [ ] Extension loads correctly
- [ ] Core workflows verified
- [ ] Final approval obtained

After release:

- [ ] GitHub Release created
- [ ] Artifacts attached
- [ ] Changelog accurate
- [ ] Chrome Web Store updated (when applicable)
- [ ] Announcement made (if applicable)

## Rollback

If a release is critically broken:

1. **Do not delete Git tag** (breaks trust)
2. **Create new patch release** with fix
3. **Mark broken release** in GitHub Release notes
4. **Update Chrome Web Store** with new version immediately
5. **Document incident** in postmortem if significant

## Version Support

Before 1.0.0:

- Only latest version supported
- No backports to old versions
- Users expected to upgrade

After 1.0.0:

- Define LTS policy if needed
- Consider backporting critical security fixes

## Permissions

Release creation requires:

- Write access to repository
- Tag creation permissions
- GitHub Release creation permissions

## No AI Attribution

Release notes, Git tags, and GitHub Releases must not mention AI tools.

Focus on user-visible changes and engineering work, not the tools used.
