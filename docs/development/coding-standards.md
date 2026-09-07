# Coding Standards

This document defines code quality standards for all contributions to ZipKit.

## TypeScript Strict Mode

ZipKit uses TypeScript with **strict mode enabled** and additional safety checks.

### Required Compiler Options

The following settings are non-negotiable:

```typescript
{
  "strict": true,                          // Enable all strict checks
  "noUnusedLocals": true,                  // Error on unused variables
  "noUnusedParameters": true,              // Error on unused parameters
  "noFallthroughCasesInSwitch": true,      // Error on switch fallthrough
  "noUncheckedIndexedAccess": true         // Strict array/object access
}
```

Do not disable these options without explicit architectural justification and team consensus.

### Handling Strict Checks

When TypeScript raises strict errors:

✅ **Good**: Fix the actual issue

```typescript
// Add proper null checks
if (entry.name !== undefined) {
  processEntry(entry.name);
}
```

❌ **Bad**: Use type assertions to bypass checks

```typescript
processEntry(entry.name!); // Dangerous: assumes non-null without verification
```

## Commit Message Standards

Use **Conventional Commits** format for all commits.

### Format

```
<type>: <short summary>

[optional body]

[optional footer]
```

### Types

- `feat:` — New user-facing functionality
- `fix:` — Bug fix
- `docs:` — Documentation changes only
- `test:` — Test additions or updates
- `chore:` — Build, tooling, dependencies, maintenance
- `security:` — Security-related changes
- `refactor:` — Code restructuring without behavior change
- `perf:` — Performance improvements
- `style:` — Code formatting (not UI styling)

### Examples

✅ **Good**:

```
feat: add TAR archive extraction support

Implements TAR format parsing using streaming architecture.
Supports uncompressed TAR and detects compressed variants
for proper decompression pipeline.
```

❌ **Bad**:

```
Add stuff  // Missing type, too vague
```

See `.claude/COMMITS.md` for comprehensive commit standards.

## Naming Conventions

### Clear and Descriptive Names

Use names that reveal intent and purpose:

✅ **Good**:

```typescript
function detectPathTraversal(entryPath: string): boolean
const MAX_EXPANSION_RATIO = 10000
interface ArchiveSecurityReport
```

❌ **Bad**:

```typescript
function check(p: string): boolean  // Too generic
const MAX = 10000  // What maximum?
interface Report  // Report of what?
```

### Naming Patterns

