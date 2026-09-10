.PHONY: help install clean build test lint format check dev extension load package upload release-verify release-rc release-promote pre-commit

help:
	@echo "ZipKit Development Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install     Install dependencies"
	@echo "  make build       Build all packages and extension"
	@echo "  make dev         Install + build (quick start)"
	@echo "  make test        Run all tests"
	@echo "  make lint        Run linter"
	@echo "  make format      Format code with Prettier"
	@echo "  make check       Run all quality checks (format, lint, typecheck)"
	@echo "  make pre-commit  Run format and lint (used by git pre-commit hook)"
	@echo ""
	@echo "Extension:"
	@echo "  make extension   Build extension only"
	@echo "  make load        Build and show instructions to load extension"
	@echo "  make package     Package extension for upload (creates .zip)"
	@echo "  make upload      Show instructions to upload to Chrome Web Store"
	@echo ""
	@echo "Release:"
	@echo "  make release-verify   Verify repository is ready for release"
	@echo "  make release-rc       Create release candidate (usage: make release-rc RC=1)"
	@echo "  make release-promote  Promote RC to final release (usage: make release-promote RC=v0.1.0-rc.1)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       Remove all build artifacts and node_modules"
	@echo ""

install:
	npm install

clean:
	npm run clean
	rm -rf apps/*/dist packages/*/dist

build:
	npm run build

dev: install build
	@echo "✓ Development environment ready"

test:
	npm run test:e2e

lint:
	npm run lint

format:
	npm run format

check:
	npm run format:check
	npm run lint
	npm run typecheck

pre-commit: format
	npm run lint
	@echo "✓ Code formatted and linted"

extension:
	npm run build --workspace=@zipkit/extension

load: extension
	@echo ""
	@echo "Extension built successfully!"
	@echo ""
	@echo "To load the extension in Chrome:"
	@echo "  1. Open Chrome and navigate to: chrome://extensions/"
	@echo "  2. Enable 'Developer mode' (toggle in top right)"
	@echo "  3. Click 'Load unpacked'"
	@echo "  4. Select directory: $(PWD)/apps/extension/dist"
	@echo ""

package: extension
	@echo "Packaging extension..."
	@cd apps/extension && zip -r ../../zipkit-extension.zip dist/*
	@echo ""
	@echo "✓ Extension packaged as: zipkit-extension.zip"
	@echo ""

release-verify:
	@npm run release:verify

release-rc:
	@npm run release:rc -- $(RC)

release-promote:
	@npm run release:promote -- $(RC)

upload: package
	@echo ""
	@echo "═══════════════════════════════════════════════════════"
	@echo "  Chrome Web Store Upload Instructions"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "Extension package ready: zipkit-extension.zip"
	@echo ""
	@echo "Step 1: Developer Account Setup"
	@echo "  • Go to: https://chrome.google.com/webstore/devconsole"
	@echo "  • Sign in with your Google account"
	@echo "  • Pay one-time \$$5 developer registration fee (if not done)"
	@echo ""
	@echo "Step 2: Upload Extension"
	@echo "  • Click 'New Item' button"
	@echo "  • Upload: zipkit-extension.zip"
	@echo "  • Fill in store listing details:"
	@echo "    - Name, Description, Category"
	@echo "    - Screenshots (1280x800 or 640x400)"
	@echo "    - Small icon (128x128)"
	@echo "    - Privacy policy (if collecting user data)"
	@echo ""
	@echo "Step 3: Submit for Review"
	@echo "  • Review all information"
	@echo "  • Click 'Submit for review'"
	@echo "  • Review typically takes 1-3 business days"
	@echo ""
	@echo "Alternative: Manual Testing"
	@echo "  • Use 'make load' to load unpacked extension for testing"
	@echo ""
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
