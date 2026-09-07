# ZipKit Product Overview

## Identity

**Name:** ZipKit

**Tagline:** Zip. Unzip. Pack. Unpack. Inspect. Scan.

**Category:** Chrome extension / Browser-based archive utility

## Problem

Users need to create, inspect, and extract archive files, but:

- Native OS tools provide limited safety insights before extraction
- Cloud-based tools require uploading private data
- Existing tools lack archive safety analysis
- Power users want inspection before extraction
- Cross-platform archive handling is inconsistent

## Solution

ZipKit is a Chrome extension that provides:

- **Local-first archive operations** — no uploading required
- **Inspect before extract** — browse archive contents safely
- **Archive safety scanning** — detect structural risks
- **Cross-platform consistency** — works on Windows, macOS, Linux, ChromeOS
- **Modern browser integration** — works entirely in Chrome

## Key Capabilities

### Archive Creation

- Create ZIP archives
- Create TAR archives
- Create TAR.GZ archives
- Select files and folders from local filesystem
- Compression options
- Progress and cancellation

### Archive Extraction

- Extract ZIP archives
- Extract TAR archives
- Extract TAR.GZ archives
- Selective extraction (choose specific files/folders)
- Destination selection
- Progress and cancellation

### Archive Inspection

- Browse archive contents before extraction
- View file tree
- View file metadata (size, compression, timestamps)
- Search and filter entries
- Preview supported file types
- Detect archive format automatically

### Archive Safety Scanning

- **Path traversal detection** — entries attempting to escape extraction directory
- **Expansion ratio analysis** — detect potential archive bombs
- **Executable detection** — identify executables and scripts
- **Nested archive detection** — archives within archives
- **Symlink/hardlink analysis** — detect link-based escapes
- **Structural validation** — detect malformed archives
- **Clear warnings** — explain risks before extraction

### Supported Formats

**MVP:**

- ZIP
- TAR
- TAR.GZ / TGZ
- GZIP (single-file compression)

**Future consideration:**

- RAR
- 7z
- XZ
- Zstandard
- BZIP2

## User Interface

### Extension Popup

- Quick actions
- Access to workspace
- Recent archives
- Settings

### Browser Tab Workspace

Full-featured workspace for complex operations:

- Archive inspection
- File browser
- Extraction wizard
- Creation wizard
- Safety reports

## Core Principles

### Local-First

Archives are processed locally in the browser. No remote servers required.

### Privacy

User archives are private data. No uploading, tracking, or analytics.

### Safety

Structural archive safety is a differentiator. Clear warnings without false alarms.

### Honesty

ZipKit provides structural safety analysis, not antivirus protection. We're honest about capabilities and limitations.

### Cross-Platform

Consistent behavior across Windows, macOS, Linux, and ChromeOS.

### Modern Browser Architecture

- Web Workers for CPU-intensive operations
- Streaming for large files
- Cancellable operations
- Bounded memory usage

## What ZipKit Is Not

- ❌ Not an antivirus replacement
- ❌ Not a cloud storage service
- ❌ Not a file sharing platform
- ❌ Not a desktop application
- ❌ Not a command-line tool
- ❌ Not guaranteed malware detection

## Target Users

### Primary

- **Privacy-conscious users** who prefer local tools
- **Power users** who want archive inspection capabilities
- **Security-aware users** who want structural safety analysis
- **Cross-platform users** who want consistent tools

### Secondary

- Developers working with archives
- System administrators
- Security researchers
- Educators

## Differentiation

**vs. Native OS tools:**

- Inspection before extraction
- Safety scanning
- Cross-platform consistency
- Modern UI

**vs. Cloud-based tools:**

- Local-first privacy
- No upload required
- Works offline
- Faster for local files

**vs. Other extensions:**

- Archive safety focus
- Streaming large files
- Modern architecture
- Clear security model

## Success Metrics

**MVP success:**

- Extension loads correctly
- Can create basic archives
- Can extract basic archives
- Can inspect archives
- Detects path traversal
- Detects high expansion
- Privacy preserved (no remote calls)

**Post-MVP:**

- User adoption
- Safety warnings prevent incidents
- Positive user feedback
- Minimal permission requirements
- No security incidents

## Project Status

**Current:** Pre-MVP / Repository bootstrap

**Roadmap:**

1. Phase 0: Governance and foundation
2. Phase 1-2: Extension shell and core architecture
3. Phase 3-4: Archive format support
4. Phase 5-6: Inspection and safety features
5. Phase 7-8: Creation and extraction UX
6. Phase 9-10: Download integration and website
7. Phase 11-12: Hardening and release

## Distribution

**MVP:** GitHub Releases with packaged extension

**Post-MVP:** Chrome Web Store publication

**Future:** Potentially other browser extension stores (Firefox, Edge)
