# GitHub Setup Guide

This document provides instructions for setting up the GitHub repository, labels, milestones, and branch protection.

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Repository created on GitHub: `https://github.com/eyuelabebe/zipkit`
- Local repository initialized with initial commit pushed

## Step 1: Create GitHub Repository (if not exists)

```bash
gh repo create zipkit --public --description "Zip. Unzip. Pack. Unpack. Inspect. Scan. A modern Chrome extension for archive operations." --homepage "https://github.com/eyuelabebe/zipkit"
```

## Step 2: Push Initial Commit

```bash
git remote add origin https://github.com/eyuelabebe/zipkit.git
git push -u origin main
```

## Step 3: Create Labels

```bash
# Type labels
gh label create "type:feature" --description "New functionality" --color "0E8A16"
gh label create "type:bug" --description "Bug or defect" --color "D73A4A"
gh label create "type:security" --description "Security-related" --color "B60205"
gh label create "type:test" --description "Testing improvements" --color "FBCA04"
gh label create "type:documentation" --description "Documentation updates" --color "0075CA"
gh label create "type:chore" --description "Maintenance and tooling" --color "FEF2C0"
gh label create "type:research" --description "Research or investigation" --color "D4C5F9"

# Area labels
gh label create "area:extension" --description "Chrome extension" --color "C2E0C6"
gh label create "area:archive-core" --description "Archive processing core" --color "C2E0C6"
gh label create "area:security" --description "Security and safety scanning" --color "C2E0C6"
gh label create "area:ui" --description "User interface" --color "C2E0C6"
gh label create "area:website" --description "Public website" --color "C2E0C6"
gh label create "area:testing" --description "Testing infrastructure" --color "C2E0C6"
gh label create "area:build" --description "Build and packaging" --color "C2E0C6"
gh label create "area:release" --description "Release process" --color "C2E0C6"
gh label create "area:documentation" --description "Documentation" --color "C2E0C6"

# Priority labels
gh label create "priority:p0" --description "Critical priority" --color "B60205"
gh label create "priority:p1" --description "High priority" --color "D93F0B"
gh label create "priority:p2" --description "Medium priority" --color "FBCA04"
gh label create "priority:p3" --description "Low priority" --color "0E8A16"

# Status labels
gh label create "status:blocked" --description "Blocked by dependency" --color "FFFFFF"
gh label create "status:ready" --description "Ready for implementation" --color "0E8A16"

# Other labels
gh label create "good-first-issue" --description "Good for newcomers" --color "7057FF"
gh label create "agent-friendly" --description "Suitable for AI agents" --color "EDEDED"
```

## Step 4: Create Milestones

```bash
gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 0A: Repository Governance & Delivery Pipeline" -f description="Establish repository governance, CI/CD, testing infrastructure, and release process"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 0B: Foundation & Technical Research" -f description="Architecture definition, library evaluation, and technical research"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 1: Extension Shell" -f description="Manifest V3 extension, popup, workspace UI"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 2: Archive Core Abstraction" -f description="Archive interfaces, streaming, workers, progress, cancellation"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 3: ZIP Support" -f description="ZIP inspection, creation, extraction"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 4: TAR & GZIP Support" -f description="TAR, GZIP, TAR.GZ support"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 5: Archive Inspection Experience" -f description="Archive file browser, metadata, preview"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 6: Archive Safety Engine" -f description="Path traversal, expansion analysis, security scanning"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 7: Archive Creation Experience" -f description="Create archives with UI"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 8: Extraction Experience" -f description="Extract archives with safety warnings"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 9: Download Integration" -f description="Chrome downloads API integration"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 10: Website" -f description="Public website for ZipKit"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 11: Hardening" -f description="Cross-platform testing, performance, security hardening"

gh api repos/eyuelabebe/zipkit/milestones -f title="Phase 12: Release Preparation" -f description="Chrome Web Store preparation and v0.1.0 release"
```

## Step 5: Configure Branch Protection

```bash
# Enable branch protection for main
gh api repos/eyuelabebe/zipkit/branches/main/protection -X PUT -f required_status_checks='{"strict":true,"contexts":["lint-and-format","typecheck","test","build"]}' -f enforce_admins=true -f required_pull_request_reviews='{"required_approving_review_count":0}' -f restrictions=null
```

Or via GitHub UI:

1. Go to Settings → Branches
2. Add rule for `main`:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require conversation resolution
   - ❌ Do not allow bypassing
   - Status checks: `lint-and-format`, `typecheck`, `test`, `build`

## Step 6: Enable Security Features

Via GitHub UI:

1. Settings → Security → Code security and analysis
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning

## Step 7: Create Issues

See `docs/issues/` directory for detailed issue definitions.

Create issues manually or use GitHub CLI:

```bash
# Example
gh issue create --title "Configure TypeScript and linting" --body-file docs/issues/phase-0a/001-configure-typescript.md --label "type:chore,area:build,priority:p0" --milestone "Phase 0A: Repository Governance & Delivery Pipeline"
```

## Verification

```bash
# List labels
gh label list

# List milestones
gh api repos/eyuelabebe/zipkit/milestones --jq '.[] | .title'

# Check branch protection
gh api repos/eyuelabebe/zipkit/branches/main/protection
```

## Troubleshooting

If commands fail, ensure:

- GitHub CLI is authenticated: `gh auth status`
- Repository exists: `gh repo view eyuelabebe/zipkit`
- You have admin permissions on the repository
