# Chrome Web Store Setup Guide

This guide walks you through setting up automated deployment to the Chrome Web Store for ZipKit.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Chrome Web Store Account Setup](#chrome-web-store-account-setup)
3. [Getting API Credentials](#getting-api-credentials)
4. [Setting Up GitHub Secrets](#setting-up-github-secrets)
5. [First Manual Submission](#first-manual-submission)
6. [Automated Deployment](#automated-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Google account
- $5 USD for Chrome Web Store developer registration fee (one-time)
- GitHub repository admin access
- Extension package ready (`zipkit-v0.1.0-rc.1.zip`)

---

## Chrome Web Store Account Setup

### Step 1: Register as a Chrome Web Store Developer

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Log in with your Google account
3. Accept the Developer Agreement
4. Pay the one-time $5 USD registration fee
5. Complete your developer account information

### Step 2: Create Your First Extension Listing

1. Click **"New Item"** button
2. Upload `zipkit-v0.1.0-rc.1.zip`
3. Click **"Continue"**
4. You'll be taken to the Store Listing page

### Step 3: Complete Store Listing

Use the information from `CHROME_STORE_LISTING.md`:

#### Required Fields:

**Product Details:**

- **Name**: `ZipKit - Archive Manager`
- **Summary**: `Zip. Unzip. Pack. Unpack. Inspect. Scan. A modern, secure archive utility with built-in security scanning.`
- **Description**: Copy from `CHROME_STORE_LISTING.md`
- **Category**: `Productivity`
- **Language**: `English (United States)`

**Privacy:**

- **Single Purpose**: `Archive file management`
- **Permissions Justification**:
  - `storage`: Store user preferences and recent archive history
  - `downloads`: Download extracted files and created archives

**Store Assets:**

- **Icon**: Already included in package (128x128)
- **Screenshots**: At least 1 required (1280x800 or 640x400)
  - Take screenshots of the extension in action
  - Show: popup interface, extraction process, security scanning

**Optional but Recommended:**

- **Small Promo Tile**: 440x280
- **Website**: `https://github.com/eyuelabebe/zipkit`
- **Support Email**: Your email address

### Step 4: Save as Draft

1. Click **"Save Draft"** (don't publish yet)
2. **IMPORTANT**: Note your Extension ID from the URL:
   ```
   https://chrome.google.com/webstore/devconsole/[YOUR_EXTENSION_ID]
   ```
   Save this ID - you'll need it for automated deployment!

---

## Getting API Credentials

To enable automated publishing, you need to set up OAuth credentials.

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it: `ZipKit Chrome Web Store API`

### Step 2: Enable Chrome Web Store API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Chrome Web Store API"
3. Click on it and click **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: `ZipKit Publisher`
   - Support email: Your email
   - Add scope: `https://www.googleapis.com/auth/chromewebstore`
   - Save and continue
4. Return to Credentials
5. Create OAuth client ID:
   - Application type: **Desktop app**
   - Name: `ZipKit Chrome Web Store Publisher`
6. Click **"Create"**
7. **IMPORTANT**: Save these values:
   - Client ID
   - Client Secret

### Step 4: Get Refresh Token

You need to generate a refresh token. Use this Node.js script:

```javascript
// get-refresh-token.js
const https = require('https');
const http = require('http');
const url = require('url');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:8080';

// Step 1: Generate authorization URL
const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `response_type=code&` +
  `scope=https://www.googleapis.com/auth/chromewebstore&` +
  `access_type=offline&` +
  `prompt=consent`;

console.log('1. Open this URL in your browser:');
console.log(authUrl);
console.log('\n2. Authorize the application');
console.log('3. You will be redirected to localhost (this will start automatically)...\n');

// Step 2: Start local server to receive the code
const server = http.createServer(async (req, res) => {
  const query = url.parse(req.url, true).query;

  if (query.code) {
    const code = query.code;

    // Step 3: Exchange code for tokens
    const tokenData = JSON.stringify({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': tokenData.length,
      },
    };

    const tokenReq = https.request(options, (tokenRes) => {
      let data = '';
      tokenRes.on('data', (chunk) => (data += chunk));
      tokenRes.on('end', () => {
        const tokens = JSON.parse(data);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Success!</h1><p>You can close this window and return to the terminal.</p>');

        console.log('\n✅ Success! Your credentials:');
        console.log('\nCHROME_CLIENT_ID:', CLIENT_ID);
        console.log('CHROME_CLIENT_SECRET:', CLIENT_SECRET);
        console.log('CHROME_REFRESH_TOKEN:', tokens.refresh_token);
        console.log('\n⚠️  Save these values as GitHub Secrets!\n');

        server.close();
        process.exit(0);
      });
    });

    tokenReq.write(tokenData);
    tokenReq.end();
  }
});

server.listen(8080, () => {
  console.log('Server started on http://localhost:8080');
  console.log('Opening browser...\n');

  // Auto-open browser
  const open =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  require('child_process').exec(`${open} "${authUrl}"`);
});
```

**To run:**

```bash
# Save the script as get-refresh-token.js
# Replace YOUR_CLIENT_ID and YOUR_CLIENT_SECRET with your values
node get-refresh-token.js
```

This will:

1. Open your browser for authorization
2. Start a local server to receive the OAuth code
3. Exchange the code for a refresh token
4. Display all credentials you need

---

## Setting Up GitHub Secrets

### Step 1: Go to GitHub Repository Settings

1. Navigate to your repository: `https://github.com/eyuelabebe/zipkit`
2. Click **Settings** tab
3. Go to **Secrets and variables** > **Actions**

### Step 2: Add Required Secrets

Click **"New repository secret"** for each:

| Secret Name            | Value               | Where to Get It                  |
| ---------------------- | ------------------- | -------------------------------- |
| `CHROME_EXTENSION_ID`  | Your extension ID   | Chrome Web Store Dashboard URL   |
| `CHROME_CLIENT_ID`     | OAuth Client ID     | Google Cloud Console Credentials |
| `CHROME_CLIENT_SECRET` | OAuth Client Secret | Google Cloud Console Credentials |
| `CHROME_REFRESH_TOKEN` | Refresh Token       | Generated from script above      |

### Step 3: Verify Secrets

After adding all secrets, you should see:

- ✅ CHROME_EXTENSION_ID
- ✅ CHROME_CLIENT_ID
- ✅ CHROME_CLIENT_SECRET
- ✅ CHROME_REFRESH_TOKEN

---

## First Manual Submission

Before enabling automation, you must manually publish your extension at least once.

### Step 1: Submit for Review

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Find your extension draft
3. Click **"Submit for Review"**
4. Review process typically takes **1-3 business days**

### Step 2: Wait for Approval

You'll receive an email when:

- ✅ Extension is approved and published
- ❌ Extension requires changes

### Step 3: Publish

Once approved:

1. Click **"Publish"** in the dashboard
2. Your extension is now live!

---

## Automated Deployment

Once your extension is published, you can use automated deployment.

### Deployment Methods

#### Method 1: Automatic on Git Tag (Recommended for Production)

Push a version tag to automatically publish:

```bash
# Make sure your code is ready
npm run build
npm run typecheck
npm test

# Commit all changes
git add .
git commit -m "Release v0.1.0"

# Create and push tag
git tag v0.1.0
git push origin v0.1.0
```

This will:

- ✅ Build the extension
- ✅ Run all tests
- ✅ Upload to Chrome Web Store
- ✅ Publish automatically
- ✅ Create GitHub release with package

#### Method 2: Manual Workflow Dispatch

For testing or beta releases:

1. Go to **Actions** tab in GitHub
2. Select **"Publish to Chrome Web Store"** workflow
3. Click **"Run workflow"**
4. Choose publish target:
   - `draft` - Upload but don't publish (for review)
   - `trustedTesters` - Publish to trusted testers only
5. Click **"Run workflow"**

### Workflow Behavior

The workflow (`publish-chrome-store.yml`) will:

1. **Build**: Compile and bundle extension
2. **Test**: Run type checking, linting, tests
3. **Package**: Create ZIP file
4. **Upload**: Upload to Chrome Web Store API
5. **Publish**: Publish based on trigger:
   - **Git tag push**: Auto-publish to production
   - **Manual dispatch**: Based on selected target
6. **Release**: Create GitHub release (git tag only)

---

## Monitoring Deployments

### View Deployment Status

1. Go to **Actions** tab in GitHub
2. Click on the workflow run
3. Check each step's logs

### Check Chrome Web Store

1. Go to [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. View your extension
3. Check **"Package"** tab for upload history
4. Check **"Store Listing"** for current published version

---

## Troubleshooting

### Error: "Extension ID not found"

**Solution**: Make sure you've:

1. Created the extension in Chrome Web Store
2. Saved as draft at least once
3. Copied the correct Extension ID from the URL
4. Added it as `CHROME_EXTENSION_ID` secret

### Error: "Invalid OAuth credentials"

**Solution**:

1. Regenerate refresh token using the script
2. Make sure Chrome Web Store API is enabled
3. Verify all secrets are correctly added
4. Check that OAuth consent screen is configured

### Error: "Upload failed"

**Solution**:

1. Check that manifest version is incremented
2. Verify ZIP contains all required files
3. Ensure no prohibited code or permissions
4. Check Chrome Web Store Dashboard for specific error

### Error: "Cannot publish - pending review"

**Solution**:

- First submission must be manually approved
- Wait for approval before using automation
- Check email for review status

### Workflow not triggered

**Solution**:

1. Verify secrets are added correctly
2. Check tag format matches `v*.*.*` (not `v*.*.*-rc.*`)
3. Look at Actions tab for error messages

---

## Best Practices

### Version Management

1. **Always increment version** before publishing
2. **Use semantic versioning**: `MAJOR.MINOR.PATCH`
3. **Tag format**: `v0.1.0` (no `-rc` for production)

### Testing Before Release

```bash
# Local testing checklist
npm run typecheck
npm run lint
npm run test
npm run build

# Manual testing
cd apps/extension/dist
# Load extension in Chrome
# Test all features
```

### Rollback Plan

If you need to rollback:

1. Go to Chrome Web Store Dashboard
2. Click **"Package"** tab
3. Find previous version
4. Click **"Publish this version"**

---

## Next Steps

After setup:

- ✅ Test manual deployment with `draft` target
- ✅ Verify extension appears in dashboard
- ✅ Test automated deployment with tag
- ✅ Monitor user reviews and feedback
- ✅ Plan regular updates

---

## Support Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store API Documentation](https://developer.chrome.com/docs/webstore/using_webstore_api/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [ZipKit GitHub Actions](https://github.com/eyuelabebe/zipkit/actions)

---

**Last Updated**: 2026-09-20
**Version**: 1.0.0