- **Functions**: Verb phrases (`extractArchive`, `validatePath`, `computeChecksum`)
- **Booleans**: Question form (`isCompressed`, `hasEncryption`, `shouldWarn`)
- **Classes/Interfaces**: Nouns (`ArchiveAdapter`, `SecurityScanner`, `ProgressReporter`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`)
- **Private members**: Prefix with underscore if necessary (`_internalState`)

### Avoid Abbreviations

Write full words unless the abbreviation is universally understood:

✅ **Good**: `compressionRatio`, `maximumDepth`, `htmlElement`

❌ **Bad**: `cmpRatio`, `maxDpth`, `elem`

## Function Design

### Small and Focused

Each function should do **one thing well**:

✅ **Good**:

```typescript
function parseZipEntry(data: Uint8Array): ZipEntry {
  // Single responsibility: parse entry
}

function validateZipEntry(entry: ZipEntry): ValidationResult {
  // Single responsibility: validate
}
```

❌ **Bad**:

```typescript
function parseAndValidateAndExtractZipEntry(data: Uint8Array, dest: string) {
  // Multiple unrelated responsibilities
}
```

### Function Length

- **Aim for 20-30 lines** for most functions
- **Over 50 lines** suggests the function should be split
- **Complexity over length**: Prefer readable code over arbitrary line limits

### Parameter Count

- **0-3 parameters**: Ideal
- **4+ parameters**: Consider using an options object

✅ **Good**:

```typescript
interface ExtractionOptions {
  destination: string;
  overwrite: boolean;
  preservePermissions: boolean;
  progressCallback?: (progress: number) => void;
}

function extractArchive(archive: Archive, options: ExtractionOptions) {
  // ...
}
```

❌ **Bad**:

```typescript
function extractArchive(
  archive: Archive,
  dest: string,
  overwrite: boolean,
  preservePerms: boolean,
  onProgress?: (n: number) => void,
  onError?: (e: Error) => void
) {
  // Too many parameters
}
```

## Comments

### Write Comments for "Why", Not "What"

Code should be self-documenting for **what** it does. Use comments to explain **why**.

✅ **Good**:

```typescript
// ZIP64 format uses 0xFFFFFFFF as sentinel value to indicate
// that actual size is stored in ZIP64 extended information
if (header.compressedSize === 0xffffffff) {
  return parseZip64ExtendedInfo(header);
}
```

❌ **Bad**:

```typescript
// Check if compressed size equals 0xFFFFFFFF
if (header.compressedSize === 0xffffffff) {
  // Parse ZIP64 info
  return parseZip64ExtendedInfo(header);
}
```

### Comment Density

- **Most code**: No comments needed if well-written
- **Complex algorithms**: Brief explanation
- **Security checks**: Always explain the threat
- **Performance optimizations**: Explain tradeoffs
- **Workarounds**: Always explain why needed

### Documentation Comments

Use JSDoc for public APIs:

```typescript
/**
 * Inspects an archive file and returns metadata without extracting.
 *
 * @param file - The archive file to inspect
 * @returns Promise resolving to archive metadata including entry list,
 *          compression info, and security warnings
 * @throws {UnsupportedFormatError} If archive format is not recognized
 * @throws {CorruptedArchiveError} If archive structure is invalid
 */
async function inspectArchive(file: File): Promise<ArchiveMetadata> {
  // ...
}
```

## Console Logging

### No console.log in Production

Remove all debug logging before committing:

❌ **Bad**:

```typescript
function processEntry(entry: ArchiveEntry) {
  console.log('Processing:', entry.name); // Debug logging
  // ...
}
```

✅ **Good**: Use proper logging utility (if implemented):

```typescript
function processEntry(entry: ArchiveEntry) {
  logger.debug('Processing entry', { entryName: entry.name });
  // ...
}
```

### Acceptable Console Usage

- **Error boundaries**: `console.error()` for unhandled errors in production
- **Development tooling**: Scripts in `scripts/` directory
- **Test output**: Debugging failing tests (remove when fixed)

## Error Handling

### Use Typed Errors

Create specific error classes for different failure modes:

```typescript
class PathTraversalError extends Error {
  constructor(public readonly entryPath: string) {
    super(`Path traversal detected: ${entryPath}`);
    this.name = 'PathTraversalError';
  }
}

class CorruptedArchiveError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CorruptedArchiveError';
  }
}
```

### Handle Errors Explicitly

Don't silently swallow errors:

❌ **Bad**:

```typescript
try {
  await extractArchive(file);
} catch (error) {
  // Silent failure
}
```

✅ **Good**:

```typescript
try {
  await extractArchive(file);
} catch (error) {
  if (error instanceof PathTraversalError) {
    showSecurityWarning(error.entryPath);
  } else if (error instanceof CorruptedArchiveError) {
    showCorruptionError(error.message);
  } else {
    throw error; // Re-throw unexpected errors
  }
}
```

### Validation Pattern

Validate inputs early and explicitly:

```typescript
function extractEntry(entry: ArchiveEntry, destination: string): void {
  // Validate at function entry
  if (!isValidPath(entry.path)) {
    throw new PathTraversalError(entry.path);
  }

  if (destination.length === 0) {
    throw new Error('Destination path cannot be empty');
  }

  // Proceed with extraction
  // ...
}
```

## Async/Await Patterns

### Always Use async/await

Prefer `async/await` over raw promises for readability:

✅ **Good**:

```typescript
async function loadAndInspectArchive(file: File): Promise<ArchiveMetadata> {
  const buffer = await file.arrayBuffer();
  const metadata = await parseMetadata(buffer);
  return metadata;
}
```

❌ **Bad**:

```typescript
function loadAndInspectArchive(file: File): Promise<ArchiveMetadata> {
  return file.arrayBuffer().then((buffer) => {
    return parseMetadata(buffer).then((metadata) => {
      return metadata;
    });
  });
}
```

### Handle Promise Rejections

Every promise must be either awaited or have a `.catch()`:

❌ **Bad**:

```typescript
async function processFiles(files: File[]) {
  files.forEach((file) => {
    processFile(file); // Unhandled promise!
  });
}
```

✅ **Good**:

```typescript
async function processFiles(files: File[]) {
  await Promise.all(files.map((file) => processFile(file)));
}
```

### Parallel vs Sequential

Execute independent operations in parallel:

✅ **Good**:

```typescript
// Independent operations - run in parallel
const [metadata, checksum, securityReport] = await Promise.all([
  extractMetadata(file),
  computeChecksum(file),
  scanForThreats(file),
]);
```

❌ **Bad**:

```typescript
// Independent operations - unnecessarily sequential
const metadata = await extractMetadata(file);
const checksum = await computeChecksum(file);
const securityReport = await scanForThreats(file);
```

## Dead Code

### Remove Unused Code

Delete code that is not used:

❌ **Bad**:

```typescript
// function oldExtractMethod(file: File) {
//   // Old implementation...
// }

