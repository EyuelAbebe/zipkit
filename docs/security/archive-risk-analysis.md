# Archive Risk Analysis

## Overview

ZipKit performs comprehensive security analysis of archive contents before extraction. This document details the risk detection mechanisms, classification logic, and the rationale behind each security check.

## Risk Classification System

All detected issues are classified into three risk levels:

### Safe

- No security concerns detected
- Archive follows standard practices
- Safe for extraction in normal circumstances

### Warning

- Potentially concerning patterns detected
- May be legitimate but requires user attention
- Extraction should proceed with caution

### Danger

- Clear security threats detected
- High probability of malicious intent
- Extraction should only proceed after careful review

## Security Checks

### 1. Path Traversal Detection

**Risk Level**: Danger

**Description**: Detects attempts to escape the extraction directory through path manipulation.

#### Detection Patterns

**Parent Directory Traversal (../)**

- Pattern: `../`, `..\\`, or encoded variations
- Example: `../../etc/passwd`
- Risk: Overwrites files outside extraction directory
- Detection: Check for `..` path components in normalized paths

**Absolute Paths**

- Pattern: Paths starting with `/` (Unix) or `C:\` (Windows)
- Example: `/etc/shadow`, `C:\Windows\System32\config.sys`
- Risk: Writes to system directories
- Detection: Check for absolute path prefixes

**UNC Paths (Windows)**

- Pattern: `\\server\share\file` or `//server/share/file`
- Example: `\\WORKSTATION\C$\Users\Admin\file.txt`
- Risk: Writes to network locations
- Detection: Check for UNC path prefixes (`\\` or `//`)

**Drive Letter References (Windows)**

- Pattern: `C:`, `D:`, etc. anywhere in path
- Example: `files/C:/Windows/file.txt`
- Risk: References alternate drive letters
- Detection: Regex matching drive letter patterns

**Null Bytes in Paths**

- Pattern: Embedded `\0` characters
- Example: `safe.txt\0.exe`
- Risk: Bypasses extension-based filtering
- Detection: Check for null byte characters in path strings

#### Normalization Process

Before analysis, paths are normalized:

1. Convert backslashes to forward slashes
2. Remove redundant slashes
3. Resolve `.` (current directory) references
4. Normalize path separators
5. Trim whitespace

### 2. Expansion Ratio Analysis (Archive Bombs)

**Risk Level**: Warning to Danger (threshold-based)

**Description**: Detects archives with extreme compression ratios that could cause resource exhaustion.

#### Compression Ratio Calculation

```
Compression Ratio = Uncompressed Size / Compressed Size
```

#### Thresholds

**Warning Level** (Ratio > 100:1)

- Uncompressed size is 100+ times larger than compressed
- Example: 1 MB archive extracting to 100+ MB
- Possible legitimate use: Highly repetitive data, sparse files
- Recommendation: Review before extraction

**Danger Level** (Ratio > 1000:1)

- Uncompressed size is 1000+ times larger than compressed
- Example: 1 MB archive extracting to 1+ GB
- High probability: Intentional resource exhaustion attack
- Recommendation: Do not extract without verification

#### Special Cases

**Nested Archive Bombs**

- Archives containing other archives with high compression
- Example: `10nested.zip` (42 KB → 4.5 PB uncompressed)
- Detection: Combined with nested archive detection

**Zero-Byte Files**

- Many zero-byte files can trigger false positives
- Mitigation: Exclude zero-byte files from ratio calculation

**Sparse Files**

- Legitimate sparse files can have extreme ratios
- Context: Less common in typical archives

### 3. Symlink and Hardlink Escape Detection

**Risk Level**: Warning to Danger

**Description**: Detects symbolic and hard links that could reference files outside the extraction directory.

#### Symbolic Links (Symlinks)

**What They Are**

- Special file types that reference other files/directories
- Supported in ZIP format via special attributes
- Can point to absolute or relative paths

**Security Risks**

- **Directory Escape**: Symlink to `/etc`, then extract `passwd` into that link
- **File Overwrite**: Symlink to important system file, then overwrite via link
- **Information Disclosure**: Link to sensitive file, archive reads and exfiltrates

**Detection Methods**

