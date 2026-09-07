# ZipKit Threat Model

## Overview

This document provides a comprehensive threat analysis for ZipKit, identifying potential security risks, attack vectors, and mitigation strategies. It establishes clear boundaries for what ZipKit protects against and what remains the user's responsibility.

## Threat Model Scope

### In Scope

Security considerations within ZipKit's control:
- Archive parsing and analysis
- Path validation and traversal prevention
- Resource exhaustion detection
- User warning presentation
- Extension permission usage
- Local data handling

### Out of Scope

Security considerations outside ZipKit's control:
- Malware detection and antivirus functionality
- Post-extraction file execution
- User decision-making
- Operating system vulnerabilities
- VS Code platform vulnerabilities
- Third-party archive library vulnerabilities (when detected, reported to upstream)

## Threat Actors

### 1. Malicious Archive Creator

**Profile**
- Skill Level: Varies from script kiddie to advanced
- Access: Can create archives, cannot modify ZipKit
- Goal: Execute malicious code or exfiltrate data on victim machine
- Resources: Archive creation tools, publicly available exploits

**Capabilities**
- Create specially crafted archives
- Distribute archives through various channels
- Use social engineering to convince users to open archives
- Combine multiple attack techniques

**Limitations**
- Cannot modify ZipKit code
- Cannot bypass user warnings without user action
- Cannot force automatic extraction
- Limited by archive format specifications

### 2. Compromised Archive Source

**Profile**
- Legitimate source that has been compromised
- User may trust the source
- Archives may appear legitimate

**Capabilities**
- Distribute malicious archives through trusted channels
- Leverage user trust in the source
- Bypass user suspicion

**Limitations**
- Same technical limitations as malicious creators
- Detection mechanisms still apply

### 3. Insider Threat

**Profile**
- User with legitimate access to system
- May be malicious or negligent
- Has ability to override warnings

**Capabilities**
- Intentionally extract dangerous archives
- Ignore security warnings
- Execute extracted content

**Limitations**
- Cannot bypass security detection
- Actions are logged (in principle)
- Limited to their system access

## Threat Scenarios

### T1: Path Traversal Attack (Zip Slip)

**Description**: Archive contains files with paths designed to escape the extraction directory.

**Attack Vector**
```
archive.zip
├── ../../../etc/passwd
├── ..\..\..\..\Windows\System32\config.sys
└── \\SERVER\C$\Users\Admin\file.txt
```

**Attacker Goal**
- Overwrite system files
- Write to sensitive directories
- Gain elevated access through file replacement

**Impact**
- **Severity**: Critical
- **Confidentiality**: High - Can overwrite sensitive files
- **Integrity**: Critical - Can modify system files
- **Availability**: Medium - Can disrupt system operation

**Mitigation Layers**

1. **Detection** (Primary)
   - Scan all paths before extraction
   - Normalize paths and detect `..` components
   - Block absolute paths
   - Detect UNC paths
   - Flag null bytes

2. **Warning** (Secondary)
   - Display "Danger" warning to user
   - Show specific malicious paths
   - Require explicit acknowledgment

3. **User Decision** (Final)
   - User must choose to proceed despite warning
   - Clear documentation of risks

**Residual Risk**: Low - Multiple layers of protection, clear warnings

**Test Cases**
- Unix path traversal: `../../etc/passwd`
- Windows path traversal: `..\..\..\Windows\System32`
- Absolute paths: `/etc/shadow`
- UNC paths: `\\SERVER\share\file`
- Mixed: `dir/../../../etc/passwd`

### T2: Archive Bomb (Resource Exhaustion)

**Description**: Archive with extreme compression ratio designed to exhaust disk space or memory.

**Attack Vector**
```
bomb.zip (42 KB)
└── Expands to multiple gigabytes or terabytes
    Example: 10nested.zip (42 KB → 4.5 PB)
```

**Attacker Goal**
- Fill disk space
- Crash system or application
- Denial of service

**Impact**
- **Severity**: High
- **Confidentiality**: None
- **Integrity**: Low - May corrupt due to disk full
- **Availability**: Critical - System becomes unusable

**Mitigation Layers**

1. **Detection** (Primary)
   - Calculate compression ratios
   - Flag ratios > 100:1 as Warning
   - Flag ratios > 1000:1 as Danger
   - Detect nested archives that amplify compression

2. **Warning** (Secondary)
   - Show compression ratio to user
   - Display uncompressed vs compressed size
   - Warn about potential disk space usage

