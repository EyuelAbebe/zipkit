# ZipKit Deployment Guide

Complete guide for deploying ZipKit to Chrome Web Store and managing releases.

## Quick Start

### First Time Setup (One-time)

1. **Register Chrome Web Store Developer Account** ($5 fee)

   ```
   https://chrome.google.com/webstore/devconsole
   ```

2. **Follow Setup Guide**
   - See: `CHROME_WEB_STORE_SETUP.md` for detailed instructions
   - Get API credentials
   - Add GitHub secrets

3. **Manual First Submission**
   - Upload `zipkit-v0.1.0-rc.1.zip`
   - Complete store listing
   - Submit for review (1-3 days)

### Regular Releases (After Setup)

```bash
# 1. Prepare release
npm run build
npm run typecheck
npm test

# 2. Update version in package.json
# Edit: "version": "0.2.0"

# 3. Create and push tag
git add .
git commit -m "Release v0.2.0"
git tag v0.2.0
git push origin main
git push origin v0.2.0

# ✅ GitHub Actions automatically:
# - Builds extension
# - Runs tests
# - Publishes to Chrome Web Store
# - Creates GitHub release
```

---

## Deployment Workflows

### 1. Automated Production Release

**Trigger**: Push version tag

```bash
git tag v0.1.0
git push origin v0.1.0
```

**What happens:**

- ✅ Runs full test suite
- ✅ Builds production package
- ✅ Publishes to Chrome Web Store (live)
- ✅ Creates GitHub Release with package

**When to use:**

- Stable production releases
- After thorough testing
- Following semantic versioning

---

### 2. Manual Draft Upload

**Trigger**: Manual workflow dispatch with "draft" target

**Steps:**

1. Go to Actions tab
2. Select "Publish to Chrome Web Store"
3. Click "Run workflow"
4. Select `draft`
5. Click "Run workflow"

**What happens:**

- ✅ Uploads to Chrome Web Store
- ⏸️ Does NOT publish (stays as draft)
- ✅ Available for manual review in dashboard

**When to use:**

- Testing deployment workflow
- Pre-release review
- Before major releases

---

### 3. Trusted Testers Release

**Trigger**: Manual workflow dispatch with "trustedTesters" target

**What happens:**

- ✅ Publishes to trusted testers only
- ❌ NOT visible to public

**When to use:**

- Beta testing
- Early access releases
- Testing with select users

---

### 4. Release Candidate (RC)

**Trigger**: Push RC tag (e.g., `v0.1.0-rc.1`)

```bash
git tag v0.1.0-rc.1
git push origin v0.1.0-rc.1
```

**What happens:**

- ✅ Creates GitHub pre-release
- ✅ Generates package
- ❌ Does NOT publish to Chrome Web Store

**When to use:**

- Pre-release testing
- Internal validation
- Before major releases

---

## Version Management

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

Examples:
- 0.1.0 → First release
- 0.1.1 → Bug fixes
- 0.2.0 → New features (backward compatible)
- 1.0.0 → First stable release
```

### Version Update Checklist

Before releasing:

- [ ] Update `package.json` version
- [ ] Update `CHANGELOG.md`
- [ ] Create/update `RELEASE_NOTES_v{VERSION}.md`
- [ ] Update version references in docs
- [ ] Ensure manifest.json version synced (automated)

### Version Sync

The build system automatically syncs versions:

- `package.json` → source of truth
- `manifest.json` → updated during build
- Both must match for release

---

## Pre-Release Checklist

Before deploying to production:

### Code Quality

- [ ] All TypeScript type checks pass
- [ ] ESLint passes with no warnings
- [ ] Code formatted with Prettier
- [ ] No console errors in build

### Testing

- [ ] Unit tests pass (when implemented)
- [ ] E2E tests pass
- [ ] Manual testing completed:
  - [ ] Extension loads without errors
  - [ ] Can extract ZIP files
  - [ ] Can create archives
  - [ ] Security scanning works
  - [ ] File locations display correctly
  - [ ] Settings persist

### Documentation

- [ ] CHANGELOG.md updated
- [ ] Release notes created
- [ ] README reflects new features
- [ ] Screenshots updated (if UI changed)

### Build

- [ ] Clean build succeeds
- [ ] Package size reasonable (<10MB)
- [ ] All assets included
- [ ] No source maps in production (check)

### Security

- [ ] No sensitive data in code
- [ ] API keys in GitHub Secrets
- [ ] Permissions justified
- [ ] Security scan passes

---

## Release Process

### Standard Release (Recommended)

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Create release branch
git checkout -b release/v0.2.0

# 3. Update version
# Edit package.json: "version": "0.2.0"
npm install  # Updates package-lock.json

# 4. Update documentation
# Edit CHANGELOG.md
# Create RELEASE_NOTES_v0.2.0.md

# 5. Run full test suite
npm run typecheck
npm run lint
npm run test
npm run build

# 6. Test manually
cd apps/extension/dist
# Load in Chrome and test

# 7. Commit changes
git add .
git commit -m "chore: prepare release v0.2.0"

# 8. Merge to main
git checkout main
git merge release/v0.2.0
git push origin main

# 9. Create and push tag
git tag v0.2.0
git push origin v0.2.0

# 10. Monitor deployment
# Watch: https://github.com/eyuelabebe/zipkit/actions

# 11. Verify in Chrome Web Store
# Check: https://chrome.google.com/webstore/devconsole

# 12. Clean up
git branch -d release/v0.2.0
```

