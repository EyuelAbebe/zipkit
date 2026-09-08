#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process';
import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
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

// Compile TypeScript
console.log('Compiling TypeScript...');
try {
  execSync('npx tsc', { cwd: __dirname, stdio: 'inherit' });
} catch {
  console.error('TypeScript compilation failed');
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

// Generate PNG icons from SVG
console.log('Generating icon files...');
// const svgContent = readFileSync(join(__dirname, 'icons', 'icon.svg'), 'utf8');

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
