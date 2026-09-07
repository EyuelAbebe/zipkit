---
name: Security Enhancement
about: Suggest a security improvement (not a vulnerability report)
title: ''
labels: 'type:security'
assignees: ''
---

<!--
⚠️ IMPORTANT: This template is for security ENHANCEMENTS, not vulnerability reports.

If you found a VULNERABILITY, DO NOT create a public issue.
Report it privately via email: eyuelabebe@gmail.com
See SECURITY.md for details.
-->

## Security Enhancement Summary

<!-- What security improvement are you proposing? -->

## Threat Being Addressed

<!-- What threat or risk does this mitigate? -->

## Current Behavior

<!-- How does ZipKit currently handle this scenario? -->

## Proposed Improvement

<!-- How should ZipKit handle this instead? -->

## Attack Scenario

<!-- Describe a concrete attack scenario this would prevent -->

**Attacker's goal:**

**Attack steps:**
1.
2.
3.

**Impact without this enhancement:**

**Impact with this enhancement:**

## Detection Logic

<!-- How would ZipKit detect this threat? -->

## User Experience

<!-- How would users be warned or protected? -->

**Warning message (if applicable):**
```
Example warning text
```

## False Positives

<!-- Could this enhancement incorrectly flag safe archives? -->

## Performance Impact

<!-- Does this affect archive processing performance? -->

## Implementation Complexity

<!-- Is this a simple enhancement or complex feature? -->

- [ ] Simple — Small code change
- [ ] Moderate — Requires new detection logic
- [ ] Complex — Requires significant architecture changes

## Related Security Checks

<!-- Which existing security checks does this relate to? -->

- [ ] Path traversal detection
- [ ] Expansion ratio analysis
- [ ] Executable detection
- [ ] Symlink/hardlink detection
- [ ] Nested archive detection
- [ ] Other: _______

## References

<!-- Links to security research, CVEs, attack examples, etc. -->

-
-

## Priority

<!-- How urgent is this enhancement? -->

- [ ] P0 — Critical security gap
- [ ] P1 — Important improvement
- [ ] P2 — Nice to have
- [ ] P3 — Future consideration
