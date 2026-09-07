# Security Guidelines

Security is a core principle and differentiator for ZipKit.

## Threat Model

See `/docs/security/threat-model.md` for complete threat analysis.

### Primary Threats

1. **Malicious archives** designed to exploit extraction vulnerabilities
2. **Path traversal** attacks escaping extraction destination
3. **Archive bombs** causing resource exhaustion
4. **Symlink/hardlink** escape from extraction container
5. **Executable/script** content posing execution risk
6. **Extension permissions** exceeding necessary scope
7. **User data privacy** through improper handling

### Out of Scope

- Full antivirus / malware detection (not replacement for security software)
- Protection against user intentionally executing malicious content
- Protection against browser/OS vulnerabilities
- Network-based attacks (ZipKit is local-first)

## Archive Security Principles

### 1. All Archive Input is Untrusted

**Every archive must be treated as potentially malicious:**

```typescript
// ✅ Good
async function extractEntry(entry: ArchiveEntry, destination: string) {
  const safePath = sanitizePath(entry.path);
  if (!isWithinDestination(safePath, destination)) {
    throw new PathTraversalError();
  }
  // ... extract
}

// ❌ Bad
async function extractEntry(entry: ArchiveEntry, destination: string) {
  // Trusting entry.path directly
  const outputPath = path.join(destination, entry.path);
  // ... extract
}
```

### 2. Defense in Depth

Multiple layers of protection:

1. **Path validation** before extraction
2. **Expansion ratio** analysis
3. **Entry count** limits
4. **Recursive depth** checks
5. **File type** detection
6. **User warnings** before risky operations

### 3. Fail Safely

When in doubt, block:

```typescript
// ✅ Good
if (!canSafelyExtract(entry)) {
  throw new SecurityError('Entry failed safety validation');
}

// ❌ Bad
if (mightBeUnsafe(entry)) {
  console.warn('Entry might be unsafe'); // But extract anyway
}
```

### 4. Clear User Communication

Security warnings must be:

- **Clear** — explain the specific risk
- **Actionable** — user knows what to do
- **Not alarming** — avoid false panic
- **Accurate** — never claim capabilities we don't have

Example:
```
⚠️ Archive Safety Warning

This archive contains entries that attempt to escape the
extraction directory using ".." paths.

Extracting this archive could modify files outside your
chosen location.

[Cancel] [Extract Anyway]
```

## Path Security

### Validation Requirements

All extracted paths must pass:

1. **Normalization** — resolve `.`, `..`, repeated separators
2. **Absolute path rejection** — block `/`, `C:\`, etc.
3. **UNC path rejection** — block `\\server\share` on Windows
4. **Parent traversal** — no `../` escapes
5. **Null bytes** — reject paths with `\0`
6. **Unusual separators** — handle Unicode lookalikes
7. **Destination containment** — final path must be within destination

### Implementation

```typescript
function sanitizePath(entryPath: string): string {
  // Remove null bytes
  if (entryPath.includes('\0')) {
    throw new InvalidPathError('Path contains null byte');
  }

  // Normalize
  const normalized = path.normalize(entryPath);

  // Check for absolute paths
  if (path.isAbsolute(normalized)) {
    throw new PathTraversalError('Absolute paths not allowed');
  }

  // Check for parent traversal
  if (normalized.startsWith('..') || normalized.includes(path.sep + '..')) {
    throw new PathTraversalError('Parent directory traversal not allowed');
  }

  return normalized;
}

function isWithinDestination(safePath: string, destination: string): boolean {
  const fullPath = path.resolve(destination, safePath);
  const destPath = path.resolve(destination);

  return fullPath.startsWith(destPath + path.sep) || fullPath === destPath;
}
```

## Symlink and Hardlink Security

### Symlinks

- **Detect** symlink entries during inspection
- **Warn** user before extraction
- **Validate** symlink destination doesn't escape
- **Consider** blocking symlink extraction by default

### Hardlinks

- **Detect** hardlink entries (TAR)
- **Validate** link destination is within archive
- **Warn** if hardlink target is outside extraction destination

## Archive Bomb Detection

### Expansion Ratio

```typescript
interface ExpansionAnalysis {
  compressedSize: number;
  uncompressedSize: number;
  ratio: number;
  isHighExpansion: boolean; // > 1000:1
  isExtremeExpansion: boolean; // > 10000:1
}
```

Thresholds:

- **Warning**: 1000:1 ratio
- **Strong warning**: 10000:1 ratio
- **Block**: configurable user preference

### File Count

- **Warning**: > 10,000 files
- **Strong warning**: > 100,000 files

### Directory Depth

- **Warning**: > 50 levels deep
- **Strong warning**: > 100 levels

## Executable and Script Detection

Detect potentially dangerous file types:

### Extensions

- Executables: `.exe`, `.dll`, `.so`, `.dylib`, `.app`, `.cmd`, `.bat`, `.com`, `.msi`
- Scripts: `.sh`, `.bash`, `.ps1`, `.py`, `.rb`, `.pl`, `.js`, `.vbs`
- Macros: `.doc`, `.docm`, `.xls`, `.xlsm`, `.ppt`, `.pptm`

### MIME Type (if detectable)

Cross-check file extension with content signature.

### User Warning

```
⚠️ Executable Files Detected

