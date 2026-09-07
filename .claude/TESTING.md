# Testing Requirements

Testing is mandatory for all behavioral changes in ZipKit.

## Testing Layers

### 1. Unit Tests

**Scope:** Individual functions, classes, and modules in isolation

**Location:** Co-located with source code or in dedicated `__tests__` directories

**When required:**

- Pure logic functions
- Archive parsing utilities
- Path validation
- Security analysis rules
- Data transformations

**Characteristics:**

- Fast (milliseconds)
- No external dependencies
- No browser/DOM required
- No network/filesystem (use mocks)

### 2. Integration Tests

**Scope:** Multiple modules working together

**When required:**

- Archive adapter implementations
- Worker communication
- Stream processing
- End-to-end archive operations (without full browser)

**Characteristics:**

- Moderate speed (seconds)
- May use real archive libraries
- May use test fixtures
- No full browser environment

### 3. E2E Tests

**Scope:** Full application in real browser

**Location:** `tests/e2e/`

**When required:**

- UI workflows
- Extension functionality
- User interactions
- Browser API integration

**Characteristics:**

- Slow (seconds to minutes)
- Real browser (Playwright)
- Extension loaded
- Full user simulation

## Test Fixtures

**Location:** `tests/fixtures/` and `tests/security-fixtures/`

### Requirements

- ✅ Deterministic and synthetic
- ✅ Safe (no real malware)
- ✅ Purpose-built for specific test scenarios
- ✅ Reproducible (provide generation scripts where practical)
- ❌ Never random archives from internet
- ❌ Never real malware

### Standard Fixtures

Create fixtures for:

- `normal.zip` — typical archive with files and folders
- `normal.tar` — typical TAR archive
- `normal.tar.gz` — typical compressed TAR
- `nested.zip` — archives within archives
- `high-expansion.zip` — 10000:1+ compression ratio
- `many-files.zip` — thousands of entries
- `path-traversal.zip` — `../` and similar dangerous paths
- `absolute-path.tar` — absolute Unix paths
- `symlink-escape.tar` — symlinks pointing outside archive
- `deep-directory.zip` — very deep nested folders
- `executables.zip` — `.exe`, `.dll`, `.so` files
- `scripts.tar.gz` — `.sh`, `.bat`, `.ps1` scripts
- `corrupted.zip` — malformed central directory
- `truncated.tar.gz` — incomplete archive
- `duplicate-paths.zip` — same path multiple times
- `empty.zip` — zero entries
- `single-file.gz` — GZIP-compressed file (not TAR)

## Test Requirements by Change Type

### Adding New Archive Format Support

- ✅ Unit tests for format-specific parsing
- ✅ Integration tests with real format libraries
- ✅ E2E test creating archive
- ✅ E2E test extracting archive
- ✅ Fixtures for normal and malformed archives

### Security Changes

- ✅ Unit tests for detection logic
- ✅ Security fixtures demonstrating threat
- ✅ Integration test showing threat is blocked
- ✅ E2E test showing user warning
- ✅ Test that safe archives still work

### UI Changes

- ✅ E2E tests for user workflows
- ✅ Screenshots/snapshots where appropriate
- ✅ Responsive behavior if applicable
- ✅ Keyboard navigation if applicable
- ✅ Accessibility where applicable

### Archive Processing Changes

- ✅ Unit tests for logic
- ✅ Integration tests with fixtures
- ✅ Large-file behavior
- ✅ Cancellation behavior
- ✅ Error handling

### Extension Permission Changes

- ✅ Manual verification in real extension
- ✅ E2E tests if permission affects functionality
- ✅ Documentation update explaining why

## Running Tests Locally

### All Checks

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
```

### Specific Test Layers

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Watch Mode (Development)

```bash
npm run test:watch
```

## Test Coverage

Coverage should **improve confidence**, not become a vanity metric.

**Goals:**

- Security-critical code: aim for high coverage
- Archive processing core: aim for high coverage
- UI glue code: coverage less critical
- Configuration files: coverage not required

**Never:**

- Write meaningless tests to hit 100%
- Skip important tests because coverage is "good enough"
- Disable coverage for entire modules without reason

## Test Naming

### Unit/Integration

```typescript
describe('ZipAdapter', () => {
  describe('inspect', () => {
    it('should parse central directory from valid ZIP', async () => {
      // ...
    });

    it('should reject corrupted central directory', async () => {
      // ...
    });

    it('should detect path traversal in entry paths', async () => {
      // ...
    });
  });
});
```

### E2E

```typescript
test('user can create ZIP from multiple files', async ({ page }) => {
  // ...
});

