# Agent Operating Handbook

This directory contains the authoritative operating rules for coding agents working in the ZipKit repository.

## Required Reading Before Making Changes

Before implementing any change, read the documents relevant to your task:

### Always Read

1. **PRINCIPLES.md** — Core engineering principles and non-negotiable rules
2. **WORKFLOW.md** — Issue-driven development process
3. **COMMITS.md** — Commit message standards and practices

### Read Based on Task Type

**For all pull requests:**
- PULL_REQUESTS.md

**For branch creation:**
- BRANCHES.md

**For code changes:**
- ISSUE_EXECUTION.md
- Relevant product/architecture documentation in `/docs/`

**For test-related work:**
- TESTING.md

**For release work:**
- RELEASES.md

**For security-sensitive changes:**
- SECURITY.md
- `/docs/security/` documentation

## Quick Reference

### Standard Workflow

```
1. Read the GitHub issue
2. Read linked documentation
3. Verify dependencies are complete
4. Create feature branch (see BRANCHES.md)
5. Implement focused change
6. Add/update tests
7. Run checks locally
8. Create focused commits (see COMMITS.md)
9. Push branch
10. Open PR (see PULL_REQUESTS.md)
11. Link PR to issue
12. Respond to review feedback
13. Wait for CI
14. Merge via approved process
15. Delete feature branch
```

### Before Every Commit

- Run `npm run format`
- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run test`

### Core Rules

- Never work directly on `main`
- Never mention AI/Claude in repository metadata
- Keep changes small and focused
- One logical change per commit
- Reference issues from PRs
- Update documentation when behavior changes
- Never disable tests to make changes pass
- Never weaken security without explicit justification

## Documentation Structure

```
.claude/
  README.md              ← You are here
  PRINCIPLES.md          ← Core engineering principles
  WORKFLOW.md            ← Issue-driven development
  COMMITS.md             ← Commit standards
  BRANCHES.md            ← Branch naming and lifecycle
  PULL_REQUESTS.md       ← PR standards and template usage
  TESTING.md             ← Testing requirements
  RELEASES.md            ← Release process
  SECURITY.md            ← Security guidelines
  ISSUE_EXECUTION.md     ← How to execute issues
```

## Questions?

If documentation is unclear or contradictory, create an issue to resolve the ambiguity rather than guessing.
