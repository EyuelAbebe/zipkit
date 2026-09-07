# ZipKit

**Zip. Unzip. Pack. Unpack. Inspect. Scan.**

A modern Chrome extension for creating, inspecting, and extracting archive files with built-in safety analysis.

---

## ⚠️ Project Status

**ZipKit is currently in pre-MVP development.**

The repository foundation, architecture, and development standards are established. Product implementation is in progress.

**Do not use this extension for production purposes yet.**

---

## What is ZipKit?

ZipKit is a Chrome extension that provides local-first archive operations with integrated safety scanning:

- **Create archives** — ZIP, TAR, TAR.GZ from your local files
- **Extract archives** — Safely extract with path validation
- **Inspect before extracting** — Browse archive contents, view metadata
- **Safety scanning** — Detect path traversal, archive bombs, executables, and other risks
- **Local-first** — All processing happens in your browser, no uploading required
- **Cross-platform** — Works on Windows, macOS, Linux, and ChromeOS

### What ZipKit Is NOT

- ❌ Not an antivirus replacement
- ❌ Not a cloud storage or file sharing service
- ❌ Not guaranteed malware detection

ZipKit provides **structural archive safety analysis**, not comprehensive malware scanning. Use it alongside your existing security tools.

---

## Features

### MVP Scope (In Development)

- ✅ ZIP support (create, extract, inspect)
- ✅ TAR support (create, extract, inspect)
- ✅ TAR.GZ / TGZ support (create, extract, inspect)
- ✅ GZIP support (compress, decompress)
- ✅ Path traversal detection
- ✅ Expansion ratio analysis (archive bomb detection)
- ✅ Executable and script detection
- ✅ Nested archive detection
- ✅ Chrome extension popup and workspace
- ✅ Progress reporting and cancellation
- ✅ Selective extraction

### Future Considerations

- RAR, 7z, XZ, Zstandard support
- Password-protected archive decryption
- Chrome download integration
- Advanced malware signature scanning (requires research)

---

## Architecture Highlights

- **Manifest V3** Chrome extension
- **Web Workers** for CPU-intensive operations
- **Streaming architecture** for large files (multi-GB support)
- **Minimal permissions** (storage only for MVP)
- **TypeScript** strict mode
- **Local-first** processing (no remote servers)

See [docs/architecture/](docs/architecture/) for detailed architecture documentation.

---

## Development

### Prerequisites

- Node.js 18+
- npm 9+
- Chrome browser

### Quick Start

```bash
# Clone repository
git clone https://github.com/eyuelabebe/zipkit.git
cd zipkit

# Install dependencies
npm install

# Run quality checks
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
```

### Load Extension in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `apps/extension/dist` directory

See [docs/development/development-setup.md](docs/development/development-setup.md) for complete setup instructions.

---

## Documentation

- **Product**: [docs/product/](docs/product/)
- **Architecture**: [docs/architecture/](docs/architecture/)
- **Security**: [docs/security/](docs/security/)
- **Development**: [docs/development/](docs/development/)
- **Testing**: [docs/testing/](docs/testing/)
- **Release**: [docs/release/](docs/release/)
- **Decisions (ADRs)**: [docs/decisions/](docs/decisions/)

### For Developers

- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [SECURITY.md](SECURITY.md) — Security policy and vulnerability reporting
- [.claude/](.claude/) — Agent operating handbook (required reading)

---

## Contributing

ZipKit follows issue-driven development. All significant work originates from GitHub issues.

### Contribution Workflow

1. Find or create a GitHub issue
2. Read linked documentation
3. Create feature branch (`feature/<issue>-<description>`)
4. Implement focused change
5. Add tests
6. Run quality checks
7. Create pull request
8. Respond to review feedback
9. Merge via approved process

See [CONTRIBUTING.md](CONTRIBUTING.md) and [.claude/WORKFLOW.md](.claude/WORKFLOW.md) for detailed guidelines.

### Important Rules

- Never work directly on `main`
- Keep changes small and focused
- Add tests for all behavioral changes
- Update documentation when behavior changes
- Follow Conventional Commits format
- No AI attribution in repository metadata

---

## Security

Security is a core principle for ZipKit.

### Reporting Vulnerabilities

**Do not report security vulnerabilities in public issues.**

See [SECURITY.md](SECURITY.md) for responsible disclosure process.

### Security Model

ZipKit provides **structural archive safety analysis**:

- Path traversal detection
- Expansion ratio analysis (archive bombs)
- Executable file detection
- Symlink/hardlink escape detection
- Nested archive detection
- Clear user warnings

See [docs/security/security-model.md](docs/security/security-model.md) for complete security architecture.

---

## Privacy

**ZipKit is local-first.**

- Archives are processed in your browser
- No remote servers in MVP
- No uploading of user data
- No tracking or analytics

Your archives are private.

---

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Chrome browser
- **Extension**: Manifest V3
- **Processing**: Web Workers
- **Archive Libraries**: TBD (evaluation in Phase 0B)
- **Testing**: Playwright for E2E
- **Build**: TBD (evaluation in Phase 0A)

---

## Roadmap

### Phase 0: Foundation (Current)

- Repository governance ✅
- Architecture documentation ✅
- Development standards ✅
- CI/CD foundation (in progress)

### Phase 1-2: Extension Shell

- Manifest V3 setup
- Popup and workspace UI
- Local file selection

### Phase 3-4: Archive Support

- ZIP implementation
- TAR/GZIP implementation

### Phase 5-6: Safety & Inspection

- Archive inspection UI
- Safety scanning engine

### Phase 7-8: UX Polish

- Creation experience
- Extraction experience

### Phase 9-10: Integration

- Download integration
- Public website

### Phase 11-12: Hardening & Release

- Cross-platform testing
- Performance optimization
- Official v0.1.0 release

See [GitHub Milestones](https://github.com/eyuelabebe/zipkit/milestones) for detailed roadmap.

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Acknowledgments

This project is built with modern web standards and focuses on user privacy and security.

---

**Status**: Pre-MVP | **License**: MIT | **Privacy**: Local-First
