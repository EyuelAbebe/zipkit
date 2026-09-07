# ZipKit Testing Strategy

## Overview

ZipKit's testing strategy prioritizes confidence over coverage percentages. Tests should give us certainty that the extension works correctly, handles edge cases safely, and protects users from malicious archives.

## Test Pyramid

### Unit Tests (Base Layer)
**Purpose**: Fast, isolated tests of individual functions and utilities

**Characteristics**:
- No browser environment required
- Pure JavaScript/Node.js execution
- Millisecond execution time
- No external dependencies or I/O
- Mock file system and DOM when needed

**What to Unit Test**:
- Archive parsing logic
- Path traversal detection algorithms
- Compression ratio calculations
- File size formatting utilities
- Data structure transformations
- Security validators
- Error handling paths

**When Required**:
- Any new utility function
- Changes to core parsing logic
- Security-critical algorithms
- Bug fixes (regression tests)

### Integration Tests (Middle Layer)
**Purpose**: Test components working together without full browser

**Characteristics**:
- May use JSDOM or minimal DOM simulation
- Test message passing between components
- Test storage interactions
- Faster than E2E but slower than unit tests
- Can mock browser APIs

**What to Integration Test**:
- Background script and content script communication
- Storage layer operations
- UI component interactions
- Popup behavior with different archive states
- Warning system triggers
- Settings management

**When Required**:
- Adding new communication patterns
- Changes to storage schema
- Multi-component features
- State management changes

### E2E Tests (Top Layer)
**Purpose**: Full browser testing with extension loaded

**Characteristics**:
- Real browser environment (Chromium/Firefox)
- Extension actually loaded
- Slowest tests (seconds per test)
- Most realistic environment
- Can capture screenshots and traces

**What to E2E Test**:
- Complete user workflows
- Extension activation on archive downloads
- UI rendering in real browser
- Keyboard and mouse interactions
- Cross-browser compatibility
- Installation and updates

**When Required**:
- Major feature additions
- UI changes
- Browser API interactions
- User-facing workflows
- Pre-release validation

## Test Fixture Strategy

### Core Principles
1. **Deterministic**: Fixtures must produce consistent results
2. **Synthetic**: Purpose-built for testing, not real-world archives
3. **Safe**: Never use actual malware or dangerous content
4. **Documented**: Each fixture has clear purpose and characteristics

### Fixture Types Required
- Normal archives (small, medium, large)
- Path traversal attempts (various patterns)
- High compression ratio (zip bombs)
- Corrupted/malformed archives
- Password-protected archives
- Nested archives
- Empty archives
- Edge case filenames (Unicode, special chars)

See [fixture-strategy.md](./fixture-strategy.md) for detailed fixture management.

## Coverage Philosophy

### What Coverage Means
Coverage is a **tool to find untested code**, not a goal in itself.

### Guidelines
- 100% coverage is not required or expected
- Focus on **critical path coverage**
- Security code must be thoroughly tested
- Defensive error handling may be uncovered (and that's okay)
- Test user scenarios, not just code lines

### Critical Areas Requiring High Coverage
- Path traversal detection (security)
- Archive parsing (correctness)
- Warning generation (user safety)
- Permission checks (security)
- Data validation (correctness)

### Acceptable Low Coverage Areas
- UI styling code
- Polyfills and browser compatibility shims
- Error logging and telemetry
- Development-only code paths
- Unreachable defensive code

## Required Tests by Change Type

### Bug Fixes
**Required**:
- Regression test reproducing the bug
- Test verifying the fix
- Related edge case tests

**Optional**:
- E2E test if user-facing

### New Features
**Required**:
- Unit tests for new functions
- Integration tests for component interactions
- E2E test for primary user workflow

**Optional**:
- Performance benchmarks
- Cross-browser E2E tests

### Security Changes
**Required**:
- Unit tests with attack fixtures
- Integration tests for security warnings
- E2E test showing user protection
- Boundary condition tests
- Negative tests (attacks should fail)

**Optional**:
- Performance impact tests

### UI Changes
**Required**:
- E2E test for visual changes
- Screenshot tests (if available)
- Accessibility tests

**Optional**:
- Unit tests for pure logic
- Cross-browser visual tests

### Refactoring
**Required**:
- Existing tests must pass
- May need to update test structure

**Optional**:
- Add tests if coverage gaps found

### Performance Optimizations
**Required**:
- Benchmark showing improvement
- Existing functionality tests pass

**Optional**:
- Large file E2E tests

## Test Maintenance

### When to Update Tests
- Tests fail due to intentional behavior changes
- Tests become flaky or unreliable
- Tests slow down CI significantly
- Tests test implementation details instead of behavior

### When to Delete Tests
- Feature removed
- Test duplicates coverage
- Test provides no value (always passes even with broken code)
- Cost of maintenance exceeds benefit

### Test Code Quality
Tests are code. Apply same standards:
- Clear naming (describe what, not how)
- Minimal duplication
- Good organization
- Helpful failure messages
- No test interdependencies

## Testing Anti-Patterns to Avoid

### Don't Test Implementation Details
- Test behavior, not internal state
- Avoid mocking everything
- Don't couple tests to private methods

### Don't Create Flaky Tests
- No timeouts unless necessary
- No dependency on external services
- No reliance on timing
- Deterministic test data

### Don't Write Slow Tests
- Keep unit tests under 100ms
- Keep integration tests under 1s
- Keep E2E tests under 10s
- Parallelize when possible

### Don't Skip Cleanup
- Reset state after each test
- Clean up temporary files
- Close browser instances
- Clear mocks and stubs

## Continuous Integration

### Pre-Commit
- Run fast unit tests
- Linting and formatting
- Type checking

### Pull Request
- All unit tests
- All integration tests
- Smoke E2E tests

### Pre-Release
- Full E2E test suite
- Cross-browser tests
- Performance benchmarks
- Security test suite

## Testing Tools

### Current Stack
- Test Runner: (TBD - Jest, Vitest, or similar)
- E2E Framework: Playwright (see [e2e-strategy.md](./e2e-strategy.md))
- Assertion Library: (TBD - Chai, Jest expect, or similar)
- Mocking: (TBD - Sinon, Jest mocks, or similar)

### Future Considerations
- Visual regression testing
- Performance regression testing
- Accessibility testing automation
- Mutation testing

## Success Metrics

### Quantitative
- Test execution time (unit: <5s, integration: <30s, E2E: <5min)
- Flake rate (<1% flaky tests)
- Build pass rate (>95% on main branch)

### Qualitative
- Confidence in deployments
- Bug escape rate (bugs reaching users)
- Time to reproduce bugs
- Ease of adding new tests

## Conclusion

Good tests are:
1. **Fast**: Run quickly to encourage frequent execution
2. **Isolated**: Don't depend on other tests or external state
3. **Repeatable**: Same input always produces same output
4. **Self-validating**: Clear pass/fail, no manual checking
5. **Timely**: Written alongside or before code

The goal is not to test everything, but to test the right things in the right way, giving us confidence that ZipKit protects users and works reliably.
