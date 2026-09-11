# Changelog

All notable changes to ZipKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-09-10

### 🎉 Initial MVP Release

ZipKit v0.1.0 is the first public release of our Chrome extension for managing archive files with enhanced security and ease of use.

### ✨ Features Added

#### Core Functionality
- **Archive Creation**: Create ZIP, TAR, TAR.GZ, and other archive formats directly from selected files
- **Archive Extraction**: Extract archives with automatic format detection and security scanning
- **Multi-Format Support**: Support for ZIP, TAR, TAR.GZ, and GZIP formats
- **Security Scanning**: Built-in malware detection, path traversal protection, and zip bomb prevention

#### User Interface
- **Dual Mode Interface**: Separate views for opening/extracting and creating archives
- **File Tree Visualization**: Hierarchical view of archive contents with folder structure
- **Scrollable File Lists**: Enhanced UX with scrollable file selection and sticky action buttons
- **Dynamic Destination Display**: Real-time preview of archive save location
- **History Tracking**: Keep track of extracted archives and their locations
- **Security Badges**: Visual indicators for security scan results (safe, warning, danger)

#### Developer Experience
- **TypeScript Strict Mode**: Full type safety across the entire codebase
- **Automated CI/CD Pipeline**: GitHub Actions for testing, building, and releasing
- **Pre-commit Hooks**: Automatic code formatting and linting before commits
- **E2E Testing**: Playwright-based end-to-end tests for Chrome extension
- **Monorepo Structure**: Clean npm workspaces architecture with isolated packages

### 🔧 Technical Improvements

- Dynamic version management from package.json (no hardcoded versions)
- TypeScript paths mapping for proper workspace package resolution
- Unified build system with dependency-aware compilation
- Chrome Downloads API integration for better file handling
- Comprehensive error handling and user feedback

### 🛡️ Security

- Path traversal validation for all extracted files
- Archive bomb detection (compression ratio limits)
- Malicious file pattern detection
- Secure file handling with permission checks

### 📦 Build & Deployment

- Automated extension packaging with checksums
- GitHub release automation with artifact uploads
- Branch protection rules with required status checks
- Semantic versioning with conventional commits

### 🐛 Known Issues

- File System Access API not yet implemented for custom save locations
- Limited compression options (future enhancement)
- Some archive formats not yet supported (7z, RAR - planned for future releases)

---

## [Unreleased]

### Planned Features

- Custom extraction directories with File System Access API
- Advanced compression options and levels
- Support for encrypted archives
- Batch archive operations
- Archive file preview without extraction

---

## Release Template (for future releases)

<!--
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features and capabilities

### Changed
- Changes to existing functionality

### Deprecated
- Features marked for removal

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security-related changes and fixes
-->

---

## Version History

- **Unreleased** — Current pre-MVP development phase

---

**Note:** This changelog will be updated with each release. Version 0.1.0 will be the first MVP release.
