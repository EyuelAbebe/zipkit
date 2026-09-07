# ZipKit E2E Testing Strategy

## Overview

End-to-end (E2E) tests validate ZipKit in a real browser environment with the extension fully loaded. These tests simulate actual user workflows and catch issues that unit and integration tests cannot.

## Why E2E Tests Matter for Extensions

Browser extensions have unique testing challenges:

- They run in a special browser context
- They interact with real web pages
- They use browser-specific APIs (chrome._, browser._)
- They have special permissions and security contexts
- They respond to real browser events

E2E tests are the only way to validate these interactions work correctly in production-like conditions.

## Playwright as Testing Framework

### Why Playwright

**Strengths**:

- Native extension testing support for Chromium and Firefox
- Can load unpacked extensions
- Real browser automation (not JSDOM)
- Excellent debugging tools (traces, screenshots, video)
- Fast and stable
- Multi-browser support
- Active development and good documentation

**Limitations**:

- Extension support varies by browser (best in Chromium)
- Slower than unit/integration tests
- Requires browser binaries
- More complex setup

### Browser Support Priority

1. **Chromium** (Chrome/Edge): Primary testing target, best extension support
2. **Firefox**: Secondary target, extension support available
3. **WebKit** (Safari): Limited extension support, manual testing may be needed

## Extension Loading in Tests

### Setup Pattern

```javascript
// Conceptual example - not actual code
const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false, // Extensions often require headed mode
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
});
```

### Key Considerations

- Extensions often require non-headless mode for certain features
- Need to build extension before loading (run build script)
- May need separate user data directory to avoid conflicts
- Background pages may need time to initialize
- Manifest V3 service workers behave differently than V2 background pages

## User Story Tests

### Core User Stories to Test

#### 1. Archive Inspection

**Story**: User downloads a ZIP file and wants to see what's inside before extracting

**Test Flow**:

1. Navigate to page with archive download link
2. Click download link
3. Verify extension popup appears
4. Verify file list is displayed
5. Verify metadata is correct
6. Verify no warnings for safe archive

**Assertions**:

- Popup renders
- File count is accurate
- File sizes are displayed
- File paths are shown correctly
- UI is responsive

#### 2. Archive Extraction

**Story**: User extracts files from inspected archive

**Test Flow**:

1. Open archive (as in story 1)
2. Click extract button
3. Select destination (may be automatic in test)
4. Verify extraction completes
5. Verify files exist at destination

**Assertions**:

- Extract button is enabled
- Progress indication shown
- Success message displayed
- Files are actually extracted
- Extracted files have correct content

#### 3. Security Warning Display

**Story**: User downloads malicious archive and sees clear warning

**Test Flow**:

1. Download archive with path traversal
2. Verify warning appears prominently
3. Verify warning explains the risk
4. Verify extraction is blocked or requires confirmation
5. Verify warning details are accessible

**Assertions**:

- Warning badge/icon visible
- Warning text is clear
- Risk level indicated
- Dangerous files highlighted
- User can view details

**Test Variations**:

- Path traversal attack
- Zip bomb (high compression)
- Suspicious filenames
- Nested archive bombs

#### 4. Safe Archive Confirmation

**Story**: User sees confirmation that a legitimate archive is safe

**Test Flow**:

1. Download known-good archive
2. Verify no warnings appear
3. Verify "safe" indicator shown
4. Verify all features enabled

**Assertions**:

- No warning badges
- Extract button enabled
- Positive safety indication
- Full functionality available

## Test Fixture Usage in E2E

### Fixture Hosting

E2E tests need archives available via HTTP(S) for download simulation.

**Options**:

1. **Local test server**: Serve fixtures from tests/fixtures/ via HTTP
2. **Data URLs**: Encode small fixtures as data URLs
3. **File protocol**: Direct file:// URLs (limited browser support)

**Recommended**: Local HTTP server for realistic download flow

### Test Data Preparation

```
tests/
  fixtures/
    safe-archive.zip          # Normal archive
    path-traversal.zip        # Attack fixture
    high-compression.zip      # Zip bomb
    test-server.js            # Simple HTTP server for fixtures
```

### Fixture Selection

Use the same synthetic fixtures as unit tests (see [fixture-strategy.md](./fixture-strategy.md)).

**Benefits**:

- Consistency across test types
- Known, controlled data
- No external dependencies
- Fast and reliable

## Screenshot and Trace Capture

### On Test Failure

Always capture diagnostic information when tests fail:

**Screenshots**:

- Capture full page at failure point
- Capture extension popup state
- Capture any error dialogs

**Traces**:

- Playwright trace with network activity
- Console logs (page and extension)
- Network requests and responses
- Timeline of actions

**Storage**:

- Save to test-results/ directory
- Include test name in filename
- Attach to CI artifacts

### Example Pattern

```javascript
// Conceptual example
test('archive inspection', async ({ page, context }) => {
  try {
    // Test steps...
  } catch (error) {
    await page.screenshot({
      path: `test-results/${test.info().title}-failure.png`,
    });
    await context.tracing.stop({
      path: `test-results/${test.info().title}-trace.zip`,
    });
    throw error;
  }
});
```

## Cross-Platform Considerations

### Operating System Differences

**File Paths**:

- Windows: Backslashes, drive letters (C:\)
- Unix: Forward slashes, root (/)
- Test path handling works on all platforms

