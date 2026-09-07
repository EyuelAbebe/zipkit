# ZipKit Test Fixture Strategy

## Overview

Test fixtures are the archive files used to validate ZipKit's functionality. The quality and safety of test fixtures directly impacts test reliability, security, and maintainability.

## Core Principles

### 1. Never Use Random Internet Archives

**Why Not**:

- Unknown contents (could contain actual malware)
- Non-deterministic (file may change or disappear)
- Legal concerns (licensing, copyright)
- Unreliable (network dependency, hosting changes)
- Opaque (hard to know what you're testing)

**Instead**:

- Create purpose-built synthetic fixtures
- Document exactly what each fixture contains
- Generate programmatically when possible
- Store in version control

### 2. Never Commit Real Malware

**Why Not**:

- Security risk to developers
- May trigger antivirus false positives
- Legal and ethical concerns
- Unnecessary for testing

**Instead**:

- Create synthetic "attack" archives that demonstrate patterns without actual payloads
- Use path traversal strings without harmful executables
- Simulate zip bombs with mathematical patterns, not real bombs
- Test detection logic, not actual malware execution

### 3. Create Purpose-Built Synthetic Fixtures

**Characteristics of Good Fixtures**:

- **Minimal**: Only contains what's needed for the test
- **Documented**: Clear purpose and contents
- **Deterministic**: Always produces same results
- **Safe**: No harmful content
- **Versioned**: Stored in git with clear history

### 4. Fixtures are Code

Treat fixtures with the same care as code:

- Review in pull requests
- Document purpose and contents
- Keep organized and named clearly
- Delete obsolete fixtures
- Generate from scripts when practical

## Standard Fixture Categories

### 1. Normal Archives

Purpose: Test standard archive handling

**Required Fixtures**:

**small-archive.zip**

- 1-3 files
- Total size: <10 KB
- Simple filenames (ASCII, no spaces)
- Flat structure (no directories)
- Purpose: Fast smoke tests

**medium-archive.zip**

- 10-50 files
- Total size: 100-500 KB
- Mixed filenames (Unicode, spaces, special chars)
- Directory structure (2-3 levels deep)
- Purpose: Typical real-world archive

**large-archive.zip**

- 100-500 files
- Total size: 5-10 MB
- Deep directory structure (5+ levels)
- Purpose: Performance and memory testing

**empty-archive.zip**

- 0 files
- Valid ZIP structure
- Purpose: Edge case handling

**single-file.zip**

- 1 file
- Purpose: Minimal valid archive

### 2. Security Test Fixtures

Purpose: Validate security protections

**path-traversal-simple.zip**

- Contains: `../../../etc/passwd` (or similar)
- Purpose: Basic path traversal detection
- Safe because: No actual payload, just path string

**path-traversal-variations.zip**

- Contains multiple patterns:
  - `..\\..\\..\\Windows\\System32\\`
  - `....//....//....//`
  - `..%2F..%2F..%2F`
  - `‥/‥/` (Unicode lookalikes)
- Purpose: Test various evasion techniques
- Safe because: No executable content

**high-compression-ratio.zip**

- Contains: Small file that expands to ~100 MB
- Compression ratio: >100:1
- Purpose: Zip bomb detection
- Safe because: Controlled expansion, no infinite recursion

**symlink-escape.zip**

- Contains: Symlink pointing outside archive
- Purpose: Symlink attack detection
- Safe because: No actual target, just link structure

**absolute-paths.zip**

- Contains: Files with absolute paths (C:\, /etc/, etc.)
- Purpose: Absolute path rejection
- Safe because: No executable content

### 3. Malformed Archives

Purpose: Test error handling and robustness

**corrupted-header.zip**

- Invalid ZIP header bytes
- Purpose: Graceful failure on corruption
- Expected behavior: Clear error message

**truncated-archive.zip**

- Valid header, incomplete data
- Purpose: Handle incomplete downloads
- Expected behavior: Clear error message

**invalid-compression.zip**

- Declares unsupported compression method
- Purpose: Handle unknown compression
- Expected behavior: Clear error message

**missing-central-directory.zip**

- Local headers present, central directory missing
- Purpose: Handle malformed structure
- Expected behavior: Clear error message

### 4. Special Case Archives

Purpose: Test edge cases and special features

**password-protected.zip**

- Contains: Encrypted files
- Password: "test123" (documented)
- Purpose: Password detection and handling

**nested-archives.zip**

- Contains: archive1.zip containing archive2.zip
- Purpose: Nested archive detection
- Depth: 2-3 levels

**unicode-filenames.zip**

- Contains files with names in:
  - Japanese (日本語)
  - Arabic (العربية)
  - Emoji (📁📄)
  - Right-to-left text
- Purpose: Unicode handling

**special-characters.zip**

- Contains files with names including:
  - Spaces
  - Quotes (' ")
  - Symbols (&, %, $, etc.)
  - Control characters (where permitted)
- Purpose: Filename sanitization

**empty-files.zip**

- Contains: Multiple 0-byte files
- Purpose: Handle empty content

**large-file.zip**

- Contains: Single file >100 MB
- Purpose: Large file handling
- Note: May not commit to git (generate in tests)

## Fixture Organization

### Directory Structure

```
tests/
  fixtures/
    normal/
      small-archive.zip
      medium-archive.zip
      large-archive.zip
      empty-archive.zip
      single-file.zip
    security/
      path-traversal-simple.zip
      path-traversal-variations.zip
      high-compression-ratio.zip
      symlink-escape.zip
      absolute-paths.zip
    malformed/
      corrupted-header.zip
      truncated-archive.zip
      invalid-compression.zip
      missing-central-directory.zip
    special/
      password-protected.zip
      nested-archives.zip
      unicode-filenames.zip
      special-characters.zip
      empty-files.zip
    generators/
      create-fixtures.js       # Script to generate fixtures
      README.md                # Documentation for each fixture
```

### Documentation Requirements

Each fixture should be documented in `tests/fixtures/README.md`:

**Template**:

```markdown
## fixture-name.zip

**Purpose**: Brief description of test purpose

**Contents**:

- File 1: description
- File 2: description
- ...

**Expected Behavior**: What ZipKit should do with this archive

**Created**: How it was created (script, manual, tool)

**Last Updated**: Date and reason for last change
```

## Fixture Generation

### Why Generate Instead of Commit

Some fixtures should be generated by scripts:

**Benefits**:

- Reproducible from source
- No large binary files in git
- Easy to modify and regenerate
- Can create parameterized variations
- Transparent contents

**When to Generate**:

- Large files (>1 MB)
- Files with predictable patterns
- Security test cases (ensures safety)
- Multiple variations of same pattern

**When to Commit Binary**:

- Small files (<100 KB)
- Complex structure hard to script
- One-off edge cases
- Actual malformed data (hard to generate)

### Generation Scripts

Location: `tests/fixtures/generators/`

**Example: Create Path Traversal Archive**

```javascript
// Conceptual example - not actual code
const JSZip = require('jszip');
const fs = require('fs');

function createPathTraversalFixture() {
  const zip = new JSZip();

  // Add file with path traversal
  zip.file('../../../etc/passwd', 'fake-content');

  return zip.generateAsync({ type: 'nodebuffer' }).then((buffer) => {
    fs.writeFileSync('tests/fixtures/security/path-traversal-simple.zip', buffer);
  });
}
```

**Example: Create Zip Bomb**

```javascript
// Conceptual example
function createZipBomb() {
  const zip = new JSZip();

  // Create highly compressible content
  const repetitiveContent = 'A'.repeat(10 * 1024 * 1024); // 10 MB of 'A's

  zip.file('bomb.txt', repetitiveContent);

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
```

### Generation in CI

Option to generate fixtures in CI if too large for git:

**Strategy**:

1. Commit generator scripts
2. Run generators before tests
3. Use generated files in tests
4. Don't persist generated files

**Trade-offs**:

- Pro: No large binaries in git
- Pro: Always fresh fixtures
- Con: Adds CI time
- Con: Another dependency to maintain

## Fixture Validation

### Automated Checks

Validate fixtures remain correct:

**Checksum Verification**:

```javascript
// Ensure fixtures haven't been corrupted
const expectedChecksums = {
  'small-archive.zip': 'abc123...',
  'path-traversal.zip': 'def456...',
};

test('fixtures have expected checksums', () => {
  for (const [file, expectedHash] of Object.entries(expectedChecksums)) {
    const actualHash = calculateHash(file);
    expect(actualHash).toBe(expectedHash);
  }
});
```

**Structure Validation**:

- Verify fixture contains expected files
- Verify file counts
- Verify no unexpected contents

**Security Validation**:

- Scan fixtures with antivirus
- Verify no actual malware
- Verify attack patterns are synthetic

## Fixture Maintenance

### When to Update Fixtures

**Update when**:

- Test requirements change
- Bug revealed missing edge case
- New attack pattern discovered
- Better synthetic version available

**Don't update**:

- For cosmetic reasons
- Without documenting changes
- Without regenerating checksums
- Without testing impact

### Version Control

**Commit Messages**:

```
Add fixture for Unicode filename handling

- Contains files with Japanese, Arabic, emoji names
- Tests Unicode normalization and display
- Generated with generators/create-unicode-archive.js
```

**Review Checklist**:

- [ ] Purpose documented
- [ ] Contents documented
- [ ] No actual malware
- [ ] Appropriate size for git
- [ ] Used by at least one test
- [ ] Generator script if applicable

## Platform Considerations

### Line Endings

**Issue**: Text files in archives may have platform-specific line endings

**Solution**:

- Use binary files or normalize in tests
- Document expected line endings
- Test line ending handling explicitly if relevant

### Path Separators

**Issue**: Windows uses backslash, Unix uses forward slash

**Solution**:

- Test both separator types
- Use path normalization in code
- Fixtures should test both formats

### File Permissions

**Issue**: Unix has executable bits, Windows doesn't

**Solution**:

- Document fixture expectations
- Test permission handling where relevant
- May need platform-specific fixtures

## Security Fixture Safety Guidelines

### Creating Safe Attack Fixtures

1. **No executable content**: Text files only, no .exe, .dll, .so
2. **No real credentials**: Use fake/example data
3. **No network activity**: No URLs, no embedded requests
4. **Document clearly**: Label as test fixture
5. **Scan regularly**: Run antivirus on fixtures directory

### Handling False Positives

Antivirus may flag security test fixtures:

**Solutions**:

- Add fixtures directory to AV exceptions (document this)
- Use clearly synthetic patterns (e.g., "FAKE-MALWARE-TEST")
- Keep fixtures outside main codebase if necessary
- Document in security policy

## Fixture Reuse

### Across Test Types

Same fixtures should work for:

- Unit tests
- Integration tests
- E2E tests

**Benefits**:

- Consistency
- Reduced maintenance
- Shared understanding

### Across Projects

Consider publishing fixture set as separate package if useful to broader community:

- Other ZIP tools could use same tests
- Standardizes security testing
- Community contributions

## Conclusion

Good test fixtures are:

1. **Safe**: No actual malware, no harmful content
2. **Synthetic**: Purpose-built for testing
3. **Documented**: Clear purpose and contents
4. **Versioned**: Tracked in git with clear history
5. **Maintained**: Updated as needed, validated regularly

The fixture strategy ensures ZipKit tests are reliable, safe, and maintainable. Every fixture should have a clear purpose and be the minimal example needed to test that purpose.

When in doubt: **create it yourself, keep it small, document it well**.
