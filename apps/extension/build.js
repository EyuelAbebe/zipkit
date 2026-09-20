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

// Generate icon files from SVG
console.log('Generating icon files from SVG...');

// Read the source SVG
const iconSvgPath = join(__dirname, 'icons', 'icon.svg');
const iconSvg = readFileSync(iconSvgPath, 'utf8');

// Create HTML file that will render SVG to canvas and export as PNG
const sizes = [16, 32, 48, 128];
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Icon Generator</title>
</head>
<body style="margin: 0; padding: 20px; font-family: monospace;">
  <h2>ZipKit Icon Generator</h2>
  <p>Open this file in a browser and click the buttons to download icons:</p>
  <div id="icons"></div>
  <script>
    const iconSvg = \`${iconSvg}\`;
    const sizes = ${JSON.stringify(sizes)};

    function generateIcon(size) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      const svgBlob = new Blob([iconSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = function() {
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob(function(blob) {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = \`icon-\${size}.png\`;
          a.click();
          URL.revokeObjectURL(a.href);
        }, 'image/png');
        URL.revokeObjectURL(url);
      };

      img.src = url;
    }

    const container = document.getElementById('icons');
    sizes.forEach(size => {
      const btn = document.createElement('button');
      btn.textContent = \`Download icon-\${size}.png\`;
      btn.style.cssText = 'margin: 5px; padding: 10px 20px; font-size: 14px; cursor: pointer;';
      btn.onclick = () => generateIcon(size);
      container.appendChild(btn);
      container.appendChild(document.createElement('br'));
    });

    // Auto-generate all icons button
    const autoBtn = document.createElement('button');
    autoBtn.textContent = 'Download All Icons';
    autoBtn.style.cssText = 'margin: 10px 5px; padding: 12px 24px; font-size: 16px; font-weight: bold; background: #2563EB; color: white; border: none; border-radius: 6px; cursor: pointer;';
    autoBtn.onclick = () => {
      sizes.forEach((size, i) => {
        setTimeout(() => generateIcon(size), i * 500);
      });
    };
    container.appendChild(autoBtn);
  </script>
</body>
</html>
`;

// Write the HTML generator file
writeFileSync(join(__dirname, 'generate-icons.html'), htmlContent);

// Try to use resvg for PNG generation if available
try {
  const resvgModule = await import('@resvg/resvg-js');
  const { Resvg } = resvgModule;

  sizes.forEach((size) => {
    const resvg = new Resvg(iconSvg, { fitTo: { mode: 'width', value: size } });
    const pngData = resvg.render().asPng();
    writeFileSync(join(distDir, 'icons', `icon-${size}.png`), pngData);
  });

  console.log('✓ PNG icons generated');
} catch {
  // Fallback: copy SVG files
  sizes.forEach((size) => {
    const outputPath = join(distDir, 'icons', `icon-${size}.svg`);
    writeFileSync(outputPath, iconSvg);
  });
  console.log('✓ SVG icons copied (install @resvg/resvg-js for PNG icons)');
}

console.log('✓ Build complete! Extension is ready in ./dist');
console.log('');
console.log('To load the extension in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the apps/extension/dist directory');
