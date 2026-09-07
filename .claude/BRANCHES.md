# Branch Naming and Lifecycle

## Never Develop on Main

**All development must occur on feature branches.**

Direct commits to `main` are prohibited and prevented by branch protection.

## Branch Naming Convention

Use a consistent, descriptive naming pattern:

```
<type>/<issue-number>-<short-description>
```

### Types

- `feature/` — New functionality
- `fix/` — Bug fixes
- `security/` — Security-related changes
- `test/` — Test additions or improvements
- `docs/` — Documentation changes
- `chore/` — Build, tooling, dependencies, maintenance
- `refactor/` — Code improvements without behavior changes

### Examples

✅ **Good:**

```
feature/42-zip-entry-inspection
fix/103-cancel-extraction-worker
security/87-block-path-traversal
test/118-add-large-archive-fixtures
docs/95-document-security-model
chore/76-configure-playwright
refactor/134-extract-archive-adapter
```

❌ **Bad:**

```
my-feature              ❌ No type or issue number
feature/zip             ❌ No issue number, too vague
42-zip-support          ❌ No type
feature/implement-stuff ❌ No issue number, vague description
```

## Creating Branches

### From Latest Main

Always branch from the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/42-zip-entry-inspection
```

### Verify Issue State

Before creating the branch:

- ✅ Issue is assigned or ready
- ✅ Blockers are resolved
- ✅ Dependencies are complete
- ✅ Issue scope is clear

## Branch Lifecycle

### 1. Create

```bash
git checkout -b <type>/<issue>-<description>
```

### 2. Develop

- Make focused commits
- Push regularly to backup work
- Keep branch scope aligned with issue

### 3. Keep Updated

If `main` advances significantly:

```bash
git checkout main
git pull origin main
git checkout feature/42-zip-entry-inspection
git rebase main
```

Or use merge if rebase would be problematic:

```bash
git merge main
```

### 4. Push

```bash
git push origin feature/42-zip-entry-inspection
```

First push may require:

```bash
git push -u origin feature/42-zip-entry-inspection
```

### 5. Open PR

- Follow PR template
- Link to issue
- Provide reviewer context

### 6. Iterate

- Respond to review feedback
- Push additional commits or amend if appropriate
- Keep CI passing

### 7. Merge

- Merge via approved process (typically squash merge)
- Ensure final commit message follows conventions
- No AI attribution

### 8. Delete

**After merge, delete the feature branch:**

```bash
git checkout main
git pull origin main
git branch -d feature/42-zip-entry-inspection
git push origin --delete feature/42-zip-entry-inspection
```

Or use GitHub's automatic branch deletion.

## Short-Lived Branches

Feature branches should be **short-lived**:

- ✅ Days to 1-2 weeks typical
- ⚠️ Weeks to 1 month acceptable for large features
- ❌ Months-long branches indicate scope problems

If a branch lives too long:

1. **Break the work into smaller issues**
2. **Merge partial progress** if independently valuable
3. **Rebase frequently** to avoid conflicts
4. **Reconsider the approach** — is there a simpler path?

## Branch Protection

`main` is protected with:

- ❌ No direct pushes
- ✅ Require pull request
- ✅ Require status checks to pass
- ✅ Require review approval (when team grows)
- ✅ Require up-to-date branch (where practical)
- ❌ No force pushes
- ❌ No deletion

## Multiple Issues in One Branch

**Avoid.**

If you discover additional work:

1. **Create a follow-up issue** (preferred)
2. **Discuss with maintainers** if it must be in the same PR

Do not silently expand scope.

## Abandoned Branches

If a branch is no longer needed:

1. **Close or update the linked issue**
2. **Delete the branch**
3. **Document why** in issue comments if not obvious

## Branch Naming for Releases

Release branches (if used) follow:

```
release/v0.1.0
release/v1.0.0
```

This is only needed if the project adopts a release-branch strategy. Initially, releases are created directly from `main`.

## Special Branches

Other branches that may exist:

- `main` — protected default branch
- `release/*` — release preparation (if release-branch strategy adopted)

Do not create:

- `dev`, `develop`, `staging` — unnecessary for this project's workflow
- Personal experiment branches — use your own fork if needed
