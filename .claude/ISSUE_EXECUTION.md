# Issue Execution Guide

This document describes how to execute a GitHub issue from start to finish.

## Before You Start

### 1. Read the Issue

Read the entire issue including:

- Summary
- Background/motivation
- Scope
- Out of scope
- Technical notes
- Acceptance criteria
- Test requirements
- Dependencies
- Related documentation

### 2. Verify Prerequisites

Check:

- ✅ Issue is assigned (or available for self-assignment)
- ✅ Issue is in "Ready" status or backlog
- ✅ Blocking issues are resolved (`status:blocked` label absent)
- ✅ Dependencies are complete
- ✅ You understand the requirements

If anything is unclear:

- **Ask in issue comments** before implementing
- Do not guess at requirements
- Wait for clarification

### 3. Read Related Documentation

Check issue's "Related Documentation" section and read:

- Product documentation (`/docs/product/`)
- Architecture documentation (`/docs/architecture/`)
- Security documentation (`/docs/security/`)
- Relevant ADRs (`/docs/decisions/`)
- Relevant `.claude/` guidelines

### 4. Check CODEOWNERS

If the change touches sensitive areas (see `CODEOWNERS`):

- Understand heightened review expectations
- Be extra thorough with testing
- Provide detailed PR context

## Implementation

### 1. Create Feature Branch

Follow branch naming conventions (see `BRANCHES.md`):

```bash
git checkout main
git pull origin main
git checkout -b feature/42-zip-entry-inspection
```

### 2. Implement Scope Only

**Do only what the issue requests.**

Do not:

- Add unrelated features
- Refactor unrelated code (unless small and directly beneficial)
- Silently change architecture
- Skip required work

If you discover additional work:

- Create a follow-up issue (preferred)
- Discuss in PR if small and directly related
- Never hide required work in TODO comments

### 3. Follow Coding Standards

See `/docs/development/coding-standards.md`:

- TypeScript strict mode
- Clear naming
- Small focused functions
- Appropriate comments
- No dead code
- No console.log in production code

### 4. Add Tests

See `TESTING.md`:

- Unit tests for logic
- Integration tests for components working together
- E2E tests for user workflows
- Fixtures for archive-related work

**Never skip tests to save time.**

### 5. Run Checks Locally

Before pushing:

```bash
npm run format       # Auto-fix formatting
npm run lint         # Check code quality
npm run typecheck    # Verify types
npm run test         # Run all tests
npm run build        # Ensure builds
```

Fix all failures before pushing.

### 6. Update Documentation

If behavior changes, update:

- Code comments
- API documentation
- Architecture docs
- User-facing docs
- ADRs (for significant architecture changes)

Never describe unimplemented features as complete.

### 7. Create Focused Commits

See `COMMITS.md`:

- One logical change per commit
- Conventional Commits format
- Clear commit messages
- No AI attribution

Example workflow:

```bash
# Implement feature
git add packages/archive-core/src/zip-adapter.ts
git commit -m "feat: add ZIP central directory parsing"

# Add tests
git add packages/archive-core/src/zip-adapter.test.ts
git add tests/fixtures/normal.zip
git commit -m "test: add ZIP adapter unit tests and fixtures"

# Update docs
git add docs/architecture/archive-engine.md
git commit -m "docs: document ZIP adapter implementation"
```

### 8. Push Branch

```bash
git push -u origin feature/42-zip-entry-inspection
```

## Create Pull Request

### 1. Open PR

Use GitHub UI or CLI:

```bash
gh pr create --web
```

### 2. Fill Out Template

Follow `.github/PULL_REQUEST_TEMPLATE.md` (see `PULL_REQUESTS.md`):

- Summary
- Background
- Changes
- Reviewer context
- Testing
- Screenshots (if UI)
- Risks
- Issue reference
- Checklist

**Do not just duplicate the issue description.**

### 3. Link to Issue

Use GitHub syntax:

```markdown
Closes #42
```

This auto-closes the issue when PR merges.

### 4. Self-Review

Before requesting review:

- Read your own diff
- Check for debug code
- Verify test coverage
- Ensure CI will pass
- Check for typos
- Verify no secrets

## Review and Iteration

### 1. Wait for CI

All checks must pass:

- ✅ Format
- ✅ Lint
- ✅ Typecheck
- ✅ Tests
- ✅ Build
- ✅ E2E (if applicable)

If CI fails:

