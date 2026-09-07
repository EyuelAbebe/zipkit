# Commit Standards

## Format

Use **Conventional Commits** format:

```
<type>: <short summary>

[optional body]

[optional footer]
```

## Types

- `feat:` — New user-facing functionality
- `fix:` — Bug fix
- `docs:` — Documentation changes only
- `test:` — Test additions or updates
- `chore:` — Build, tooling, dependencies, maintenance
- `security:` — Security-related changes
- `refactor:` — Code changes that neither fix bugs nor add features
- `perf:` — Performance improvements
- `style:` — Code style/formatting (not visual UI style)

## Examples

### Good

```
feat: add ZIP archive entry inspection

Implements ZIP central directory reading and entry listing through
the ArchiveAdapter interface. Supports streaming metadata extraction
for large archives.
```

```
fix: prevent extraction outside destination directory

Path traversal vulnerability allowed malicious archives to escape
the selected extraction destination. Now normalizes and validates
all entry paths before extraction.
```

```
test: add high-expansion archive fixtures

Creates synthetic archive bomb fixtures for security testing.
Includes 1000:1, 10000:1, and 100000:1 expansion ratios.
```

```
docs: document archive adapter contract

Clarifies expected behavior for inspect(), listEntries(), and
extract() methods across different archive formats.
```

```
chore: configure browser integration tests

Sets up Playwright test harness for E2E testing of extension.
```

### Bad

```
feat: add stuff  ❌ Too vague
```

```
Add ZIP support  ❌ Missing type prefix
```

```
feat: add ZIP support, update docs, refactor security engine  ❌ Multiple unrelated changes
```

```
feat: implement ZIP archive inspection and extraction

Generated with Claude Code  ❌ AI attribution forbidden

Co-Authored-By: Claude <noreply@anthropic.com>  ❌ AI attribution forbidden
```

## Summary Line

- **Start with type prefix** (`feat:`, `fix:`, etc.)
- **Use imperative mood** ("add" not "added" or "adds")
- **Be specific** but concise
- **Lowercase after colon**
- **No period at end**
- **Aim for 50-72 characters**

## Body (Optional)

Use the body to explain:

- **Why** the change exists
- **What** problem it solves
- **How** it differs from previous behavior
- **Any** important context reviewers should know

Do not:

- Duplicate the summary
- Copy issue template text
- Include AI attribution
- Write giant generated explanations

## Footer (Optional)

Use for:

- **Issue references**: `Closes #42` or `Related to #87`
- **Breaking changes**: `BREAKING CHANGE: description`

Do not use for:

- AI attribution
- Co-Authored-By AI tools

## Commit Hygiene

### One Logical Change

Each commit should represent **one coherent change**:

✅ **Good:** Separate commits for:

- Implementing a feature
- Adding tests for that feature
- Updating docs for that feature

❌ **Bad:** Single commit containing:

- Three unrelated features
- Bug fix
- Dependency update
- Refactoring

### Commits Should Build

Where practical, each commit should leave the branch in a **valid state**:

- Code compiles/builds
- Tests pass (or are updated appropriately)
- Linting passes

Exception: Work-in-progress commits on personal feature branches are acceptable, but should be cleaned up before PR.

### Atomic vs. Micro-commits

✅ **Atomic:** Focused, complete, reviewable units of work

❌ **Micro:** `fix typo`, `another typo`, `forgot semicolon`

Prefer several logical commits over a single giant commit, but avoid meaningless micro-commits.

## References

Include issue numbers where relevant:

```
fix: cancel extraction worker properly

Fixes race condition where canceling extraction would leave
Web Worker in invalid state. Operation now cleans up resources
and terminates worker correctly.

Closes #103
```

## When to Amend

Use `git commit --amend` only when:

1. Fixing commit message typo
2. Adding forgotten file to most recent commit
3. Addressing pre-commit hook changes (see below)

**Never amend** commits that:

- Have been pushed to shared/protected branches
- Were authored by someone else
- Have been merged

## Pre-commit Hooks

If a pre-commit hook modifies files (e.g., auto-formatting):

1. Check the changes are acceptable
2. Check commit authorship: `git log -1 --format='%an %ae'`
3. Check not pushed: `git status`
4. If both checks pass: amend your commit
5. Otherwise: create a new commit

## AI Attribution

**Never include:**

- "Generated with Claude"
- "Created with AI"
- "Claude Code"
- `Co-Authored-By: Claude`
- Any similar attribution

Repository history must describe the engineering work, not the tool used.

## Multi-commit PRs vs. Squash

- **During development:** Multiple focused commits are encouraged
- **On merge:** Most PRs will be squash-merged to a single commit on `main`
- **Squash commit message** must follow these same conventions
- **No AI attribution** in the squash commit

Some PRs may preserve commits if the commit history provides real value (e.g., large refactorings with clear stages).
