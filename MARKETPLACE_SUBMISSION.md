# Chrome Web Store Submission Guide

Complete step-by-step guide to submit ZipKit to Chrome Web Store.

## 📋 Overview

This guide covers:

1. ✅ First-time manual submission
2. ✅ Setting up automated deployments
3. ✅ Future releases

**Time Required**: ~30 minutes (first time), ~5 minutes (automated after setup)

---

## 🚀 Quick Start (First Submission)

### Step 1: Register Developer Account (5 minutes)

1. Go to [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)
2. Log in with your Google account
3. Accept the Developer Agreement
4. Pay **$5 USD** one-time registration fee
5. Complete your developer profile

### Step 2: Upload Extension (2 minutes)

1. Click **"New Item"** button
2. Upload `zipkit-v0.1.0-rc.1.zip` (located in project root)
3. Click **"Continue"**

### Step 3: Complete Store Listing (15 minutes)

Copy information from `CHROME_STORE_LISTING.md`:

#### Product Details Tab

**Basic Info:**

- **Name**: `ZipKit - Archive Manager`
- **Summary**: `Zip. Unzip. Pack. Unpack. Inspect. Scan. A modern, secure archive utility with built-in security scanning.`
- **Category**: `Productivity`
- **Language**: `English (United States)`

**Description**: (Copy from CHROME_STORE_LISTING.md)

```
Transform how you handle archives with ZipKit - a modern, secure, and
lightning-fast archive utility built right into your browser.

🔒 SECURITY-FIRST DESIGN
...
[Full description from CHROME_STORE_LISTING.md]
```

#### Privacy Tab

**Single Purpose**:

```
Archive file management - compress, decompress, and securely inspect archive files
```

**Permissions Justification**:

Storage:

```
Required to store user preferences (default format, compression level) and
maintain recent archives history for quick access.
```

Downloads:

```
Required to save extracted files and created archives to the user's Downloads
folder with automatic location handling.
```

**Host Permissions**: (None required - leave blank)

#### Store Listing Assets

**Required:**

- ✅ **Icon**: 128x128 (already included in package)
- ✅ **Small Promo Tile**: 440x280 (create or upload placeholder)
- ✅ **Screenshots**: At least 1 (1280x800 or 640x400)

**Recommended Screenshots to Include:**

1. Main popup interface showing archive selection
2. File extraction with security scan results
3. Archive creation with file selection
4. File tree view with security badges

**Optional:**

- Marquee Promo Tile: 1400x560
- Video: YouTube link

#### Additional Info

- **Website**: `https://github.com/eyuelabebe/zipkit`
- **Support Email**: Your email address
- **Support URL**: `https://github.com/eyuelabebe/zipkit/issues`

### Step 4: Submit for Review (1 minute)

1. Review all information
2. Click **"Save Draft"** to save your work
3. **IMPORTANT**: Copy your **Extension ID** from the URL:

   ```
   https://chrome.google.com/webstore/devconsole/[YOUR_EXTENSION_ID]
   ```

   Save this - you'll need it for automation!

4. Click **"Submit for Review"**
5. Confirm submission

### Step 5: Wait for Approval (1-3 business days)

- ⏰ Google reviews typically take 1-3 business days
- 📧 You'll receive email updates about the review status
- ✅ Once approved, click "Publish" to make it live

---

## 🤖 Automated Deployment Setup (One-Time)

After your first manual submission is approved, set up automation for future releases.

### Prerequisites

- [ ] Extension published at least once manually
- [ ] Extension ID saved
- [ ] GitHub repository admin access

### Step 1: Set Up Google Cloud Project (10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: `ZipKit Chrome Web Store`
3. Enable **Chrome Web Store API**:
   - APIs & Services → Library
   - Search "Chrome Web Store API"
   - Click "Enable"

### Step 2: Create OAuth Credentials (5 minutes)

1. Go to **APIs & Services** → **Credentials**
2. Configure OAuth Consent Screen (if not done):
   - User Type: **External**
   - App name: `ZipKit Publisher`
   - Support email: Your email
   - Scopes: Add `https://www.googleapis.com/auth/chromewebstore`
   - Save and continue

3. Create OAuth Client ID:
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - Application type: **Desktop app**
   - Name: `ZipKit Chrome Web Store Publisher`
   - Click **"Create"**

4. **Save these values**:
   - ✅ Client ID
   - ✅ Client Secret

### Step 3: Generate Refresh Token (2 minutes)

Run the included helper script:

```bash
node scripts/get-chrome-refresh-token.js
```

**The script will:**

1. Ask for your Client ID and Client Secret
2. Open your browser for authorization
3. Generate and display your Refresh Token

**Save this value**:

- ✅ Refresh Token

### Step 4: Add GitHub Secrets (2 minutes)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each:

| Secret Name            | Value                     |
| ---------------------- | ------------------------- |
| `CHROME_EXTENSION_ID`  | From Chrome Web Store URL |
| `CHROME_CLIENT_ID`     | From Google Cloud Console |
| `CHROME_CLIENT_SECRET` | From Google Cloud Console |
| `CHROME_REFRESH_TOKEN` | From script output        |

### Step 5: Test Automated Deployment (Optional)

Test with a draft upload:

1. Go to **Actions** tab in GitHub
2. Select **"Publish to Chrome Web Store"** workflow
3. Click **"Run workflow"**
4. Select `draft` target
5. Click **"Run workflow"**

This uploads but doesn't publish - perfect for testing!

---

## 🎯 Future Releases (Fully Automated)

After setup, deploying new versions is simple:

### Method 1: Automatic (Recommended)

```bash
# 1. Make your changes and test
npm run build
npm run typecheck
npm test

# 2. Update version in package.json
# Example: "version": "0.2.0"

# 3. Commit and create tag
git add .
git commit -m "feat: add new features for v0.2.0"
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

**That's it!** GitHub Actions will automatically:

- ✅ Build the extension
- ✅ Run all tests
- ✅ Upload to Chrome Web Store
- ✅ Publish to users
- ✅ Create GitHub release

### Method 2: Manual Workflow

For testing or beta releases:

1. Go to **Actions** tab
2. Click **"Publish to Chrome Web Store"**
3. Click **"Run workflow"**
4. Choose target:
   - `draft` - Upload only, don't publish
   - `trustedTesters` - Publish to beta testers only
5. Click **"Run workflow"**

---

## 📊 Monitoring Your Extension

### Chrome Web Store Dashboard

View your extension stats:

- **URL**: https://chrome.google.com/webstore/devconsole
- **Stats Tab**: Downloads, active users, ratings
- **Reviews Tab**: User feedback
- **Insights**: Usage trends

### GitHub Actions

Monitor deployments:

- **URL**: https://github.com/eyuelabebe/zipkit/actions
- View build logs
- Check deployment status
- Debug issues

---

## ✅ Pre-Submission Checklist

Before submitting to Chrome Web Store:

### Required

- [ ] Extension builds without errors
- [ ] All tests pass (E2E, unit, integration)
- [ ] Manually tested in Chrome
- [ ] No console errors or warnings
- [ ] All features working as expected
- [ ] Icons display correctly (16, 32, 48, 128)
- [ ] Store listing complete with description
- [ ] At least 1 screenshot added
- [ ] Privacy policy URL (if collecting data)
- [ ] Support email or website

### Recommended

- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] Release notes created
- [ ] Screenshots show key features
- [ ] Promo tiles created
- [ ] Support documentation ready

### Security

- [ ] No hardcoded credentials or secrets
- [ ] All API keys in GitHub Secrets
- [ ] Permissions are minimal and justified
- [ ] Security scanning enabled and working
- [ ] No unnecessary permissions requested

---

## 🐛 Troubleshooting

### "Upload Failed - Invalid manifest"

**Solution:**

- Verify manifest.json is valid JSON
- Check all required fields are present
- Ensure version follows format: X.Y.Z

### "Extension ID not found"

**Solution:**

1. Create extension in dashboard first (manual upload)
2. Copy Extension ID from dashboard URL
3. Add as `CHROME_EXTENSION_ID` GitHub Secret

### "OAuth Error - Invalid credentials"

**Solution:**

1. Verify Chrome Web Store API is enabled in Cloud Console
2. Regenerate refresh token using the script
3. Update all GitHub Secrets
4. Ensure OAuth consent screen is configured

### "Publish Failed - Pending review"

**Solution:**

- First submission must be manually approved
- Check your email for review status
- Wait for approval before using automation

### "Version already exists"

**Solution:**

- Increment version in package.json
- Each release must have a unique version number
- Follow semantic versioning (MAJOR.MINOR.PATCH)

---

## 📚 Additional Resources

### Documentation

- **Setup Guide**: `docs/deployment/CHROME_WEB_STORE_SETUP.md` (detailed)
- **Deployment Guide**: `docs/deployment/DEPLOYMENT_GUIDE.md` (operations)
- **Release Process**: `docs/release/release-process.md`
- **Workflow File**: `.github/workflows/publish-chrome-store.yml`

### Tools

- **Refresh Token Script**: `scripts/get-chrome-refresh-token.js`
- **Release Scripts**: `scripts/release/`

### External Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store API Docs](https://developer.chrome.com/docs/webstore/using_webstore_api/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)

---

## 🎉 Next Steps

After your extension is live:

1. **Monitor**: Check dashboard daily for reviews and stats
2. **Respond**: Reply to user reviews (both positive and negative)
3. **Update**: Push updates regularly with new features and fixes
4. **Promote**: Share on social media, Reddit, Product Hunt
5. **Iterate**: Use feedback to improve the extension

---

## 💡 Tips for Success

### Before Launch

- Test thoroughly across different Chrome versions
- Get friends/colleagues to beta test
- Prepare screenshots showcasing best features
- Write clear, compelling description

### After Launch

- Respond to reviews within 24 hours
- Fix critical bugs immediately (hotfix releases)
- Regular updates show active maintenance
- Listen to user feedback for feature ideas

### Marketing

- Submit to extension galleries/directories
- Write a blog post about the extension
- Share on Reddit (r/chrome, r/webdev)
- Post on Product Hunt
- Tweet about major updates

---

## 📞 Support

Need help?

- **GitHub Issues**: https://github.com/eyuelabebe/zipkit/issues
- **Email**: [Your support email]
- **Documentation**: See `docs/` directory

---

**Last Updated**: 2026-09-20
**Version**: 1.0.0
**Status**: ✅ Ready for Submission
