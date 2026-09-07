# Security Policy

ZipKit takes security seriously. This document describes our security model, vulnerability reporting process, and security commitments.

---

## Security Model

### What ZipKit Protects Against

ZipKit provides **structural archive safety analysis**:

- ✅ **Path traversal attacks** — Detects entries attempting to escape extraction directory
- ✅ **Archive bombs** — Detects extreme expansion ratios indicating resource exhaustion attacks
- ✅ **Executable content** — Identifies executables and scripts that could pose execution risk
- ✅ **Symlink/hardlink escapes** — Detects links pointing outside archive
- ✅ **Nested archives** — Identifies archives within archives
- ✅ **Malformed archives** — Detects structural corruption

### What ZipKit Does NOT Protect Against

- ❌ **Malware detection** — ZipKit is not antivirus software
- ❌ **Content validation** — We analyze structure, not file contents
- ❌ **Post-extraction behavior** — We cannot prevent execution of extracted files
- ❌ **Social engineering** — Users can still make unsafe choices
- ❌ **Browser/OS vulnerabilities** — Outside our threat model

### Honest Statement

**ZipKit is a developer productivity tool with security awareness, not a security product.**

We detect structural archive risks and warn users. We do not guarantee safety of all archive contents. Users should:

- Use ZipKit alongside antivirus software
- Exercise caution with archives from untrusted sources
- Understand warnings before proceeding
- Not rely solely on ZipKit for protection

See [docs/security/security-model.md](docs/security/security-model.md) for complete security architecture.

---

## Reporting a Vulnerability

### For Security Researchers

**Do not report security vulnerabilities in public GitHub issues.**

If you discover a security vulnerability in ZipKit, please report it responsibly:

### Reporting Process

**Email:** eyuelabebe@gmail.com

**Subject:** `[SECURITY] ZipKit Vulnerability Report`

**Include:**

1. **Description** — What is the vulnerability?
2. **Impact** — What could an attacker achieve?
3. **Steps to reproduce** — How can we verify the issue?
4. **Affected versions** — Which versions are vulnerable?
5. **Suggested fix** (optional) — How could it be mitigated?
6. **Your contact info** — For follow-up questions

### What to Expect

- **Acknowledgment** — Within 48 hours
- **Assessment** — Severity and impact analysis
- **Fix timeline** — When we plan to release a patch
- **Credit** — Attribution in security advisory (if you wish)
- **Disclosure** — Coordinated public disclosure after patch

### Do NOT

- ❌ Publicly disclose before patch is available
- ❌ Exploit the vulnerability
- ❌ Test on production systems without permission
- ❌ Demand payment for disclosure

### Scope

**In scope:**

- Path validation bypass
- Security check bypass
- Extension permission abuse
- Privacy violations (unintended data upload)
- Code execution via archive processing
- Resource exhaustion attacks
- Archive parsing vulnerabilities

**Out of scope:**

- Issues affecting unsupported browsers
- Social engineering attacks
- Vulnerabilities in third-party dependencies (report to them first)
- Issues in browser/OS (report to vendor)
- Theoretical issues without proof-of-concept

---

## Security Updates

### Versioning

Security fixes follow semantic versioning:

- **Critical vulnerabilities** — Immediate patch release (PATCH bump)
- **High severity** — Expedited patch release
- **Medium/Low severity** — Included in next planned release

### Notification

Security updates will be announced via:

- GitHub Security Advisories
- Release notes in GitHub Releases
- Updated CHANGELOG.md

### Supported Versions

Before 1.0.0:

- Only the latest version is supported
- Users are expected to update to latest version
- No backports to old versions

After 1.0.0 (future):

- Support policy will be defined
- LTS versions may be supported

---

## Security Best Practices for Users

### When Using ZipKit

1. **Keep ZipKit updated** — Install security patches promptly
2. **Read warnings** — Take security warnings seriously
3. **Verify sources** — Only open archives from trusted sources
4. **Use antivirus** — ZipKit is not a replacement for security software
5. **Check permissions** — Review what permissions ZipKit requests
6. **Report issues** — Report suspicious behavior

### When Extracting Archives

1. **Inspect first** — Use ZipKit's inspection feature before extracting
2. **Read safety report** — Understand detected risks
3. **Choose safe destination** — Extract to isolated folder
4. **Heed warnings** — Do not ignore path traversal or expansion warnings
5. **Scan after extraction** — Run antivirus on extracted contents
6. **Be cautious with executables** — Do not blindly execute files from archives

---

## Privacy and Data Security

### Local-First Processing

- Archives are processed in your browser
- No remote servers in MVP
- No uploading of archive contents
- No tracking or analytics

### Extension Permissions

ZipKit requests **minimal permissions**:

- `storage` — Store user preferences locally

ZipKit does **NOT** request:

- Host permissions
- Downloads permission (not yet, evaluated in Phase 9)
- Broad API access
- User data access

If ZipKit requests additional permissions in future versions, we will clearly document why and how they are used.

### Privacy Policy

ZipKit does not collect, transmit, or store user data externally.

Your archives are private.

If remote processing is added in the future (optional feature), it will:

- Be clearly disclosed
- Require explicit user consent
- Be documented in updated privacy policy

---

## Security Development Practices

### Code Review

- All changes reviewed before merge
- Security-sensitive areas require extra scrutiny
- CODEOWNERS defined for critical components

### Testing

- Security fixtures test detection logic
- Path traversal test cases
- Archive bomb test cases
- Regression tests for security fixes

See [docs/testing/fixture-strategy.md](docs/testing/fixture-strategy.md).

### Dependencies

- Automated dependency scanning (Dependabot)
- Regular dependency updates
- Security advisory monitoring
- License compliance checks

### CI/CD Security

- Least-privilege GitHub Actions
- No secrets in PR workflows from forks
- Commit SHA pinning for critical workflows

See [.claude/SECURITY.md](.claude/SECURITY.md).

---

## Security Checklist for Contributors

When contributing code:

- [ ] Reviewed security implications of change
- [ ] Validated all archive input as untrusted
- [ ] Sanitized all extraction paths
- [ ] Added security tests where applicable
- [ ] Did not weaken existing security checks
- [ ] Did not add unnecessary extension permissions
- [ ] Updated security documentation if behavior changed
- [ ] Followed secure coding practices

See [docs/security/](docs/security/) for developer security guidelines.

---

## Known Limitations

### Current Limitations

1. **Not antivirus** — We analyze archive structure, not file content
2. **Detection not guaranteed** — Attackers may find bypasses
3. **User responsibility** — Users can ignore warnings
4. **Evolving threats** — New attack techniques may emerge
5. **Browser constraints** — Limited by browser sandbox capabilities

### Future Work

- Enhanced expansion detection
- Better executable analysis
- Signature-based scanning (research required)
- Integration with external scanning APIs (optional, privacy-preserving)

---

## Questions?

For security questions that are not vulnerabilities:

- Read [docs/security/](docs/security/)
- Open a public issue (for non-sensitive topics)
- Email for private questions: eyuelabebe@gmail.com

---

**Last Updated:** 2026-09-07

**Thank you for helping keep ZipKit secure!**
