# Contributing to ZipKit

Thank you for your interest in contributing to ZipKit!

---

## Quick Start for Contributors

### 1. Find or Create an Issue

All significant work should start with a GitHub issue.

Browse [existing issues](https://github.com/eyuelabebe/zipkit/issues) or create a new one.

### 2. Read Documentation

Before starting work:

- Read the issue completely
- Read [.claude/README.md](.claude/README.md) for agent operating rules
- Read linked product and architecture documentation
- Understand the scope and requirements

### 3. Set Up Development Environment

See [docs/development/development-setup.md](docs/development/development-setup.md)

```bash
git clone https://github.com/eyuelabebe/zipkit.git
cd zipkit
npm install
npm run format && npm run lint && npm run typecheck && npm run test
```

### 4. Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/42-short-description
```

See [.claude/BRANCHES.md](.claude/BRANCHES.md) for branch naming conventions.

### 5. Implement Change

- Keep changes small and focused
- Follow coding standards (see [docs/development/coding-standards.md](docs/development/coding-standards.md))
- Add or update tests
- Update documentation if behavior changes

### 6. Run Quality Checks

```bash
npm run format       # Auto-fix formatting
npm run lint         # Check code quality
npm run typecheck    # Verify TypeScript types
npm run test         # Run all tests
npm run build        # Ensure it builds
```

All checks must pass before pushing.

### 7. Create Focused Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add ZIP archive inspection"
git commit -m "test: add ZIP adapter unit tests"
git commit -m "docs: document archive adapter interface"
```

See [.claude/COMMITS.md](.claude/COMMITS.md) for commit standards.

### 8. Push and Open Pull Request

```bash
git push -u origin feature/42-short-description
```

Open a pull request following the template in [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md).

See [.claude/PULL_REQUESTS.md](.claude/PULL_REQUESTS.md) for PR standards.

### 9. Respond to Review Feedback

- Address reviewer comments promptly
- Make requested changes
- Re-run checks after changes
- Mark conversations as resolved

### 10. Merge and Clean Up

After approval and passing CI:

- Merge via approved process (typically squash merge)
- Delete feature branch
- Verify issue is closed

---

## Core Principles

### Issue-Driven Development

**All significant work originates from a GitHub issue.**

Required for:

- New features
- Security changes
- Permission changes
- Architectural changes
- Dependency changes
- Bug fixes

See [.claude/WORKFLOW.md](.claude/WORKFLOW.md) for complete workflow.

### Small, Focused Changes

- One issue per PR (typically)
- One logical change per commit
- Keep PRs reviewable
- Do not silently expand scope

### Testing is Mandatory

- Add tests for new functionality
- Update tests for changed functionality
- Never disable tests to make changes pass
- Run all checks before pushing

See [docs/testing/testing-strategy.md](docs/testing/testing-strategy.md).

### Documentation Matters

- Update docs when behavior changes
- Keep docs accurate
- Never describe unimplemented features as complete
- Create ADRs for significant architectural decisions

### No AI Attribution

**Never include AI attribution in repository metadata:**

- ❌ No "Generated with Claude" in commits
- ❌ No AI Co-Authored-By trailers
- ❌ No AI mentions in PRs or issues
- ❌ No AI attribution anywhere in repo

Repository history describes the engineering work, not the tools used.

---

## Development Standards

### Code Quality

- TypeScript strict mode
- Clear, descriptive naming
- Small, focused functions
- Appropriate comments (explain "why", not "what")
- No console.log in production code
- No dead code

See [docs/development/coding-standards.md](docs/development/coding-standards.md).

### Commit Messages

Use Conventional Commits format:

```
<type>: <short summary>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `test`, `chore`, `security`, `refactor`, `perf`

See [.claude/COMMITS.md](.claude/COMMITS.md).

### Branch Naming

```
<type>/<issue-number>-<short-description>
```

Examples:

- `feature/42-zip-entry-inspection`
- `fix/87-path-traversal-vulnerability`
- `docs/95-architecture-diagrams`

See [.claude/BRANCHES.md](.claude/BRANCHES.md).

---

## Security Contributions

### Reporting Vulnerabilities

**Do not report security vulnerabilities in public issues.**

See [SECURITY.md](SECURITY.md) for responsible disclosure.

### Security-Sensitive Changes

Changes touching these areas require extra care:

- Archive path validation
- Extension permissions
- Security scanning logic
- Release scripts
- GitHub Actions workflows

See [.claude/SECURITY.md](.claude/SECURITY.md) and [docs/security/](docs/security/).

---

## Testing Guidelines

### Test Layers

1. **Unit tests** — Fast, isolated, no browser
2. **Integration tests** — Components working together
3. **E2E tests** — Full browser with extension

See [docs/testing/testing-strategy.md](docs/testing/testing-strategy.md).

### Test Fixtures

- Use deterministic synthetic fixtures
- Never use random internet archives
- Never commit real malware
- Document fixture purpose

See [docs/testing/fixture-strategy.md](docs/testing/fixture-strategy.md).

---

## Pull Request Process

### Before Opening PR

- ✅ Implementation complete
- ✅ Tests added/updated
- ✅ Local checks pass
- ✅ Documentation updated
- ✅ Commits follow conventions

### PR Description

Follow the template. Include:

- Summary of changes
- Background/motivation
- Reviewer context
- Testing performed
- Known risks
- Issue reference (`Closes #N`)

**Do not duplicate the issue description.** Explain the implementation.

See [.claude/PULL_REQUESTS.md](.claude/PULL_REQUESTS.md).

### Review Process

- All required CI checks must pass
- Review approval required (when team grows)
- All conversations must be resolved
- Branch must be up-to-date with main (if required)
- No bypassing CI

### Merge Process

- Typically squash merge
- Final commit message follows Conventional Commits
- No AI attribution in squash commit
- Feature branch deleted after merge

---

## Communication

### Where to Ask Questions

- **Clarify requirements** — Comment on the issue
- **Discuss approach** — Comment on the PR
- **Report bugs** — Create a bug issue
- **Suggest features** — Create a feature request
- **Security issues** — Follow [SECURITY.md](SECURITY.md)

### Response Time Expectations

This is an open-source project. Response times may vary. Be patient and respectful.

---

## Code of Conduct

Be respectful, professional, and constructive.

- ✅ Respectful disagreement
- ✅ Constructive feedback
- ✅ Professional communication
- ❌ Personal attacks
- ❌ Harassment
- ❌ Disrespectful behavior

---

## First-Time Contributors

Welcome! Here's how to get started:

1. Look for issues labeled `good-first-issue`
2. Read this guide and [.claude/README.md](.claude/README.md)
3. Set up development environment
4. Start with something small
5. Ask questions if stuck

We appreciate your contribution!

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

- Read [.claude/README.md](.claude/README.md) first
- Check [docs/development/](docs/development/)
- Ask in issue or PR comments
- Be specific about what you need help with

---

**Thank you for contributing to ZipKit!**