3. **Extraction Monitoring** (Tertiary - Future)
   - Monitor extraction size in real-time
   - Abort if exceeds threshold
   - Request user confirmation for large extractions

**Residual Risk**: Medium - User may not understand implications of large extractions

**Test Cases**
- 100:1 compression ratio
- 1000:1 compression ratio
- Nested archives (zip in zip)
- Many small files vs few large files

### T3: Malicious Executable Extraction

**Description**: Archive contains executable files or scripts that could harm the system if run.

**Attack Vector**
```
documents.zip
├── report.pdf (legitimate)
├── data.xlsx (legitimate)
└── update.exe (malicious)
```

**Attacker Goal**
- Trick user into executing malware
- Social engineering combined with extraction
- Blend malicious content with legitimate files

**Impact**
- **Severity**: High (if executed)
- **Confidentiality**: High - Can steal data
- **Integrity**: High - Can modify system
- **Availability**: High - Can cause DoS

**Mitigation Layers**

1. **Detection** (Primary)
   - Scan for executable extensions
   - Check file permissions for execute bits
   - Detect script files
   - Identify macro-enabled documents

2. **Warning** (Secondary)
   - List all executable files found
   - Warning level notification
   - Explain risks of executing unknown files

3. **No Automatic Execution** (By Design)
   - ZipKit never executes extracted files
   - User must manually run files
   - OS-level protections may apply (Gatekeeper, SmartScreen)

**Residual Risk**: High - Depends entirely on user behavior after extraction

**Honest Limitation**: ZipKit cannot prevent users from executing extracted files. We can only warn about their presence.

**Test Cases**
- Windows executables (`.exe`, `.dll`, `.bat`)
- Unix executables (execute bit set)
- Scripts (`.ps1`, `.sh`, `.py`)
- Macro documents (`.docm`, `.xlsm`)

### T4: Symlink Escape

**Description**: Archive contains symbolic links pointing outside the extraction directory.

**Attack Vector**
```
archive.zip
├── link → /etc/passwd (symlink)
└── link/stolen (extracts to /etc/passwd/stolen)
```

**Attacker Goal**
- Write files to arbitrary locations via symlink
- Read sensitive files by creating links
- Bypass path traversal detection through indirection

**Impact**
- **Severity**: High
- **Confidentiality**: High - Can read sensitive files
- **Integrity**: High - Can write to arbitrary locations
- **Availability**: Medium - Can cause system issues

**Mitigation Layers**

1. **Detection** (Primary)
   - Identify symlink file attributes
   - Parse symlink targets
   - Detect absolute targets (Danger)
   - Detect relative targets escaping extraction dir (Danger)
   - Flag internal symlinks (Warning)

2. **Warning** (Secondary)
   - Show symlink target paths
   - Explain symlink risks
   - Risk level based on target

3. **Extraction Behavior** (Tertiary)
   - Platform-dependent symlink handling
   - May extract as regular file or skip
   - User should verify behavior

**Residual Risk**: Medium - Platform and extraction tool dependent

**Test Cases**
- Symlink to absolute path: `/etc/passwd`
- Symlink to relative escape: `../../../../etc/passwd`
- Symlink to internal path: `../other_file.txt` (stays in archive)
- Directory symlink: Link to directory outside extraction path

### T5: Nested Archive Bomb

**Description**: Archives within archives, each compressed, leading to exponential expansion.

**Attack Vector**
```
level1.zip (1 KB)
└── level2.zip (1 MB when extracted)
    └── level3.zip (1 GB when extracted)
        └── level4.zip (1 TB when extracted)
```

**Attacker Goal**
- Bypass simple compression ratio checks
- Achieve massive expansion through multiple layers
- Resource exhaustion

**Impact**
- **Severity**: High
- **Confidentiality**: None
- **Integrity**: Low
- **Availability**: Critical

**Mitigation Layers**

1. **Detection** (Primary)
   - Detect nested archives
   - Warn about presence of archive files
   - Combined with compression ratio check

2. **Warning** (Secondary)
   - Notify user of nested archives
   - Recommend caution
   - Explain amplification risk

3. **Manual Inspection** (User)
   - User must manually extract nested archives
   - Each extraction subject to same checks
   - No automatic recursive extraction

**Residual Risk**: Medium - User may manually extract multiple levels

**Test Cases**
- Single nested archive
- Multiple levels (3+)
- Different archive formats nested
- Combination with high compression ratio

