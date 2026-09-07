# 0001. Use TypeScript Strict Mode

**Status:** Accepted

**Date:** 2026-09-07

**Decision Makers:** Repository bootstrap

**Tags:** [language, type-safety, code-quality]

---

## Context

ZipKit is a security-focused Chrome extension that processes untrusted archive input. Archive processing involves complex data transformations, streaming, worker communication, and path validation—all areas where runtime type errors can lead to security vulnerabilities or data corruption.

We need to choose TypeScript configuration that balances:

- Developer productivity
- Type safety
- Security risk mitigation
- Code maintainability

---

## Decision

**Enable TypeScript strict mode** for the entire ZipKit codebase.

Specifically, `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## Consequences

### Positive

- **Type safety**: Catch errors at compile time rather than runtime
- **Security**: Prevent type-related bugs that could lead to vulnerabilities
- **Null safety**: Explicit handling of `null` and `undefined` prevents crashes
- **Refactoring confidence**: Type checker catches breaking changes
- **Documentation**: Types serve as inline documentation
- **IDE support**: Better autocomplete and error detection
- **Onboarding**: New contributors understand interfaces through types

### Negative

- **Initial overhead**: More time spent satisfying type checker initially
- **Verbosity**: Some code requires explicit type annotations
- **Third-party types**: May need `@types` packages for dependencies
- **Learning curve**: Contributors must understand TypeScript well

### Risks

- **Development friction**: Strict types might slow rapid prototyping
  - _Mitigation_: Use `unknown` and type guards for truly dynamic data
- **Type assertions**: Developers might abuse `as` to bypass checker
  - _Mitigation_: Code review enforcement, linting rules

---

## Alternatives Considered

### Alternative 1: Relaxed TypeScript

**Description:** Use TypeScript with default or partial strict settings

**Pros:**

- Faster initial development
- Less friction for quick prototypes
- Easier for less experienced TypeScript developers

**Cons:**

- Runtime type errors more likely
- Less IDE assistance
- Harder to refactor safely
- Type safety gaps can hide bugs

**Why rejected:** Security and reliability requirements outweigh developer convenience. Archive processing bugs can have security implications.

### Alternative 2: JavaScript with JSDoc

**Description:** Use JavaScript with type annotations via JSDoc comments

**Pros:**

- No TypeScript build step
- Standard JavaScript
- Some type checking via tooling

**Cons:**

- Weaker type checking than TypeScript
- Verbose JSDoc syntax
- Limited type system features
- Less IDE support

**Why rejected:** Insufficient type safety for security-critical code.

### Alternative 3: Flow

**Description:** Use Facebook's Flow type system

**Pros:**

- Strong type system
- Similar to TypeScript

**Cons:**

- Smaller ecosystem than TypeScript
- Less tooling support
- TypeScript has momentum in Chrome extension development

**Why rejected:** TypeScript is the clear standard for typed JavaScript development.

---

## Implementation Notes

### Strict Mode Implications

1. **Null checks required**:

   ```typescript
   // Before: Might crash
   const name = user.name.toUpperCase();

   // After: Safe
   const name = user.name?.toUpperCase() ?? 'UNKNOWN';
   ```

2. **Indexed access safety**:

   ```typescript
   // noUncheckedIndexedAccess forces checking
   const value = obj[key]; // type: T | undefined
   if (value !== undefined) {
     // Safe to use value here
   }
   ```

3. **No implicit any**:
   ```typescript
   // Must be explicit
   function process(data: unknown) {
     if (typeof data === 'string') {
       // Type narrowed, safe to use as string
     }
   }
   ```

### Handling Dynamic Data

For truly dynamic data (archive contents, user input):

- Use `unknown` instead of `any`
- Implement runtime validation with type guards
- Consider validation libraries (e.g., Zod) for complex schemas

### Migration Path

This is a new repository, so no migration needed. All new code must satisfy strict mode.

---

## References

- [TypeScript Strict Mode Documentation](https://www.typescriptlang.org/tsconfig#strict)
- [tsconfig.json](../../tsconfig.json)
- [Coding Standards](../development/coding-standards.md)
