# Release Process

This document outlines the end-to-end release process for ZipKit, from preparation to publishing.

## Overview

ZipKit follows a structured release process with release candidates for validation before promoting to official releases. All releases are tagged in Git and published to GitHub Releases.

## Release Types

- **Release Candidate (RC)**: Pre-release version for validation (`vX.Y.Z-rc.N`)
- **Official Release**: Stable version for public use (`vX.Y.Z`)
- **Hotfix**: Emergency patch for critical bugs in production

## Release Process

### 1. Preparation

**Before creating a release candidate:**

1. **Version Bump**
   - Update version in `package.json`
   - Update version in `apps/extension/manifest.json` (when implemented)
   - Ensure version follows semantic versioning (see `versioning.md`)
   - For pre-1.0.0: use `0.MINOR.PATCH` format

2. **Update Changelog**
   - Add release date to `CHANGELOG.md`
   - Organize changes under appropriate sections:
     - **Added**: New features
     - **Changed**: Changes in existing functionality
     - **Deprecated**: Soon-to-be removed features
     - **Removed**: Now removed features
     - **Fixed**: Bug fixes
     - **Security**: Security fixes
   - Move items from "Unreleased" to the new version section
   - Ensure all notable changes are documented

3. **Pre-release Checks**
   - Run all automated tests: `npm test`
   - Run linting: `npm run lint`
   - Run type checking: `npm run typecheck`
   - Run formatting check: `npm run format:check`
   - Build the project: `npm run build`
   - Verify no uncommitted changes

### 2. Create Release Candidate

1. **Create RC Tag**
   ```bash
   # Create and tag the release candidate
   git add package.json apps/extension/manifest.json CHANGELOG.md
   git commit -m "chore: prepare release vX.Y.Z-rc.1"
   git tag -a vX.Y.Z-rc.1 -m "Release candidate vX.Y.Z-rc.1"
   git push origin main --tags
   ```

2. **Create GitHub Pre-release**
   - Go to GitHub Releases
   - Click "Draft a new release"
   - Select the RC tag (`vX.Y.Z-rc.N`)
   - Title: `vX.Y.Z Release Candidate N`
   - Description: Copy relevant changelog entries
   - Check "This is a pre-release"
   - Attach build artifacts (if applicable)
   - Click "Publish release"

### 3. Validation

**Automated Testing:**
- All CI/CD checks must pass
- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`
- Security scans (automated via CI)

**Manual Testing:**
- Load extension in Chrome (developer mode)
- Test core functionality:
  - Archive creation (zip/unzip)
  - File inspection
  - Security scanning
  - UI/UX flows
- Test on different operating systems (Windows, macOS, Linux)
- Test with various archive types and edge cases
- Verify permissions and security features

**Review Checklist:**
- [ ] All automated tests pass
- [ ] Manual testing completed without critical issues
- [ ] Documentation is up to date
- [ ] Performance is acceptable
- [ ] No known security vulnerabilities
- [ ] UI/UX is polished and functional

**If issues are found:**
- Fix the issues
- Increment RC number (`vX.Y.Z-rc.2`, `vX.Y.Z-rc.3`, etc.)
- Repeat validation process

### 4. Promote to Official Release

**Once RC is validated:**

1. **Create Release Tag**
   ```bash
   # Update version to remove RC suffix (if still present)
   # Commit final changelog updates
   git add CHANGELOG.md
   git commit -m "chore: finalize release vX.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin main --tags
   ```

2. **Create GitHub Release**
   - Go to GitHub Releases
   - Click "Draft a new release"
   - Select the release tag (`vX.Y.Z`)
   - Title: `vX.Y.Z`
   - Description: Copy changelog entries for this version
   - Attach build artifacts
   - Click "Publish release"

### 5. Chrome Web Store Upload

**Note:** This step will be implemented when the extension is ready for public distribution.

1. **Build Production Version**
   ```bash
   npm run build:production
   ```

2. **Create ZIP for Upload**
   - Package the `dist/` folder
   - Exclude source maps and development files

3. **Upload to Chrome Web Store**
   - Log in to Chrome Web Store Developer Dashboard
   - Select ZipKit extension
   - Upload new version ZIP
   - Update store listing (if needed)
   - Submit for review

4. **Monitor Review Status**
   - Chrome Web Store review typically takes 1-3 days
   - Address any review feedback promptly
   - Publish once approved

### 6. Post-Release

1. **Verify Release**
   - Confirm GitHub Release is published
   - Verify tags are pushed
   - Check that artifacts are downloadable

2. **Communications**
   - Announce release (if applicable)
   - Update project README (if needed)
   - Close related GitHub issues/PRs

3. **Create Next Version Preparation**
   - Add "Unreleased" section to `CHANGELOG.md`
   - Begin tracking next version changes

## Hotfix Process

**For critical bugs in production:**

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/vX.Y.Z+1 vX.Y.Z
   ```

2. **Fix the Issue**
   - Make minimal changes to fix the critical bug
   - Update tests
   - Update changelog

3. **Bump Patch Version**
   - Increment PATCH version
   - Update `package.json` and `manifest.json`

4. **Test Thoroughly**
   - Run all automated tests
   - Manually verify the fix
   - Ensure no regressions

5. **Merge and Release**
   ```bash
   git checkout main
   git merge hotfix/vX.Y.Z+1
   git tag -a vX.Y.Z+1 -m "Hotfix vX.Y.Z+1"
   git push origin main --tags
   ```

6. **Follow Standard Release Process**
   - Create GitHub Release
   - Upload to Chrome Web Store (expedited review if possible)

7. **Clean Up**
   ```bash
   git branch -d hotfix/vX.Y.Z+1
   ```

## Release Cadence

- **Major releases (X.0.0)**: As needed for breaking changes
- **Minor releases (0.Y.0)**: Monthly or when significant features are ready
- **Patch releases (0.0.Z)**: As needed for bug fixes
- **Hotfixes**: Immediately for critical issues

## Rollback Process

**If a release has critical issues:**

1. **Immediate Action**
   - Document the issue
   - Communicate to users (if published)

2. **Hotfix or Rollback**
   - Option A: Create hotfix (preferred)
   - Option B: Revert to previous version on Chrome Web Store

3. **Post-Mortem**
   - Document what went wrong
   - Update testing/validation process to prevent recurrence

## Tools and Automation

- **Version Management**: Manual (package.json, manifest.json)
- **Changelog**: Manual (CHANGELOG.md)
- **Tagging**: Manual (Git tags)
- **CI/CD**: GitHub Actions (when implemented)
- **Release Notes**: Manual (GitHub Releases)

## Future Improvements

- Automate version bumping with release scripts
- Automated changelog generation from commit messages
- Automated GitHub Release creation
- Automated Chrome Web Store publishing
- Release candidate automation
- Semantic release tooling integration