- Check Unix file attributes for symlink flag
- Check MS-DOS file attributes for reparse point
- Examine external file attributes field
- Verify link target paths

**Risk Classification**

- Danger: Absolute path targets or parent directory traversal
- Warning: Relative paths that stay within extraction directory

#### Hard Links

**What They Are**

- Multiple directory entries pointing to the same inode
- Less common in archives but possible

**Security Risks**

- Similar to symlinks but harder to detect
- Can create unexpected file relationships

**Detection Methods**

- Platform-specific detection
- Limited support in standard archive formats

### 4. Executable and Script Detection

**Risk Level**: Warning

**Description**: Identifies files that could execute code on the user's system.

#### Executable File Types

**Windows Executables**

- `.exe` - Executable program
- `.dll` - Dynamic link library
- `.com` - Command file
- `.bat` - Batch script
- `.cmd` - Command script
- `.msi` - Windows installer
- `.scr` - Screensaver (executable)

**Unix/Linux Executables**

- Files with executable permission bits set
- Shebang files (`#!/bin/bash`, `#!/usr/bin/env python`)
- `.sh` - Shell script
- `.run` - Binary installer
- No extension with executable bit

**Scripts and Interpreted Languages**

- `.ps1` - PowerShell script
- `.vbs` - Visual Basic Script
- `.js` - JavaScript (Node.js context)
- `.py` - Python script
- `.rb` - Ruby script
- `.pl` - Perl script
- `.php` - PHP script

**Macros and Documents**

- `.xlsm` - Excel with macros
- `.docm` - Word with macros
- `.pptm` - PowerPoint with macros

#### Detection Logic

1. **Extension Check**: Match against known executable extensions
2. **Permission Check**: Examine Unix file permissions for executable bits
3. **Magic Number Check**: Verify file headers (e.g., `MZ` for PE executables)
4. **Shebang Detection**: Check first bytes for `#!` in text files

#### Why This is a Warning, Not Danger

- Executable files have legitimate uses (software distribution)
- Executables don't run automatically upon extraction
- Users may intentionally be extracting software
- Context matters: `.exe` in software archive vs. `.docm` disguised as text

### 5. Nested Archive Detection

**Risk Level**: Warning

**Description**: Identifies archives within archives, which can hide malicious content or create extraction bombs.

#### Detected Archive Formats

- `.zip` - ZIP archives
- `.tar` - Tape archive
- `.gz`, `.gzip` - Gzip compressed
- `.bz2` - Bzip2 compressed
- `.xz` - XZ compressed
- `.7z` - 7-Zip archive
- `.rar` - RAR archive
- `.tar.gz`, `.tgz` - Compressed tape archive
- `.tar.bz2`, `.tbz2` - Bzip2 compressed tape archive

#### Security Concerns

**Depth Bombs**

- Archives nested multiple levels deep
- Example: `archive1.zip` → `archive2.zip` → ... → `archive100.zip`
- Risk: Recursive extraction causing resource exhaustion

**Hidden Malicious Content**

- Malware hidden in inner archives
- Bypasses superficial security scans
- Example: `documents.zip` → `data.zip` → `malware.exe`

**Compression Ratio Amplification**

- Each layer adds compression
- Combined ratio can be extreme
- Example: 1 KB → 1 MB → 1 GB → 1 TB across layers

#### Detection Methods

1. **Extension Matching**: Check for known archive extensions
2. **Magic Number Verification**: Verify file headers
   - ZIP: `PK\x03\x04`
   - GZIP: `\x1f\x8b`
   - TAR: `ustar` at offset 257
   - 7Z: `7z\xBC\xAF\x27\x1C`

### 6. Deep Directory Trees

**Risk Level**: Warning

**Description**: Detects excessively deep directory structures that could cause filesystem issues.

#### Thresholds

**Warning Level** (Depth > 50)

- Directory nesting exceeds 50 levels
- Example: `a/b/c/d/.../[50+ levels].../file.txt`

**Danger Level** (Depth > 100)

- Directory nesting exceeds 100 levels
- High probability of intentional attack

#### Security and Practical Concerns

**Filesystem Limits**

