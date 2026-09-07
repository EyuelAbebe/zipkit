# Development Setup

This guide walks you through setting up ZipKit for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Chrome** (for testing the extension)
- **Git** (for version control)

Verify your versions:

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

## Clone the Repository

```bash
git clone https://github.com/eyuelabebe/zipkit.git
cd zipkit
```

## Install Dependencies

ZipKit uses npm workspaces to manage multiple packages. Install all dependencies from the root:

```bash
npm install
```

This will install dependencies for:
- Root project tooling (TypeScript, ESLint, Prettier)
- Extension workspace (`apps/extension/`)
- Website workspace (`apps/website/`)
- Shared packages (`packages/`)

## Run Quality Checks

Before making changes, verify your environment is working by running all checks:

```bash
npm run format        # Format code with Prettier
npm run lint          # Lint code with ESLint
npm run typecheck     # Type-check with TypeScript
npm run test          # Run test suite
npm run build         # Build the project
```

All checks should pass on a clean checkout.

## Load Extension in Chrome

To test the extension locally:

1. **Build the extension** (when build script is implemented):
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load unpacked extension**:
   - Click "Load unpacked"
   - Navigate to the build output directory (typically `apps/extension/dist/` or `apps/extension/build/`)
   - Select the directory

4. **Verify installation**:
   - The ZipKit extension should appear in your extensions list
   - Pin it to your toolbar for easy access

5. **Test functionality**:
   - Right-click on a ZIP file in your file system
   - The extension options should appear in the context menu

## Workspace Structure

ZipKit uses a monorepo structure with npm workspaces:

```
zipkit/
├── .claude/              # Agent operating rules and guidelines
├── apps/                 # Application workspaces
│   ├── extension/        # Chrome extension
│   └── website/          # Documentation/landing website
├── packages/             # Shared packages
│   └── (future shared libraries)
├── docs/                 # Project documentation
│   ├── architecture/     # Architecture decisions and design
│   ├── development/      # Development guides (you are here)
│   ├── product/          # Product specifications
│   ├── security/         # Security documentation
│   └── testing/          # Testing documentation
├── tests/                # Cross-workspace tests
│   ├── fixtures/         # Test archive fixtures
│   └── e2e/              # End-to-end tests
├── scripts/              # Build and utility scripts
├── package.json          # Root workspace configuration
├── tsconfig.json         # Root TypeScript configuration
├── eslint.config.js      # ESLint configuration
└── prettier.config.js    # Prettier configuration
```

### Key Directories

- **`.claude/`**: Contains authoritative rules for agents working on this project. Always read before making changes.
- **`apps/extension/`**: The Chrome extension source code.
- **`apps/website/`**: Documentation and marketing website.
- **`packages/`**: Shared libraries used across workspaces (e.g., archive parsers, security utilities).
- **`docs/`**: All project documentation organized by category.
- **`tests/`**: Test fixtures and end-to-end tests that span multiple workspaces.

### TypeScript Configuration

The project uses TypeScript in **strict mode** with additional safety checks:

- `strict: true` — All strict type-checking options enabled
- `noUnusedLocals: true` — Error on unused local variables
- `noUnusedParameters: true` — Error on unused function parameters
- `noFallthroughCasesInSwitch: true` — Error on fallthrough cases
- `noUncheckedIndexedAccess: true` — Strict array/object index access

These settings catch many bugs at compile time. Do not weaken them without explicit justification.

## Development Workflow

### Making Changes

1. **Read the relevant issue** on GitHub
2. **Read linked documentation** in `.claude/` and `docs/`
3. **Create a feature branch** (see `.claude/BRANCHES.md`)
4. **Make focused changes**
5. **Add or update tests**
6. **Run checks locally**:
   ```bash
   npm run format
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```
7. **Commit with conventional format** (see `.claude/COMMITS.md`)
8. **Push and create PR** (see `.claude/PULL_REQUESTS.md`)

### Hot Reloading During Development

When developing the extension:

1. Make your code changes
2. Run build command
3. Go to `chrome://extensions/`
4. Click the refresh icon on the ZipKit extension card
5. Test your changes

For faster iteration, consider setting up watch mode (if/when implemented):

```bash
npm run dev:extension
```

### Running Specific Tests

```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests only
```

## Troubleshooting

### Dependencies Not Installing

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### TypeScript Errors

Ensure you're using the workspace TypeScript version:

```bash
npm run typecheck
```

If using an IDE, configure it to use the workspace TypeScript version (found in `node_modules/.bin/tsc`).

### Extension Not Loading

- Verify the build output directory contains `manifest.json`
- Check Chrome DevTools console for errors
- Ensure Chrome version supports Manifest V3
- Try removing and re-adding the extension

### Format/Lint Conflicts

Run formatters in order:

```bash
npm run format    # Prettier runs first
npm run lint      # ESLint runs second
```

Some lint errors require manual fixes. Never disable rules without justification.

## Next Steps

- Read **[coding-standards.md](./coding-standards.md)** for code quality guidelines
- Read **[ai-agent-guidelines.md](./ai-agent-guidelines.md)** if using AI assistance
- Review **`.claude/`** directory for authoritative development rules
- Check **`docs/architecture/`** for design decisions
- Review **`docs/security/`** for security requirements

## Getting Help

- Check existing **documentation** in `docs/` and `.claude/`
- Review **closed issues** on GitHub for similar problems
- Create a **new issue** if documentation is unclear or missing
- Never guess when documentation is ambiguous—ask for clarification
