# ZipKit Issue Backlog

This document contains the detailed issue backlog for ZipKit, organized by phase. Each issue is designed to be independently implementable and follows the issue-driven development workflow.

## Issue Numbering

Issues will be created on GitHub and numbered automatically. This document provides the content for each issue.

## How to Use This Document

1. Read the issue definition
2. Create issue on GitHub using the template
3. Add appropriate labels and milestone
4. Assign to milestone
5. Mark dependencies

---

# Phase 0A: Repository Governance & Delivery Pipeline

**Goal:** Establish repository foundation, CI/CD, testing, and release infrastructure.

## Issue 0A-1: Configure TypeScript, ESLint, and Prettier

**Summary:** Set up TypeScript strict mode, ESLint, and Prettier with appropriate rules and CI integration.

**Scope:**
- Install and configure TypeScript 5.x with strict mode
- Configure ESLint with modern flat config
- Configure Prettier
- Add npm scripts for format, lint, typecheck
- Create initial tsconfig.json for monorepo

**Out of Scope:**
- Package-specific tsconfig files (later)
- Complex ESLint rules (start simple)

**Acceptance Criteria:**
- [ ] TypeScript strict mode enabled in tsconfig.json
- [ ] ESLint runs without errors
- [ ] Prettier formats code consistently
- [ ] `npm run format` auto-fixes formatting
- [ ] `npm run lint` checks code quality
- [ ] `npm run typecheck` verifies types

**Dependencies:** None

**Labels:** `type:chore`, `area:build`, `priority:p0`

**Size:** Small

---

## Issue 0A-2: Create CI Pipeline with GitHub Actions

**Summary:** Implement GitHub Actions CI workflow for format, lint, typecheck, test, and build.

**Scope:**
- Create `.github/workflows/ci.yml`
- Jobs for format-check, lint, typecheck, test, build
- Run on push to main and pull requests
- Upload build artifacts

**Out of Scope:**
- E2E tests (separate workflow)
- Release workflows (separate)
- Matrix builds across Node versions

**Acceptance Criteria:**
- [ ] CI runs on PR and main branch pushes
- [ ] All quality checks run (format, lint, typecheck, test, build)
- [ ] Build artifacts uploaded
- [ ] CI failures block PR merge

**Dependencies:** Issue 0A-1

**Labels:** `type:chore`, `area:build`, `priority:p0`

**Size:** Small

---

## Issue 0A-3: Set Up E2E Testing Infrastructure with Playwright

**Summary:** Configure Playwright for browser E2E testing of Chrome extension.

**Scope:**
- Install Playwright
- Configure for Chromium browser
- Create E2E test directory structure
- Write smoke test that loads extension
- Add E2E workflow to GitHub Actions

**Out of Scope:**
- Comprehensive E2E tests (later phases)
- Multi-browser testing
- Visual regression testing

**Acceptance Criteria:**
- [ ] Playwright installed and configured
- [ ] Smoke test successfully loads extension in browser
- [ ] E2E tests run in CI
- [ ] Test failures captured with screenshots/traces

**Dependencies:** Issue 0A-2

**Labels:** `type:test`, `area:testing`, `priority:p0`

**Size:** Medium

---

## Issue 0A-4: Configure Dependabot for Dependency Updates

**Summary:** Enable Dependabot for automated dependency updates and security alerts.

**Scope:**
- Create `.github/dependabot.yml`
- Configure npm dependency updates
- Configure GitHub Actions dependency updates
- Set update schedule and PR limits

**Out of Scope:**
- Auto-merging dependency updates
- Custom dependency grouping (initially)

**Acceptance Criteria:**
- [ ] Dependabot configured
- [ ] Security alerts enabled
- [ ] Dependency update PRs created automatically

**Dependencies:** None

**Labels:** `type:chore`, `area:build`, `priority:p1`

**Size:** Small

---

## Issue 0A-5: Implement Release Scripts and Version Management

**Summary:** Create release scripts for RC creation, promotion, and version management.