This archive contains executable files or scripts that could
run code on your computer if opened.

Files: setup.exe, install.sh, runner.bat

[Cancel] [Extract Anyway]
```

## Extension Permissions

### Minimal Permissions Principle

Only request permissions that are absolutely necessary:

**Currently needed:**

- `storage` — store user preferences
- `tabs` — open workspace in new tab

**Explicitly avoid unless justified:**

- `downloads` — avoid until download integration is implemented
- `webRequest` — not needed
- `<all_urls>` — never needed
- `cookies` — not needed
- `history` — not needed

### Permission Changes

Any PR that adds extension permissions must:

1. **Justify** why the permission is necessary
2. **Document** how it's used
3. **Explain** privacy implications
4. **Update** privacy documentation
5. **Get explicit approval** from CODEOWNERS

## Privacy

### Local-First Processing

- Archives must be processed locally in browser
- No uploading to remote servers in MVP
- No tracking or analytics in MVP

### User Data

- Archive contents are private user data
- Do not log archive contents
- Do not transmit archive metadata
- Clear temporary data after operations

### Future Remote Processing

If remote processing is ever added:

1. **Must be optional**
2. **Must be clearly disclosed**
3. **Must document what data is sent**
4. **Must get explicit user consent**
5. **Must be documented in ADR**
6. **Must update privacy policy**

## Dependency Security

### Evaluation Criteria

Before adopting an archive library:

- ✅ Actively maintained
- ✅ Recent releases
- ✅ Security disclosure process
- ✅ No known critical vulnerabilities
- ✅ License compatible (MIT/BSD/Apache preferred)
- ✅ Browser compatible
- ✅ Reasonable bundle size

### Ongoing Monitoring

- Dependabot enabled
- Automated security alerts
- Regular dependency updates
- Review security advisories

### Response to Vulnerabilities

1. **Assess severity** and exploitability
2. **Update dependency** if patch available
3. **Create hotfix release** if critical
4. **Mitigate in code** if no patch available
5. **Document** in security advisory if user-facing

## GitHub Actions Security

### Workflow Permissions

Use **least privilege**:

```yaml
permissions:
  contents: read # Most jobs only need read

# Only release jobs get write
permissions:
  contents: write
```

### Secrets

- Never commit secrets
- Never log secrets
- Limit secret exposure to necessary jobs
- Use environment protection for sensitive workflows

### Third-Party Actions

- Pin to commit SHA for security-critical workflows
- Review provenance and maintenance
- Prefer official GitHub actions
- Regularly update pinned versions

### Pull Request Safety

- Do not expose secrets to PR workflows from forks
- Do not auto-execute code from untrusted PRs
- Separate PR check workflows from release workflows

## Security Testing

### Required Tests

- ✅ Path traversal fixtures
- ✅ Symlink escape fixtures
- ✅ High expansion fixtures
- ✅ Absolute path fixtures
- ✅ Executable detection
- ✅ Duplicate path handling
- ✅ Malformed archive handling

### Security Regression Suite

Maintain corpus of security-relevant fixtures.

Run on every PR.

Never skip security tests.

## Security Disclosures

### Reporting

See `/SECURITY.md` for vulnerability reporting process.

**Do not disclose security vulnerabilities in public issues.**

### Response

1. **Acknowledge** report within 48 hours
2. **Assess** severity and impact
3. **Fix** in private branch
4. **Test** fix thoroughly
5. **Release** patched version
6. **Disclose** responsibly after users can update

## Code Review for Security Changes

PRs touching security-sensitive code require:

- Clear explanation of security impact
- Test coverage for security behavior
- CODEOWNERS approval
- Extra scrutiny in review

## Never Do

- ❌ Weaken security checks to pass tests
- ❌ Skip security validation "just this once"
- ❌ Trust user-provided paths without sanitization
- ❌ Load entire untrusted archives into memory
- ❌ Execute or eval archive contents
- ❌ Add permissions "just in case"
- ❌ Disable security warnings globally
- ❌ Log sensitive user data

## Security Philosophy

**ZipKit provides structural archive safety, not antivirus protection.**

We detect:

- Archive structure risks
- Extraction vulnerabilities
- Expansion attacks
- Dangerous file types (by extension)

We do not:

- Scan file contents for malware signatures
- Replace antivirus software
- Guarantee safety of all archive contents

Be honest about capabilities and limitations.
