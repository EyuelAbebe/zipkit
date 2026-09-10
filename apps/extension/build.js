#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process';
import { mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist');

console.log('Building ZipKit extension...');

// Clean and create dist directory
try {
  execSync('rm -rf dist', { cwd: __dirname, stdio: 'inherit' });
} catch {
  // Directory might not exist, ignore
}
mkdirSync(distDir, { recursive: true });
mkdirSync(join(distDir, 'icons'), { recursive: true });

// Compile TypeScript and bundle with esbuild
console.log('Building workspace.js with esbuild...');
try {
  execSync(
    `npx esbuild src/workspace.ts --bundle --outfile=dist/workspace.js --platform=browser --format=esm --target=es2020 --sourcemap`,
    { cwd: __dirname, stdio: 'inherit' }
  );
  console.log('✓ workspace.js built successfully');
} catch (error) {
  console.error('Failed to build workspace.js:', error);
  process.exit(1);
}

console.log('Building background.js with esbuild...');
try {
  execSync(
    `npx esbuild src/background.ts --bundle --outfile=dist/background.js --platform=browser --format=esm --target=es2020 --sourcemap`,
    { cwd: __dirname, stdio: 'inherit' }
  );
  console.log('✓ background.js built successfully');
} catch (error) {
  console.error('Failed to build background.js:', error);
  process.exit(1);
}

console.log('Building popup.js with esbuild...');
try {
  execSync(
    `npx esbuild src/popup.ts --bundle --outfile=dist/popup.js --platform=browser --format=esm --target=es2020 --sourcemap`,
    { cwd: __dirname, stdio: 'inherit' }
  );
  console.log('✓ popup.js built successfully');
} catch (error) {
  console.error('Failed to build popup.js:', error);
  process.exit(1);
}

// Copy manifest.json and inject version from package.json
console.log('Copying manifest.json and injecting version...');
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
const manifestJson = JSON.parse(readFileSync(join(__dirname, 'manifest.json'), 'utf8'));
manifestJson.version = packageJson.version;
writeFileSync(join(distDir, 'manifest.json'), JSON.stringify(manifestJson, null, 2));
console.log(`✓ Manifest version set to ${packageJson.version}`);

// Copy HTML files
console.log('Copying HTML files...');
copyFileSync(join(__dirname, 'src', 'popup.html'), join(distDir, 'popup.html'));
copyFileSync(join(__dirname, 'src', 'workspace.html'), join(distDir, 'workspace.html'));

// Copy CSS files
console.log('Copying CSS files...');
copyFileSync(join(__dirname, 'src', 'popup.css'), join(distDir, 'popup.css'));
copyFileSync(join(__dirname, 'src', 'workspace.css'), join(distDir, 'workspace.css'));

// Copy UI component styles
console.log('Copying UI component styles...');
const uiStylesPath = join(
  __dirname,
  '..',
  '..',
  'packages',
  'ui',
  'src',
  'styles',
  'components.css'
);
try {
  const uiStyles = readFileSync(uiStylesPath, 'utf8');
  writeFileSync(join(distDir, 'components.css'), uiStyles);
  console.log('✓ UI component styles copied');
} catch (error) {
  console.warn('Warning: Could not copy UI component styles:', error.message);
}

// Generate icon files
console.log('Generating icon files...');

// Simple base64 encoded 1x1 PNG with blue color as placeholder
// In production, use proper tools like sharp or @squoosh/lib to convert SVG to PNG
// eslint-disable-next-line no-unused-vars
const createSimpleIcon = (_size) => {
  // This creates a simple blue square PNG (base64 encoded)
  // A minimal PNG file header + blue pixel data
  const pngHeader =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(pngHeader, 'base64');
};

const sizes = [16, 32, 48, 128];
sizes.forEach((size) => {
  // For now, create a minimal placeholder PNG
  // TODO: Use sharp or similar tool to properly convert icon.svg to PNG
  writeFileSync(join(distDir, 'icons', `icon-${size}.png`), createSimpleIcon(size));
});

console.log('✓ Icons generated (using placeholder - install sharp for proper icons)');

console.log('✓ Build complete! Extension is ready in ./dist');
console.log('');
console.log('To load the extension in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the apps/extension/dist directory');
