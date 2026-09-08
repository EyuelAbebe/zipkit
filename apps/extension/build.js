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

// Copy manifest.json
console.log('Copying manifest.json...');
copyFileSync(join(__dirname, 'manifest.json'), join(distDir, 'manifest.json'));

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
const uiStylesPath = join(__dirname, '..', '..', 'packages', 'ui', 'src', 'styles', 'components.css');
try {
  const uiStyles = readFileSync(uiStylesPath, 'utf8');
  writeFileSync(join(distDir, 'components.css'), uiStyles);
  console.log('✓ UI component styles copied');
} catch (error) {
  console.warn('Warning: Could not copy UI component styles:', error.message);
}

// Generate PNG icons from SVG
console.log('Generating icon files...');
// For now, just copy the SVG as a placeholder
// In a real build, you'd use a tool like sharp or canvas to convert SVG to PNG
const sizes = [16, 32, 48, 128];
sizes.forEach((size) => {
  // Create a simple placeholder - in production, use proper SVG->PNG conversion
  writeFileSync(
    join(distDir, 'icons', `icon-${size}.png`),
    `Placeholder for ${size}x${size} icon - TODO: Convert SVG to PNG`
  );
});

console.log('✓ Build complete! Extension is ready in ./dist');
console.log('');
console.log('To load the extension in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the apps/extension/dist directory');
