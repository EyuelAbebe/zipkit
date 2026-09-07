# ZipKit Engineering Principles

These are non-negotiable rules for all code changes in the ZipKit repository.

## Issue-Driven Development

1. **Work from GitHub issues** whenever practical
2. **Never silently expand scope** — if new work is discovered, create a follow-up issue
3. **Never silently change architecture** without explicit justification and documentation

## Change Size and Focus

4. **Keep changes as small as possible**
5. **Prefer one logical change per commit**
6. **Prefer one focused issue per pull request**
7. **Avoid unrelated refactoring** inside feature PRs — make it a separate issue if substantial

## Testing and Quality

8. **Add or update tests** for behavioral changes
9. **Never disable tests** simply to make a change pass — fix the implementation or the test properly
10. **Run all required checks** before pushing
11. **Never bypass failing CI** — if CI is wrong, fix it in a focused change with justification

## Security and Permissions

12. **Never weaken security checks** without explicit justification and review
13. **Do not add Chrome permissions** without explicit justification
14. **Treat all archive input as untrusted**
15. **Preserve local-first design** — do not add remote processing without explicit architecture decision

## Dependencies and Impact

16. **Do not introduce dependencies** without reviewing:
    - License compatibility
    - Maintenance status and activity
    - Security history
    - Browser compatibility
    - Bundle size impact
    - Streaming/Web Worker support (for archive libraries)

## Documentation

17. **Update documentation** when behavior changes
18. **Record significant architectural changes** with ADRs in `/docs/decisions/`
19. **Keep documentation accurate** — never describe unimplemented features as complete

## Code Quality

20. **Keep code readable for humans first**
21. **Avoid speculative abstractions** and premature generalization
22. **Do not leave hidden TODOs** for required work — create follow-up issues instead
23. **Prefer existing patterns** unless there's a clear reason to diverge

## Repository Metadata

24. **Never mention Claude, AI, or Anthropic** in:
    - Commit messages or bodies
    - PR titles or descriptions
    - Issue titles or descriptions
    - Source code comments
    - Documentation
    - Release notes
    - Any repository metadata

25. **No AI attribution** in commit trailers, Co-Authored-By, or anywhere else

## Large Files and Performance

26. **Do not load entire large archives** into JavaScript memory
27. **Design around streams**, incremental reading, and bounded buffers
28. **Use Web Workers** for CPU-intensive archive operations
29. **Support cancellation and progress reporting** for long operations

## Commit Hygiene

30. **Keep commits focused and coherent**
31. **Reference GitHub issues from PRs** using `Closes #N` or `Related to #N`
32. **Use Conventional Commits** format (feat, fix, docs, test, chore, security)
33. **Each commit should leave the branch in a valid state** where practical

## Review and Merge

34. **Provide reviewer context** in PR descriptions — don't just duplicate the issue
35. **Respond to review feedback** promptly and completely
36. **Delete feature branches** after merge unless explicitly retained

## Violations

If you discover existing code violating these principles:

- Do not silently perpetuate the violation
- Fix it in the current PR if small and directly related
- Otherwise, create a follow-up issue for cleanup
- Discuss significant deviations before making breaking changes