### T6: Duplicate Path Exploitation

**Description**: Multiple entries with same path, exploiting extraction order.

**Attack Vector**
```
archive.zip
├── config.ini (entry 1: legitimate content)
└── config.ini (entry 2: malicious content)
```

**Attacker Goal**
- User reviews first entry (legitimate)
- User extracts archive
- Second entry overwrites first (malicious)
- User trusts reviewed content

**Impact**
- **Severity**: Medium
- **Confidentiality**: Low
- **Integrity**: High - Silent overwrite
- **Availability**: Low

**Mitigation Layers**

1. **Detection** (Primary)
   - Track all paths in archive
   - Detect exact duplicates
   - Detect case-insensitive duplicates
   - Flag directory/file conflicts

2. **Warning** (Secondary)
   - List all conflicting paths
   - Explain extraction order risk
   - Warning level notification

3. **Extraction Behavior** (Tertiary)
   - Document extraction order
   - Consider warning on overwrite
   - User verifies final content

**Residual Risk**: Medium - Users may not understand implication

**Test Cases**
- Exact duplicates: `file.txt` and `file.txt`
- Case variants: `File.txt` and `file.txt`
- Directory vs file: `data/` and `data`

### T7: Deep Directory Tree

**Description**: Extremely deep nested directories causing filesystem issues.

**Attack Vector**
```
archive.zip
└── a/b/c/d/.../[1000 levels deep].../file.txt
```

**Attacker Goal**
- Exceed filesystem path limits
- Cause extraction failures
- Filesystem denial of service
- Difficult to delete or manage

**Impact**
- **Severity**: Low to Medium
- **Confidentiality**: None
- **Integrity**: Low - May cause corruption
- **Availability**: Medium - Difficult to manage

**Mitigation Layers**

1. **Detection** (Primary)
   - Count directory depth
   - Warning at 50+ levels
   - Danger at 100+ levels

2. **Warning** (Secondary)
   - Show maximum depth
   - Warn about filesystem limits
   - Explain potential issues

**Residual Risk**: Low - Mostly usability issue, limited security impact

**Test Cases**
- 50 levels deep
- 100 levels deep
- Path length approaching OS limits

## Threats NOT in Scope

### NS1: Malware Detection

**Why Not in Scope**
- Requires signature databases
- Needs constant updates
- Heuristic analysis is complex
- Already covered by antivirus software
- ZipKit is not a security product

**Recommendation**
- Users should use dedicated antivirus software
- Scan extracted files before execution
- Keep security software updated

### NS2: Content Validation

**Why Not in Scope**
- Cannot verify file integrity without checksums
- Cannot validate file formats
- Cannot detect sophisticated social engineering
- Infinite variety of content types

**Recommendation**
- Verify archive sources
- Check file hashes if provided
- Use caution with unexpected file types

### NS3: Post-Extraction Activity

**Why Not in Scope**
- Cannot monitor what users do with extracted files
- Cannot prevent file execution
- Cannot control user decisions
- OS-level controls outside extension scope

**Recommendation**
- User responsibility to avoid executing suspicious files
- OS security features (Gatekeeper, UAC, etc.)
- Practice safe computing habits

### NS4: Network-Based Attacks

**Why Not in Scope**
- ZipKit makes no network connections
- No remote code execution vectors
- No data transmission
- Local-only operation

**Recommendation**
- Verify archive sources before downloading
- Use secure channels for archive transfer
- Check for tampering during download

### NS5: Extension Marketplace Compromise

**Why Not in Scope**
- Relies on VS Code marketplace security
- Code signing by Microsoft
- Outside ZipKit's control

**Recommendation**
- Install extensions from official marketplace
- Verify publisher identity
- Check extension reviews and ratings

## Attack Tree

