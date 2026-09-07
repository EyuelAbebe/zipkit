# Issue-Driven Development Workflow

All significant product work originates from a GitHub issue.

## When Issues Are Required

Issues are **mandatory** for:

- User-facing functionality
- Security changes
- Extension permission changes
- Architectural changes
- Dependency changes with meaningful impact
- Release process changes
- Breaking changes
- New archive format support

## When Issues May Be Optional

Small maintenance changes may skip issue creation if creating an issue would add unnecessary overhead:

- Fixing obvious typos in documentation
- Updating outdated dependency versions (routine maintenance)
- Formatting fixes
- Minor documentation improvements

**When in doubt, create an issue.**

## Standard Workflow

### 1. Before Starting

- **Read the issue completely**
- **Read linked architecture and product documentation** in `/docs/`
- **Verify blockers and dependencies are complete**
- **Confirm the issue is in "Ready" status** or has no blocking labels
- **Check CODEOWNERS** if touching sensitive areas

### 2. Create Feature Branch

- Follow branch naming conventions (see `BRANCHES.md`)
- Branch from latest `main`
- Keep branch scope aligned with issue scope

### 3. Implement

- **Implement the smallest complete change** that satisfies acceptance criteria
- Follow coding standards (see `/docs/development/coding-standards.md`)
- Maintain existing patterns unless explicitly changing them
- Do not silently expand scope

### 4. Test

- Add or update tests (see `TESTING.md`)
- Run required checks locally:
  ```bash
  npm run format
  npm run lint
  npm run typecheck
  npm run test
  npm run build
  ```
- For UI changes: verify manually in browser
- For archive work: test with relevant fixtures

### 5. Commit

- Create focused commits (see `COMMITS.md`)
- Each commit should represent one coherent change
- Use Conventional Commits format
- No AI attribution

### 6. Push and Create PR

- Push feature branch
- Open pull request following template (see `PULL_REQUESTS.md`)
- Link PR to issue using `Closes #N` or `Related to #N`
- Ensure PR description provides reviewer context

### 7. CI and Review

- **Wait for all required CI checks** to pass
- Never bypass failing checks
- Respond to review feedback promptly
- Make requested changes in new commits or amend if appropriate
- Re-run checks after changes

### 8. Merge

- Merge only through approved process (typically squash merge)
- Ensure squash commit message follows repository conventions
- No AI attribution in final commit
- Verify merge doesn't introduce conflicts

### 9. Clean Up

- **Delete feature branch** after merge unless explicitly retained
- **Close linked issues** if PR fully resolves them
- **Create follow-up issues** for discovered work not in original scope

## Handling Scope Changes

If during implementation you discover:

### Additional Required Work

**Do not silently expand scope.**

Options:

1. **Create a follow-up issue** for the new work (preferred for unrelated work)
2. **Discuss in PR comments** if it's directly related and small
3. **Update the original issue** if it's a clarification of requirements (rare)

### Architectural Changes Needed

1. **Stop implementation**
2. **Document the architectural need**
3. **Create or update an ADR** in `/docs/decisions/`
4. **Discuss with maintainers** before proceeding
5. **Update relevant architecture docs** in `/docs/architecture/`

### Security Issues Found

1. **Do not commit the security issue** to a public branch
2. **Follow SECURITY.md** reporting process
3. **Create a follow-up security issue** in the appropriate channel

## Multi-Issue Features

For large features requiring multiple issues:

1. **Create a tracking issue** that references all sub-issues
2. **Define clear boundaries** between sub-issues
3. **Document dependencies** between issues
4. **Implement in dependency order**
5. **Each sub-issue should be independently useful or testable** where possible

## Blocked Issues

If an issue becomes blocked:

1. **Add the `status:blocked` label**
2. **Comment explaining the blocker**
3. **Reference blocking issues** if applicable
4. **Do not start implementation** until blocker is resolved
5. **Update issue status** when blocker is cleared

## Questions During Implementation

If the issue description is ambiguous:

1. **Ask in issue comments** before implementing
2. **Do not guess** at requirements
3. **Wait for clarification**
4. **Update issue description** with clarifications for future reference

## Definition of Done

An issue is complete only when:

- ✅ Scope is fully implemented
- ✅ Acceptance criteria are satisfied
- ✅ Tests are added or updated
- ✅ Existing tests pass
- ✅ Documentation is updated (if required)
- ✅ Security considerations are addressed
- ✅ Feature branch exists
- ✅ Commits are focused and follow conventions
- ✅ PR links to the issue
- ✅ PR description provides reviewer context
- ✅ Required CI checks pass
- ✅ Review feedback is resolved
- ✅ PR is merged via approved process
- ✅ Follow-up work is captured in new issues (not hidden TODOs)