test('user sees warning for path-traversal archive', async ({ page }) => {
  // ...
});

test('user can cancel extraction in progress', async ({ page }) => {
  // ...
});
```

## Test Data

### Prefer Constants

```typescript
const NORMAL_ZIP_PATH = 'tests/fixtures/normal.zip';
const PATH_TRAVERSAL_ENTRIES = ['../../etc/passwd', 'C:\\Windows\\System32\\evil.exe'];
```

### Avoid Magic Values

❌ Bad:

```typescript
expect(expansion).toBeGreaterThan(10000);
```

✅ Good:

```typescript
const EXPANSION_RATIO_THRESHOLD = 10000;
expect(expansion).toBeGreaterThan(EXPANSION_RATIO_THRESHOLD);
```

## Async Tests

Always handle promises properly:

✅ Good:

```typescript
it('should extract archive', async () => {
  await adapter.extract('/dest');
  expect(fs.existsSync('/dest/file.txt')).toBe(true);
});
```

❌ Bad:

```typescript
it('should extract archive', () => {
  adapter.extract('/dest'); // Promise not awaited!
  expect(fs.existsSync('/dest/file.txt')).toBe(true); // Runs before extraction
});
```

## Cleanup

Tests must clean up after themselves:

```typescript
afterEach(async () => {
  await cleanupTempFiles();
  await worker.terminate();
});
```

## Skipping Tests

**Do not skip tests to make CI pass.**

If a test must be skipped:

1. Use `.skip` with clear reason:

   ```typescript
   it.skip('should handle ZIP64 archives', () => {
     // TODO: Implement ZIP64 support (issue #89)
   });
   ```

2. Create issue for skipped functionality
3. Link issue in test comment
4. Remove skip when implemented

## Disabling Tests

**Never disable tests simply to make a change pass.**

If tests are legitimately wrong:

1. Fix the tests to match correct behavior
2. Update related documentation
3. Explain in PR why old tests were wrong

## CI Test Requirements

All PRs must pass:

- ✅ Format check
- ✅ Lint
- ✅ Typecheck
- ✅ Unit tests
- ✅ Integration tests
- ✅ Build
- ✅ Extension validation
- ✅ Relevant E2E tests

## Large Archive Testing

Test behavior with:

- ~100 MB archives
- ~1 GB archives (if CI supports)
- Extremely high file counts
- Very deep directory structures

Verify:

- Memory usage stays bounded
- Cancellation works
- Progress updates
- No crashes
- Appropriate error messages if unsupported

## Security Test Fixtures

**Never commit real malware.**

Security fixtures are synthetic data demonstrating:

- Structural vulnerabilities (path traversal, symlink escape)
- Expansion risks (archive bombs)
- Unusual file types (executables, scripts)

Do not execute fixture contents during tests.

## Test Isolation

Each test should be independent:

- ❌ Tests should not depend on execution order
- ❌ Tests should not share mutable state
- ✅ Tests should clean up after themselves
- ✅ Tests should use unique fixtures or temp files

## Flaky Tests

If a test is flaky:

1. **Do not ignore it**
2. **Investigate root cause** (timing, race condition, environment)
3. **Fix the underlying issue**
4. **Add retries only as last resort** (and document why)

## Documentation Tests

For complex APIs, consider documentation examples that double as tests.

Example:

```typescript
/**
 * @example
 * const adapter = new ZipAdapter(file);
 * const entries = await adapter.listEntries();
 * expect(entries.length).toBeGreaterThan(0);
 */
```

## Test-Driven Development

TDD is encouraged but not mandatory:

1. Write failing test demonstrating requirement
2. Implement minimum code to pass
3. Refactor while keeping tests green

## When Tests Are Optional

Tests may be omitted for:

- Trivial documentation typo fixes
- Whitespace/formatting changes (caught by format check)
- Changes fully covered by existing tests

When in doubt, add tests.