**File Permissions**:

- Unix: chmod, executable bits matter
- Windows: Different permission model
- May need platform-specific fixture variations

**Line Endings**:

- Windows: CRLF (\r\n)
- Unix: LF (\n)
- Usually not relevant for binary archives

### Browser Differences

**Chromium vs Firefox**:

- API differences (chrome.* vs browser.*)
- Different extension security models
- Different popup behavior
- May need browser-specific test code paths

**Strategy**:

- Test critical flows on both browsers
- Accept some platform-specific behavior
- Document known differences

## Performance Considerations

### Test Speed

E2E tests are slow by nature. Optimize without sacrificing reliability:

**Parallelization**:

- Run independent tests in parallel
- Use separate browser contexts
- Playwright supports automatic parallelization

**Test Scope**:

- Don't E2E test what unit tests can cover
- Focus on integration points and user workflows
- One E2E test per critical user story, not per function

**Setup/Teardown**:

- Reuse browser contexts when possible
- Don't restart browser for every test
- Clean state between tests, not browser instances

### Resource Usage

**Browser Instances**:

- Multiple browsers consume significant memory
- Limit parallel browser count on CI
- Close contexts when done

**Fixtures**:

- Keep test archives small when possible
- Large files only when testing large file handling
- Consider memory constraints on CI runners

## Test Organization

### File Structure

```
tests/
  e2e/
    specs/
      inspection.spec.js      # Archive viewing tests
      extraction.spec.js      # Extraction tests
      security.spec.js        # Warning and safety tests
      settings.spec.js        # Extension settings tests
    helpers/
      extension-utils.js      # Extension loading helpers
      fixture-server.js       # Test server setup
      assertions.js           # Custom assertions
    fixtures/                 # Symlink to ../fixtures/
```

### Test Naming

Use descriptive, user-focused names:

**Good**:

- "User sees warning for path traversal archive"
- "User can extract safe archive successfully"
- "Extension shows file list for multi-file archive"

**Bad**:

- "Test case 1"
- "Archive test"
- "checkPathTraversal()"

## Debugging E2E Tests

### Local Development

**Run in headed mode**:

- See what the browser is doing
- Interact manually if needed
- Observe timing issues

**Use breakpoints**:

- Playwright supports debugger statements
- Pause and inspect page state
- Step through test code

**Slow motion mode**:

- Slow down test execution
- See each action clearly
- Identify race conditions

### CI Debugging

**Artifacts**:

- Always save screenshots on failure
- Save trace files for replay
- Include console logs
- Capture video if practical

**Reproducibility**:

- Use same browser versions locally
- Match CI environment variables
- Test on same OS when possible

## Flaky Test Prevention

### Common Causes

1. **Timing issues**: Race conditions, async operations
2. **Network variability**: External resources, download timing
3. **State pollution**: Tests affecting each other
4. **Resource constraints**: Memory, CPU on CI
5. **Non-deterministic behavior**: Randomness, timing-dependent code

### Prevention Strategies

**Use explicit waits**:

- Wait for specific elements, not arbitrary timeouts
- Wait for network idle
- Wait for animations to complete

**Isolate tests**:

- Clean state before each test
- Don't share data between tests
- Use separate browser contexts

**Use deterministic fixtures**:

- No random data generation
- Fixed timestamps
- Controlled ordering

**Avoid flaky selectors**:

- Use data-testid attributes
- Avoid brittle CSS selectors
- Don't rely on text that may change

## Continuous Integration

### PR Checks

Run subset of E2E tests on every PR:

- Smoke test: One happy path test
- Security test: One warning test
- Fast execution (<2 minutes)

### Nightly Builds

Run full E2E suite nightly:

- All user story tests
- Cross-browser tests
- Performance tests
- Longer timeout allowance

### Pre-Release

Run comprehensive suite before release:

- All platforms
- All supported browsers
- Extended test scenarios
- Manual testing supplement

## Success Criteria

### Test Quality

Good E2E tests are:

- **Reliable**: Pass consistently, no flakes
- **Fast**: Complete in reasonable time
- **Clear**: Obvious what failed and why
- **Valuable**: Test real user scenarios
- **Maintainable**: Easy to update when features change

### Coverage Goals

Don't aim for 100% E2E coverage. Focus on:

- Critical user workflows (must test)
- Security features (must test)
- Cross-browser compatibility (should test)
- Edge cases (can test if time allows)

## Future Enhancements

### Potential Additions

**Visual regression testing**:

- Screenshot comparison
- Detect unintended UI changes
- Require manual approval for intentional changes

**Performance testing**:

- Measure extension load time
- Track memory usage
- Monitor large file handling

**Accessibility testing**:

- Keyboard navigation
- Screen reader compatibility
- ARIA attributes

**Mobile testing**:

- Chrome on Android
- Firefox on Android
- Mobile browser quirks

## Conclusion

E2E tests are expensive but essential for extension quality. Use them strategically:

- Test complete user workflows, not individual functions
- Use synthetic fixtures for speed and reliability
- Capture diagnostics to debug failures quickly
- Keep tests fast and non-flaky
- Complement with unit and integration tests

The goal is confidence that real users, in real browsers, can safely inspect and extract archives without encountering bugs or missing critical security warnings.