- Windows: MAX_PATH typically 260 characters
- Linux: PATH_MAX typically 4096 characters
- macOS: PATH_MAX typically 1024 characters
- Exceeding limits causes extraction failures

**Performance Issues**

- Deep traversal impacts filesystem performance
- Backup software may fail
- File indexing tools may hang

**User Experience**

- Difficult to navigate in file managers
- Command-line tools may fail
- Hard to delete or manage

**Attack Vectors**

- Resource exhaustion through metadata
- Filesystem denial of service
- Exploiting path length vulnerabilities

#### Detection Method

- Count path separator occurrences
- Track maximum depth across all files in archive
- Consider both Unix (`/`) and Windows (`\`) separators

### 7. Duplicate and Conflicting Paths

**Risk Level**: Warning to Danger

**Description**: Detects multiple entries with the same path, which can cause overwrites or exploit extraction order dependencies.

#### Types of Conflicts

**Case Sensitivity Conflicts**

- `File.txt` vs `file.txt`
- Safe on case-sensitive filesystems (Linux)
- Collision on case-insensitive filesystems (Windows, macOS)
- Result: Unpredictable which file survives

**Exact Duplicates**

- Multiple entries with identical paths
- Example: Two entries both named `config.ini`
- Result: Last one extracted wins (usually)

**Directory vs File Conflicts**

- Entry named `data` (directory)
- Entry named `data` (file)
- Result: Filesystem error or undefined behavior

#### Security Implications

**Extraction Order Attacks**

1. First entry: `index.html` (legitimate content)
2. Second entry: `index.html` (malicious content)
3. User reviews legitimate content, extracts archive
4. Malicious content overwrites legitimate content
5. User unknowingly uses malicious file

**Case Sensitivity Exploits**

- Attacker knows target OS
- Creates case variations to confuse users
- Example: `README.txt` (safe) and `readme.txt` (malicious)

**Time-of-Check-to-Time-of-Use (TOCTOU)**

- User checks first entry
- Extraction uses second entry
- Race condition exploitation

#### Detection Methods

1. **Path Normalization**: Convert all paths to lowercase for comparison
2. **Duplicate Tracking**: Maintain set of seen paths
3. **Collision Detection**: Flag any duplicate or case-variant paths
4. **Directory vs File Check**: Track both files and directories separately

## Risk Assessment Algorithm

### Overall Risk Determination

The final risk level for an archive is determined by:

```
Final Risk = MAX(all individual check risk levels)
```

If any check returns "Danger", the entire archive is classified as "Danger".

### Risk Aggregation

Multiple warnings can elevate overall risk:

- 1 Warning: Overall Warning
- 3+ Warnings: Consider Danger (implementation dependent)
- Any Danger: Overall Danger

### User Presentation

Results are presented to users showing:

1. Overall risk level (Safe/Warning/Danger)
2. List of all detected issues
3. Specific details for each issue
4. Affected files/paths
5. Recommendations

## Testing and Validation

### Test Coverage

Security checks should be validated against:

- Known malicious archives (e.g., evilarc, zip slip samples)
- Legitimate archives that trigger false positives
- Edge cases (empty archives, single files, etc.)
- Platform-specific behavior (Windows vs Unix paths)

### False Positive Handling

Some legitimate archives may trigger warnings:

- Software distributions (executables expected)
- Development tools (scripts expected)
- Sparse file backups (high compression ratios)
- Deep source trees (legitimate deep nesting)

Users should be given enough context to distinguish legitimate from malicious.

## Limitations

### What We Can Detect

- Structural anomalies in archives
- Suspicious patterns and metadata
- Known attack patterns

### What We Cannot Detect

- Malware in extracted files
- Sophisticated obfuscation
- Zero-day exploitation techniques
- Social engineering attacks

### Complementary Security Measures

ZipKit's analysis should be combined with:

- Antivirus scanning of extracted contents
- Verification of archive sources
- User security awareness
- System-level security controls

## Conclusion

ZipKit's risk analysis provides a comprehensive first line of defense against common archive-based attacks. By detecting dangerous patterns before extraction and clearly communicating risks to users, we enable informed decision-making while maintaining transparency about the extension's capabilities and limitations.
