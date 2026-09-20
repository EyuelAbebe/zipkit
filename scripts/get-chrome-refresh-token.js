#!/usr/bin/env node
/* eslint-disable no-console, no-unused-vars */

/**
 * Chrome Web Store Refresh Token Generator
 *
 * This script helps you generate a refresh token for Chrome Web Store API access.
 * You'll need to have already created OAuth credentials in Google Cloud Console.
 *
 * Usage:
 *   node get-chrome-refresh-token.js
 *
 * Then follow the prompts to enter your Client ID and Client Secret.
 */

const https = require('https');
const http = require('http');
const url = require('url');
const readline = require('readline');

const REDIRECT_URI = 'http://localhost:8080';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function exchangeCodeForToken(code, clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    const tokenData = JSON.stringify({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
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

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Token exchange failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(tokenData);
    req.end();
  });
}

async function main() {
  console.log('\n==============================================');
  console.log('Chrome Web Store Refresh Token Generator');
  console.log('==============================================\n');

  console.log('Before starting, make sure you have:');
  console.log('1. Created a Google Cloud Project');
  console.log('2. Enabled Chrome Web Store API');
  console.log('3. Created OAuth 2.0 credentials (Desktop app type)');
  console.log('4. Configured OAuth consent screen\n');

  const proceed = await question('Ready to proceed? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    console.log('Aborted.');
    rl.close();
    process.exit(0);
  }

  console.log('\n--- Step 1: Enter Your OAuth Credentials ---\n');

  const clientId = await question('Enter your Client ID: ');
  const clientSecret = await question('Enter your Client Secret: ');

  if (!clientId || !clientSecret) {
    console.error('\n❌ Error: Client ID and Client Secret are required.');
    rl.close();
    process.exit(1);
  }

  console.log('\n--- Step 2: Authorize Application ---\n');

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/chromewebstore')}&` +
    `access_type=offline&` +
    `prompt=consent`;

  console.log('Opening your browser to authorize the application...');
  console.log("If it doesn't open automatically, copy this URL:\n");
  console.log(authUrl);
  console.log('\n');

  // Start local server
  const server = http.createServer(async (req, res) => {
    const query = url.parse(req.url, true).query;

    if (query.code) {
      const code = query.code;

      try {
        console.log('\n--- Step 3: Exchanging Code for Tokens ---\n');

        const tokens = await exchangeCodeForToken(code, clientId, clientSecret);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Success!</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card {
                  background: white;
                  border-radius: 12px;
                  padding: 40px;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                  max-width: 500px;
                  text-align: center;
                }
                h1 {
                  color: #10b981;
                  margin-top: 0;
                  font-size: 32px;
                }
                p {
                  color: #6b7280;
                  font-size: 16px;
                  line-height: 1.6;
                }
                .check {
                  width: 80px;
                  height: 80px;
                  background: #10b981;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 20px;
                  font-size: 40px;
                  color: white;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="check">✓</div>
                <h1>Success!</h1>
                <p>Your refresh token has been generated successfully.</p>
                <p>Return to your terminal to view the credentials.</p>
                <p style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
                  You can safely close this window.
                </p>
              </div>
            </body>
          </html>
        `);

        console.log('✅ Successfully generated refresh token!\n');
        console.log('==============================================');
        console.log('GitHub Secrets Configuration');
        console.log('==============================================\n');
        console.log('Add these as secrets in your GitHub repository:');
        console.log('(Settings > Secrets and variables > Actions > New repository secret)\n');
        console.log(`CHROME_CLIENT_ID`);
        console.log(`${clientId}\n`);
        console.log(`CHROME_CLIENT_SECRET`);
        console.log(`${clientSecret}\n`);
        console.log(`CHROME_REFRESH_TOKEN`);
        console.log(`${tokens.refresh_token}\n`);
        console.log('==============================================\n');
        console.log('⚠️  IMPORTANT: Keep these credentials secure!');
        console.log('   Never commit them to your repository.\n');

        setTimeout(() => {
          server.close();
          rl.close();
          process.exit(0);
        }, 1000);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Error</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card {
                  background: white;
                  border-radius: 12px;
                  padding: 40px;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                  max-width: 500px;
                  text-align: center;
                }
                h1 {
                  color: #ef4444;
                  margin-top: 0;
                }
                p { color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>❌ Error</h1>
                <p>${error.message}</p>
                <p>Return to your terminal for more details.</p>
              </div>
            </body>
          </html>
        `);

        console.error('\n❌ Error exchanging code for token:');
        console.error(error.message);
        console.error('\nPlease verify:');
        console.error('1. Client ID and Client Secret are correct');
        console.error('2. Chrome Web Store API is enabled');
        console.error('3. OAuth consent screen is configured');
        console.error('4. Redirect URI is set to http://localhost:8080\n');

        setTimeout(() => {
          server.close();
          rl.close();
          process.exit(1);
        }, 1000);
      }
    } else if (query.error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>Authorization Failed</title></head>
          <body>
            <h1>Authorization Failed</h1>
            <p>Error: ${query.error}</p>
            <p>Return to your terminal and try again.</p>
          </body>
        </html>
      `);

      console.error(`\n❌ Authorization failed: ${query.error}`);
      console.error('Description:', query.error_description || 'No description provided');

      setTimeout(() => {
        server.close();
        rl.close();
        process.exit(1);
      }, 1000);
    }
  });

  server.listen(8080, () => {
    console.log('🌐 Local server started on http://localhost:8080');
    console.log('Waiting for authorization...\n');

    // Try to open browser automatically
    const open =
      process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';

    try {
      require('child_process').exec(`${open} "${authUrl}"`);
    } catch (error) {
      console.log('Could not open browser automatically.');
      console.log('Please open the URL above manually.\n');
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error('\n❌ Error: Port 8080 is already in use.');
      console.error('Please close any applications using this port and try again.\n');
    } else {
      console.error('\n❌ Server error:', error.message);
    }
    rl.close();
    process.exit(1);
  });
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Unexpected error:', error.message);
  rl.close();
  process.exit(1);
});