```
Goal: Compromise User System via ZipKit
│
├── Extract Files Outside Intended Directory
│   ├── Path Traversal (../)
│   │   ├── [MITIGATED] Detected by path analysis
│   │   └── [RESIDUAL] User ignores warning
│   ├── Absolute Paths
│   │   ├── [MITIGATED] Detected by path analysis
│   │   └── [RESIDUAL] User ignores warning
│   └── Symlink Escape
│       ├── [MITIGATED] Detected by symlink analysis
│       └── [RESIDUAL] User ignores warning
│
├── Execute Malicious Code
│   ├── Extract Executable
│   │   ├── [MITIGATED] User warned about executables
│   │   └── [RESIDUAL] User executes anyway
│   ├── Social Engineering
│   │   └── [NOT MITIGATED] User persuaded to execute
│   └── Embedded Macros
│       ├── [MITIGATED] User warned about macro files
│       └── [RESIDUAL] User opens document with macros
│
├── Resource Exhaustion
│   ├── Archive Bomb
│   │   ├── [MITIGATED] Compression ratio detection
│   │   └── [RESIDUAL] User extracts anyway
│   ├── Nested Archive Bomb
│   │   ├── [PARTIALLY MITIGATED] Nested archive warning
│   │   └── [RESIDUAL] User manually extracts nested archives
│   └── Deep Directory Tree
│       ├── [MITIGATED] Depth detection
│       └── [RESIDUAL] May cause FS issues
│
└── Data Exfiltration
    ├── [NOT APPLICABLE] ZipKit has no network access
    └── [NOT APPLICABLE] No telemetry or data collection
```

## Privacy Threat Analysis

### P1: Unintended Data Upload

**Threat**: Extension uploads archive contents or metadata to remote server.

**Mitigation**: ZipKit makes zero network requests. No telemetry, no analytics, no update checks that transmit data.

**Status**: Eliminated by design

### P2: Data Logging

**Threat**: Extension logs sensitive information from archives.

**Mitigation**: ZipKit only logs minimal information for debugging. No archive contents logged.

**Status**: Minimal risk - local logs only

### P3: Extension Permission Abuse

**Threat**: Extension uses permissions for unintended purposes.

**Mitigation**: Minimal permissions requested. No network, no clipboard, no system command execution.

**Status**: Low risk - limited permissions

## Security Boundaries

### What ZipKit IS

- **Archive Inspector**: Safely view archive contents
- **Risk Detector**: Identify common attack patterns
- **User Informer**: Present security information clearly
- **Extraction Tool**: Extract archives with user consent

### What ZipKit IS NOT

- **Antivirus**: Does not detect malware
- **Sandboxing Tool**: Does not isolate extracted content
- **Firewall**: Does not monitor network activity
- **Security Suite**: Not a comprehensive security solution

### Honest Statement

**ZipKit is a developer productivity tool with security awareness, not a security product.**

We detect common archive-based attacks and warn users, but we cannot:
- Guarantee any archive is safe
- Prevent determined users from extracting dangerous content
- Detect sophisticated malware
- Protect against social engineering
- Control what happens after extraction

**Users remain responsible for:**
- Verifying archive sources
- Making informed extraction decisions
- Not executing suspicious content
- Using antivirus software
- Practicing safe computing

## Security Testing

### Recommended Test Scenarios

1. **Path Traversal**: Evilarc, zip-slip-vulnerability samples
2. **Archive Bombs**: 42.zip, zbomb, 10nested.zip
3. **Executables**: Various executable types on different platforms
4. **Symlinks**: Absolute, relative escape, internal
5. **Nested Archives**: Multiple levels, mixed formats
6. **Duplicates**: Exact, case-insensitive, conflicts
7. **Deep Trees**: 50, 100, 200 level nesting

### Security Review Checklist

- [ ] All user inputs validated
- [ ] Paths normalized before analysis
- [ ] No execution of extracted content
- [ ] No network requests made
- [ ] Minimal permissions used
- [ ] Clear warning messages
- [ ] User must acknowledge risks
- [ ] No automatic extraction of dangerous content

## Incident Response

### Vulnerability Disclosure

If a security vulnerability is discovered:

1. **Report**: Contact maintainers via secure channel
2. **Acknowledgment**: Confirm receipt within 48 hours
3. **Assessment**: Evaluate severity and impact
4. **Fix**: Develop and test patch
5. **Disclosure**: Coordinate public disclosure
6. **Release**: Publish security update
7. **Communication**: Notify users of security update

### Security Update Process

1. Identify vulnerability
2. Develop fix
3. Test thoroughly
4. Release as priority update
5. Update security documentation
6. Notify users through changelog

## Conclusion

ZipKit's threat model is based on realistic assessment of:
- **What we can control**: Detection and warning
- **What we cannot control**: User decisions and post-extraction behavior
- **What's in scope**: Archive-based attacks
- **What's out of scope**: Malware detection and system security

By being honest about limitations and providing clear warnings, we empower users to make informed decisions while providing robust protection against common archive-based attacks.

**Security is a shared responsibility between ZipKit and its users.**