function extractArchive(file: File) {
  // New implementation
}
```

✅ **Good**:

```typescript
function extractArchive(file: File) {
  // New implementation
}
// Old code is in git history if needed
```

### No Commented-Out Code

- **Git is your backup** — don't leave commented code "just in case"
- **Create issues for TODOs** — don't leave `// TODO: implement later`
- **Remove experimental code** — don't commit half-finished experiments

### Acceptable "Dead" Code

- **Feature flags**: Code disabled by configuration (document why)
- **Platform-specific code**: Code for specific browsers/environments
- **Deprecated APIs**: Marked with `@deprecated` and removal timeline

## Code Organization

### File Structure

```typescript
// 1. Imports (grouped by external, internal, types)
import { compress } from 'external-lib';
import { validatePath } from '../utils/validation';
import type { ArchiveEntry } from '../types';

// 2. Constants
const MAX_EXPANSION_RATIO = 10000;
const DEFAULT_BUFFER_SIZE = 64 * 1024;

// 3. Types/Interfaces (if not in separate file)
interface ProcessingOptions {
  maxSize: number;
  timeout: number;
}

// 4. Main implementation
export function processArchive(file: File, options: ProcessingOptions) {
  // ...
}

// 5. Helper functions (private to this module)
function internalHelper(data: Uint8Array): boolean {
  // ...
}
```

### Module Size

- **Aim for 200-400 lines** per module
- **Over 600 lines**: Consider splitting
- **Group related functionality** together
- **Separate concerns** into different modules

## Code Review Checklist

Before submitting code for review:

- [ ] Follows TypeScript strict mode without type assertions
- [ ] Uses conventional commit format
- [ ] Functions are small and focused
- [ ] Names clearly communicate intent
- [ ] Comments explain "why", not "what"
- [ ] No `console.log` statements
- [ ] Errors are handled explicitly with typed error classes
- [ ] Async code uses `async/await` consistently
- [ ] No commented-out code or TODOs
- [ ] All checks pass: `format`, `lint`, `typecheck`, `test`, `build`

## Further Reading

- See `.claude/PRINCIPLES.md` for core engineering principles
- See `.claude/TESTING.md` for testing requirements
- See `.claude/SECURITY.md` for security guidelines
- See `docs/architecture/` for architectural decisions