---

## Monitoring Deployments

### GitHub Actions

1. Go to: `https://github.com/eyuelabebe/zipkit/actions`
2. Click on latest workflow run
3. Monitor steps:
   - Build
   - Test
   - Package
   - Upload
   - Publish

### Chrome Web Store

1. Go to: `https://chrome.google.com/webstore/devconsole`
2. Select ZipKit extension
3. Check tabs:
   - **Package**: Upload history
   - **Store Listing**: Current version
   - **Stats**: Downloads, users
   - **Reviews**: User feedback

### Status Emails

Google will email you about:

- ✅ Successful uploads
- ✅ Published updates
- ⚠️ Policy violations
- ❌ Rejected submissions

---

## Rollback Procedures

### Emergency Rollback

If critical bug in production:

**Option 1: Rollback in Chrome Web Store**

```
1. Go to Developer Dashboard
2. Click "Package" tab
3. Find previous stable version
4. Click "Publish this version"
5. Confirm rollback
```

**Option 2: Quick Fix Release**

```bash
# 1. Fix the bug
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/v0.2.1

# 3. Apply fix and test
# ... make changes ...
npm run build && npm test

# 4. Bump patch version
# Edit package.json: "version": "0.2.1"

# 5. Commit and release
git add .
git commit -m "fix: critical bug in extraction"
git checkout main
git merge hotfix/v0.2.1
git push origin main
git tag v0.2.1
git push origin v0.2.1

# Automated deployment happens
```

---

## Troubleshooting Deployments

### Build Fails

**Error**: TypeScript errors

```bash
npm run typecheck
# Fix reported errors
```

**Error**: Linting fails

```bash
npm run lint
# Fix or use npm run lint -- --fix
```

### Upload Fails

**Error**: "Extension ID not found"

- Verify `CHROME_EXTENSION_ID` secret
- Check extension exists in dashboard

**Error**: "Invalid credentials"

- Regenerate refresh token
- Update GitHub secrets
- Verify Chrome Web Store API enabled

**Error**: "Version already exists"

- Increment version in package.json
- Versions must be unique

### Publish Fails

**Error**: "Pending review"

- First submission needs manual approval
- Wait for approval email
- Check dashboard for status

**Error**: "Policy violation"

- Review email from Google
- Fix violations
- Resubmit manually

---

## Best Practices

### Release Cadence

- **Patch releases**: As needed for bugs
- **Minor releases**: Monthly (new features)
- **Major releases**: Quarterly (breaking changes)

### Testing Strategy

1. **Local**: All tests before commit
2. **RC**: Deploy to trusted testers
3. **Production**: After 1-2 days of RC testing

### Communication

- Update CHANGELOG.md for every release
- Tweet/announce major releases
- Respond to user reviews promptly
- Monitor GitHub issues

### Monitoring

- Check error rates after deployment
- Monitor user reviews
- Track download statistics
- Watch for support requests

---

## Deployment Scripts

### Quick Commands

```bash
# Check if ready for release
npm run release:verify

# Create release candidate
npm run release:rc 1

# Promote RC to release (local only, use git tag for auto-deploy)
npm run release:promote

# Build production package
npm run build

# Full test suite
npm run typecheck && npm run lint && npm test && npm run build
```

---

## Security Considerations

### GitHub Secrets

Never commit:

- ❌ Chrome Web Store credentials
- ❌ API keys
- ❌ Refresh tokens
- ❌ .pem files

Always use GitHub Secrets for:

- ✅ CHROME_EXTENSION_ID
- ✅ CHROME_CLIENT_ID
- ✅ CHROME_CLIENT_SECRET
- ✅ CHROME_REFRESH_TOKEN

### Code Review

Before deploying:

- Review all changes since last release
- Check for sensitive data exposure
- Verify permission changes are necessary
- Scan for security vulnerabilities

---

## Release Artifacts

Each release creates:

- ✅ Git tag (e.g., `v0.1.0`)
- ✅ GitHub Release with notes
- ✅ ZIP package (`zipkit-v0.1.0.zip`)
- ✅ Chrome Web Store listing update

---

## Support and Documentation

- **Setup Guide**: `CHROME_WEB_STORE_SETUP.md`
- **Release Process**: `docs/release/release-process.md`
- **Versioning**: `docs/release/versioning.md`
- **Workflow File**: `.github/workflows/publish-chrome-store.yml`

---

## Quick Reference

### Deployment Methods

| Method          | Trigger               | Auto-Publish | Use Case        |
| --------------- | --------------------- | ------------ | --------------- |
| Production      | `git tag v0.1.0`      | ✅ Yes       | Stable releases |
| Draft           | Manual workflow       | ❌ No        | Testing/Review  |
| Trusted Testers | Manual workflow       | ⚠️ Limited   | Beta testing    |
| RC              | `git tag v0.1.0-rc.1` | ❌ No        | Pre-release     |

### Common Commands

```bash
# Check status
git status
npm run typecheck

# Build
npm run build

# Test
npm test

# Release
git tag v0.1.0
git push origin v0.1.0

# Rollback
git tag -d v0.1.0
git push origin :refs/tags/v0.1.0
```

---

**Last Updated**: 2026-09-20
**Version**: 1.0.0
