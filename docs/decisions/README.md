# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant architectural decisions made during the development of ZipKit.

## What is an ADR?

An ADR captures an important architectural decision made along with its context and consequences.

## When to Create an ADR

Create an ADR for decisions that:

- Affect the overall system architecture
- Are difficult or expensive to change later
- Have significant impact on developers or users
- Involve notable tradeoffs
- Require explanation of "why" for future maintainers

## ADR Format

Use the template below (also in `adr-template.md`):

```markdown
# <number>. <title>

**Status:** [Proposed | Accepted | Deprecated | Superseded]

**Date:** YYYY-MM-DD

**Decision Makers:** <who was involved>

**Tags:** [architecture, security, performance, etc.]

## Context

What is the issue we're facing? What factors are driving this decision?

## Decision

What did we decide? Be specific.

## Consequences

### Positive

- What benefits does this decision bring?

### Negative

- What downsides or limitations does this decision create?

### Risks

- What risks does this decision introduce?

## Alternatives Considered

What other options did we evaluate?

### Alternative 1: <name>

- Description
- Pros
- Cons
- Why rejected

## Implementation Notes

Any important implementation guidance.

## References

- Links to related documentation
- External resources
- Related issues
```

## Naming Convention

ADRs are numbered sequentially:

```
0001-short-kebab-case-title.md
0002-another-decision.md
0003-yet-another-decision.md
```

## Current ADRs

- [0001-use-typescript-strict-mode.md](0001-use-typescript-strict-mode.md)

## Process

1. **Draft**: Create ADR file with "Proposed" status
2. **Discussion**: Share with team, gather feedback
3. **Decision**: Update status to "Accepted" when decided
4. **Implementation**: Implement the decision
5. **Review**: Periodically review if circumstances change

If a decision is later changed:

- Do not delete the old ADR
- Mark old ADR as "Superseded by ADR-XXXX"
- Create new ADR documenting the new decision

## Best Practices

- **Be concise** — Focus on the decision, not exhaustive background
- **Be specific** — Vague decisions are hard to follow
- **Explain tradeoffs** — Document what we're giving up
- **Update status** — Keep status current (Proposed → Accepted → Deprecated)
- **Link issues** — Reference related GitHub issues
- **One decision per ADR** — Don't combine unrelated decisions

## Questions?

If you're unsure whether to create an ADR:

- Would future developers benefit from knowing why this decision was made?
- Is this a decision that could reasonably be questioned later?
- Are there non-obvious tradeoffs?

When in doubt, create an ADR. They're cheap to write and valuable to read.