**Scope:**
- Implement `scripts/release/verify.sh`
- Implement `scripts/release/create-rc.sh`
- Implement `scripts/release/promote.sh`
- Add npm scripts for release commands
- Document release process

**Out of Scope:**
- Chrome Web Store upload automation
- Automated changelog generation

**Acceptance Criteria:**
- [ ] verify.sh validates release preconditions
- [ ] create-rc.sh creates RC tags
- [ ] promote.sh promotes RC to final release
- [ ] All scripts executable and tested locally

**Dependencies:** Issue 0A-2

**Labels:** `type:chore`, `area:release`, `priority:p0`

**Size:** Medium

---

# Phase 0B: Foundation & Technical Research

**Goal:** Research libraries, define architecture, establish technical foundation.

## Issue 0B-1: Research and Evaluate Browser-Compatible ZIP Libraries

**Summary:** Evaluate JavaScript/WebAssembly ZIP libraries for browser compatibility, features, and performance.

**Scope:**
- Research candidate libraries (e.g., fflate, jszip, zip.js)
- Evaluate: browser support, streaming, ZIP64, Web Worker compatibility, bundle size, maintenance
- Test with sample archives
- Document findings and recommendation in ADR

**Out of Scope:**
- Implementation of ZIP adapter
- Password-protected ZIP support evaluation

**Acceptance Criteria:**
- [ ] At least 3 libraries evaluated
- [ ] Performance tested with 1MB, 100MB, 1GB archives
- [ ] Web Worker compatibility verified
- [ ] Recommendation documented in ADR
- [ ] Rationale for selection clear

**Dependencies:** None

**Labels:** `type:research`, `area:archive-core`, `priority:p0`

**Size:** Large

---

## Issue 0B-2: Research and Evaluate TAR/GZIP Libraries

**Summary:** Evaluate JavaScript TAR and GZIP libraries for browser use.

**Scope:**
- Research TAR libraries (e.g., js-untar, tar-stream equivalents)
- Research GZIP libraries (browser built-in CompressionStream, pako)
- Evaluate streaming support, performance, browser compatibility
- Document findings and recommendation in ADR

**Out of Scope:**
- TAR.GZ combined format handling (covered later)
- Exotic TAR features (sparse files, extended attributes)

**Acceptance Criteria:**
- [ ] TAR library evaluated and selected
- [ ] GZIP approach decided (built-in vs library)
- [ ] Performance tested
- [ ] Recommendation documented in ADR

**Dependencies:** None

**Labels:** `type:research`, `area:archive-core`, `priority:p0`

**Size:** Large

---

## Issue 0B-3: Define ArchiveAdapter Interface

**Summary:** Design and document the ArchiveAdapter abstraction for format-agnostic archive operations.

**Scope:**
- Define ArchiveAdapter TypeScript interface
- Define ArchiveEntry metadata structure
- Define progress and cancellation model
- Define error types
- Document in `docs/architecture/archive-engine.md`

**Out of Scope:**
- Implementation of concrete adapters
- Streaming implementation details

**Acceptance Criteria:**
- [ ] ArchiveAdapter interface defined with TypeScript
- [ ] Methods: inspect(), listEntries(), extract(), create()
- [ ] Progress and cancellation patterns defined
- [ ] Error model documented
- [ ] Architecture documentation updated

**Dependencies:** Issue 0B-1, Issue 0B-2

**Labels:** `type:feature`, `area:archive-core`, `priority:p0`

**Size:** Medium

---

## Issue 0B-4: Research File System Access API and Permissions

**Summary:** Investigate Chrome File System Access API for local file selection and saving.

**Scope:**
- Research File System Access API capabilities
- Test file/directory picking
- Test file saving
- Determine permission requirements
- Document findings and limitations

**Out of Scope:**
- Full implementation
- Fallback for unsupported browsers

**Acceptance Criteria:**
- [ ] File picker tested
- [ ] Directory picker tested
- [ ] File saving tested
- [ ] Permission requirements documented
- [ ] Browser compatibility documented

**Dependencies:** None

**Labels:** `type:research`, `area:extension`, `priority:p1`

**Size:** Medium

---