1. Read the logs
2. Fix locally
3. Run checks locally
4. Push fix
5. Wait for CI again

**Never bypass CI.**

### 2. Respond to Review Feedback

When reviewer comments:

1. **Read carefully**
2. **Ask questions** if unclear
3. **Discuss** if you disagree (respectfully)
4. **Make changes** when agreed
5. **Push updates**
6. **Mark conversations resolved**
7. **Re-request review**

Example update:

```bash
git add packages/archive-core/src/zip-adapter.ts
git commit -m "fix: address review feedback on error handling"
git push
```

### 3. Handle Conflicts

If `main` advances and creates conflicts:

```bash
git checkout main
git pull origin main
git checkout feature/42-zip-entry-inspection
git rebase main
# Resolve conflicts
git push --force-with-lease
```

## Merge

### 1. Final Checks

Before merge:

- ✅ All CI checks pass
- ✅ Review approved
- ✅ Conversations resolved
- ✅ No merge conflicts
- ✅ Branch up-to-date (if required)

### 2. Merge via Approved Process

Typically **squash merge**:

- Combines commits into one
- Squash message follows Conventional Commits
- No AI attribution

### 3. Verify

After merge:

- ✅ Issue auto-closed (if using `Closes #N`)
- ✅ CI passes on `main`
- ✅ No breakage introduced

### 4. Clean Up

```bash
git checkout main
git pull origin main
git branch -d feature/42-zip-entry-inspection
```

Or use GitHub auto-delete.

## Common Scenarios

### Scope Expanded During Implementation

**Stop and discuss:**

1. Comment on issue or PR
2. Explain what additional work is needed
3. Options:
   - Create follow-up issue (preferred)
   - Expand current PR scope (if small and related)
   - Update original issue (rare)
4. Wait for agreement
5. Never silently expand scope

### Architecture Needs to Change

**Stop and document:**

1. Explain why current architecture doesn't work
2. Propose alternative
3. Create or update ADR
4. Discuss with maintainers
5. Get approval before proceeding
6. Update architecture docs

### Found a Bug

**It depends:**

**Bug is unrelated:**

- Create separate bug issue
- Fix in separate PR (if urgent)
- Otherwise continue with current work

**Bug blocks current work:**

- Fix in current PR
- Explain in PR description
- Add test for bug fix

**Bug is security issue:**

- Follow `SECURITY.md` reporting process
- Do not commit to public branch

### Tests Are Failing

**Do not:**

- Disable tests
- Skip tests
- Weaken assertions
- Bypass CI

**Do:**

- Fix the implementation
- Fix the test (if test is wrong)
- Ask for help if stuck

### CI Configuration Is Broken

If CI itself is wrong (not your code):

1. Verify it's actually CI's fault
2. Create issue for CI problem
3. Fix CI in separate PR
4. Then continue feature work

### Out of Time / Blocked

If you can't complete the issue:

1. **Communicate** in issue comments
2. **Explain** what's blocking you
3. **Add `status:blocked`** label if appropriate
4. **Unassign** yourself if you can't continue
5. **Push WIP** if partially complete (mark PR as draft)

## Definition of Done

Issue is complete only when:

- ✅ Scope fully implemented
- ✅ Acceptance criteria satisfied
- ✅ Tests added/updated
- ✅ Tests passing
- ✅ Documentation updated
- ✅ Security considerations addressed
- ✅ Code formatted and linted
- ✅ Type checking passes
- ✅ Build succeeds
- ✅ Feature branch created
- ✅ Commits follow conventions
- ✅ PR created and links issue
- ✅ PR provides reviewer context
- ✅ CI checks pass
- ✅ Review approved
- ✅ PR merged
- ✅ Follow-up work in new issues (not TODO comments)
- ✅ Branch deleted

## What Not to Do

- ❌ Start without reading the issue
- ❌ Guess at unclear requirements
- ❌ Silently expand scope
- ❌ Skip tests
- ❌ Disable CI checks
- ❌ Commit directly to `main`
- ❌ Include AI attribution
- ❌ Leave TODO comments for required work
- ❌ Push without running checks
- ❌ Merge with failing CI
- ❌ Ignore review feedback
- ❌ Weaken security without justification

## Getting Help

If stuck:

1. **Re-read documentation** — answer might be there
2. **Check related code** — see how similar features work
3. **Ask in issue** — clarify requirements
4. **Ask in PR** — get architectural guidance
5. **Check ADRs** — see if decision was already made

Don't struggle in silence.
