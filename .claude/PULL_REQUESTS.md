# Pull Request Standards

Every pull request must provide sufficient information for a reviewer who did not follow the implementation.

## When to Create a PR

After:

- ✅ Implementation is complete
- ✅ Tests are added/updated
- ✅ Local checks pass (format, lint, typecheck, test, build)
- ✅ Commits are focused and follow conventions
- ✅ Branch is pushed to remote

Do not open draft PRs unless seeking early feedback on approach.

## PR Template Structure

Follow the template in `.github/PULL_REQUEST_TEMPLATE.md`:

### 1. Summary

Concise explanation of what changed.

Example:
```
Implements ZIP central directory reading and exposes archive entries
through the ArchiveAdapter interface.
```

### 2. Background

Why the change exists. Provide product, architectural, security, or bug context.

Example:
```
ZipKit needs to inspect ZIP archives before extraction to show users
the contents and detect security risks. This PR implements the core
inspection capability using streaming central directory parsing.
```

### 3. Changes

Focused explanation of the actual implementation.

Example:
```
- Added ZipAdapter implementing ArchiveAdapter interface
- Implemented streaming central directory parser
- Added entry metadata extraction (path, size, compression method)
- Integrated with Web Worker for background processing
- Added cancellation support via AbortSignal
```

### 4. Reviewer Context

Call out anything the reviewer should understand before reading the diff:

- Architectural decisions made
- Security implications
- Browser/API constraints
- Tradeoffs considered
- Intentional limitations
- Deliberately deferred work

Example:
```
The implementation uses streaming ZIP parsing rather than loading the entire
central directory to support multi-GB archives within browser memory limits.

ZIP64 support is intentionally deferred to a follow-up issue (#89) since MVP
focuses on archives under 4GB.

Password-protected entries are detected but decryption is out of scope.
```

### 5. Testing

List exactly what was tested. Include commands run:

```
Local checks:
- npm run format
- npm run lint
- npm run typecheck
- npm run test:unit
- npm run build

Manual testing:
- Tested with normal.zip (156 files)
- Tested with nested.zip (archives within archives)
- Tested with corrupted.zip (properly reports error)
- Tested cancellation during slow processing
```

### 6. Screenshots / UI Evidence

**Required for meaningful UI changes.**

Use browser DevTools, screenshots, or screen recordings.

For non-UI changes: "N/A — no UI changes"

### 7. Risks

Describe known risks or behavioral changes.

Examples:
```
- Changes extraction path validation — existing malformed archives may now be rejected
- Increases memory usage by ~5MB per active archive inspection
```

If no significant risks: "None identified"

### 8. Issue Reference

Use GitHub closing syntax when PR fully resolves an issue:

```
Closes #42
```

Use alternative syntax when PR contributes but doesn't complete:

```
Related to #42
```

### 9. Checklist

Standard checklist from template:

```
- [x] Scope matches the linked issue
- [x] Tests added or updated
- [x] Existing tests pass
- [x] Documentation updated where required
- [x] No unnecessary extension permissions added
- [x] Security impact considered
- [x] No AI attribution in repository metadata
- [x] Required CI checks pass
```

Check all applicable items.

## PR Title

Use the same format as commit messages:

```
<type>: <short summary>
```

Examples:
- `feat: add ZIP archive entry inspection`
- `fix: prevent extraction outside destination directory`
- `test: add high-expansion archive fixtures`
- `docs: document archive adapter contract`

## PR Description vs. Issue Description

**Do not simply duplicate the issue description.**

The issue describes **what** needs to be built and **why**.

The PR describes:

- **How** it was built
- **What** implementation choices were made
- **What** reviewers should know
- **What** was tested

## PR Size

Keep PRs **small and focused**:

- ✅ One issue
- ✅ One focused capability
- ✅ Reviewable in reasonable time

If a feature becomes large:

1. **Split into smaller issues**
2. **Create multiple PRs**
3. **Define clear boundaries** between PRs

## Unrelated Refactoring

**Avoid unrelated refactoring** inside feature PRs.

If a necessary refactor is large enough to distract from the feature:

1. **Create a separate issue** for the refactor
2. **Merge the refactor first**
3. **Then implement the feature**

Small related cleanup (renaming a variable, extracting a helper) is acceptable in feature PRs.

## Draft PRs

Use draft status when:

- Seeking early architectural feedback
- Work-in-progress that's not ready for review
- CI is expected to fail

Convert to ready-for-review only when:

- Implementation is complete
- Tests pass
- Ready for full review

## Responding to Review Feedback

1. **Read feedback carefully**
2. **Ask questions** if unclear
3. **Make requested changes**
4. **Push new commits** (easier to review incremental changes)
5. **Mark conversations as resolved** after addressing
6. **Re-run checks** after changes
7. **Re-request review** when ready

## Updating PRs

When making changes after review:

**Option 1: New commits** (preferred during review)
```bash
git commit -m "fix: address review feedback on path validation"
git push
```

**Option 2: Amend** (only if very small and recent)
```bash
git commit --amend
git push --force-with-lease
```

Never force-push if others are reviewing your PR.

## Merge Process

### Before Merge

- ✅ All required CI checks pass
- ✅ Review approval received (when required)
- ✅ All review conversations resolved
- ✅ Branch is up-to-date with main (if required)
- ✅ No merge conflicts

### Merge Method

Typically use **squash merge**:

- Combines all commits into one
- Results in clean linear history on `main`
- Squash commit message must follow conventions
- **No AI attribution** in squash commit

Preserve commits only when commit history provides real value.

### After Merge

1. **Verify merge succeeded**
2. **Delete feature branch**
3. **Verify issue is closed** (if using `Closes #N`)
4. **Create follow-up issues** for any discovered work

## CI Failures

If CI fails:

1. **Read the failure logs**
2. **Fix the issue** locally
3. **Run checks locally** to verify fix
4. **Push the fix**
5. **Wait for CI** to pass

**Never bypass CI.**

If CI is legitimately broken:

1. **Create an issue** for the CI problem
2. **Fix CI first** in separate PR
3. **Then continue** with feature work

## Multiple Reviewers

If multiple reviewers provide conflicting feedback:

1. **Ask for clarification**
2. **Discuss in PR comments**
3. **Reach consensus** before proceeding
4. **Document the decision** if architecturally significant

## Stale PRs

If a PR receives no review for extended period:

1. **Ping reviewers** in comments
2. **Rebase on latest main** if outdated
3. **Verify CI still passes**
4. **Add context** if requirements have changed

If abandoned:

1. **Close the PR**
2. **Update linked issue**
3. **Delete the branch**

## No AI Attribution

Never include in PR:

- AI tool mentions
- "Generated with Claude"
- Co-Authored-By AI
- Any AI attribution

Focus on the engineering work, not the tools used.