## Issue 0B-5: Define Web Worker Communication Protocol

**Summary:** Design message protocol for main thread ↔ Web Worker communication for archive operations.

**Scope:**
- Define command message types (inspect, extract, create, cancel)
- Define response message types (progress, entry, complete, error)
- Define progress reporting structure
- Define cancellation mechanism
- Document protocol in architecture docs

**Out of Scope:**
- Worker implementation
- Transferable object optimization (initially)

**Acceptance Criteria:**
- [ ] Message protocol defined with TypeScript types
- [ ] Command/response patterns documented
- [ ] Progress reporting structure defined
- [ ] Cancellation via AbortSignal or similar
- [ ] Architecture docs updated

**Dependencies:** Issue 0B-3

**Labels:** `type:feature`, `area:archive-core`, `priority:p0`

**Size:** Medium

---

# Phase 1: Extension Shell

**Goal:** Create basic Chrome extension structure with popup and workspace.

## Issue 1-1: Create Manifest V3 Extension Structure

**Summary:** Set up Chrome Manifest V3 extension with minimal permissions.

**Scope:**
- Create `apps/extension/manifest.json` with Manifest V3
- Define minimal permissions (storage only initially)
- Set up icons and branding
- Configure content security policy
- Create basic build process

**Out of Scope:**
- Popup UI implementation
- Background service worker logic
- Advanced permissions

**Acceptance Criteria:**
- [ ] Manifest V3 valid and loads in Chrome
- [ ] Only storage permission requested
- [ ] Icons present and display correctly
- [ ] Extension can be loaded unpacked

**Dependencies:** None

**Labels:** `type:feature`, `area:extension`, `priority:p0`

**Size:** Small

---

## Issue 1-2: Implement Extension Popup UI

**Summary:** Create extension popup with quick actions.

**Scope:**
- Design and implement popup HTML/CSS/JS
- "Open Archive" button
- "Create Archive" button
- Recent archives list (placeholder)
- Link to workspace

**Out of Scope:**
- Full workspace implementation
- Settings panel
- Complex UI framework (keep vanilla or lightweight)

**Acceptance Criteria:**
- [ ] Popup appears when extension icon clicked
- [ ] Buttons present and styled
- [ ] Clicking "Open Archive" triggers file picker
- [ ] Clicking "Create Archive" opens workspace tab

**Dependencies:** Issue 1-1

**Labels:** `type:feature`, `area:extension,area:ui`, `priority:p0`

**Size:** Medium

---

## Issue 1-3: Create Workspace Tab Structure

**Summary:** Set up full browser tab workspace for archive operations.

**Scope:**
- Create workspace HTML structure
- Basic routing (inspect, extract, create views)
- Layout with sidebar and main content area
- Navigation between views

**Out of Scope:**
- Archive processing functionality
- Complex UI components
- Full design implementation

**Acceptance Criteria:**
- [ ] Workspace opens in new tab
- [ ] Navigation between views works
- [ ] Layout responsive and functional
- [ ] Can return to popup

**Dependencies:** Issue 1-2

**Labels:** `type:feature`, `area:extension,area:ui`, `priority:p0`

**Size:** Medium

---

*For brevity, Phase 2-12 issues follow similar format. See full backlog in GitHub Issues once created.*

# Issue Creation Guide

## Creating Issues from This Backlog

For each issue definition:

1. Create issue on GitHub
2. Use issue title from backlog
3. Fill in description using Summary, Scope, Out of Scope, Acceptance Criteria
4. Add labels as specified
5. Assign to appropriate milestone
6. Add dependencies in issue body (link to prerequisite issues)

## Issue Template

```markdown
## Summary
[1-2 sentence summary]

## Scope
- [What's included]

## Out of Scope
- [What's explicitly not included]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies
- Blocked by #[issue number]
- Requires completion of #[issue number]

## Related Documentation
- [Link to architecture docs]
- [Link to ADRs]

## Notes
[Any additional context]
```

---

**Total Estimated Issues: 80-120 across all phases**

This backlog will be expanded with specific issues for each phase as needed during development.
