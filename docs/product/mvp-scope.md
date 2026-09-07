# MVP Scope

## In Scope for MVP

### Formats

- ✅ ZIP (create, extract, inspect)
- ✅ TAR (create, extract, inspect)
- ✅ TAR.GZ / TGZ (create, extract, inspect)
- ✅ GZIP (compress, decompress single files)

### Core Functionality

- ✅ Create archives from local files
- ✅ Extract archives to local filesystem
- ✅ Inspect archive contents before extraction
- ✅ Selective extraction (choose specific files)
- ✅ Progress reporting
- ✅ Operation cancellation

### Safety Features

- ✅ Path traversal detection
- ✅ Expansion ratio analysis
- ✅ Executable file detection
- ✅ Nested archive detection
- ✅ User warnings before risky extraction

### User Interface

- ✅ Extension popup (quick access)
- ✅ Browser tab workspace (full features)
- ✅ File selection dialogs
- ✅ Archive file browser
- ✅ Safety warnings

### Architecture

- ✅ Chrome Manifest V3
- ✅ Web Workers for processing
- ✅ Streaming for large files
- ✅ Local-first (no remote servers)
- ✅ Minimal extension permissions

## Out of Scope for MVP

### Formats

- ❌ RAR
- ❌ 7z
- ❌ XZ
- ❌ Zstandard
- ❌ BZIP2

### Advanced Features

- ❌ Password-protected archives (decryption)
- ❌ Archive repair
- ❌ Archive conversion between formats
- ❌ Multi-volume archives
- ❌ Split archives
- ❌ Encrypted archive creation

### Cloud / Remote

- ❌ Cloud storage integration
- ❌ Remote archive processing
- ❌ Archive sharing service
- ❌ Accounts / authentication
- ❌ Synchronization

### Advanced Safety

- ❌ Malware signature scanning
- ❌ Antivirus integration
- ❌ Behavioral analysis
- ❌ Sandbox execution

### Other

- ❌ Native desktop application
- ❌ Command-line interface
- ❌ API for other tools
- ❌ Browser download interception (deferred to Phase 9)

## MVP Acceptance Criteria

An MVP release requires:

- ✅ All in-scope formats working
- ✅ Core safety features functional
- ✅ E2E tests passing
- ✅ Extension loads in Chrome
- ✅ Documentation complete
- ✅ No critical security issues
- ✅ Privacy preserved (local-only processing)
- ✅ Minimal permissions requested
