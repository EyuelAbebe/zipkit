# ZipKit v0.1.0 - Release Notes
## Chrome Web Store Submission

**Release Date**: September 10, 2026
**Version**: 0.1.0
**Type**: Initial Public Release

---

## 🎉 What's New in v0.1.0

### Core Features

✨ **Archive Creation**
• Create ZIP, TAR, and TAR.GZ archives from selected files
• Drag and drop interface for easy file selection
• Real-time preview of archive contents
• Multiple format support with automatic compression

🔓 **Archive Extraction**
• Extract ZIP, TAR, TAR.GZ, and GZIP files
• Automatic format detection
• One-click extraction to Downloads folder
• Visual file tree preview before extraction

🛡️ **Security Scanning**
• Built-in malware detection engine
• Path traversal protection prevents directory attacks
• Zip bomb detection blocks compression attacks
• Security badges show scan results (Safe/Warning/Danger)

### User Interface

🎨 **Modern Design**
• Clean, intuitive interface
• Dual-mode layout (Open/Create)
• Scrollable file lists with sticky action buttons
• Dynamic destination preview
• Real-time file count and size display

📊 **History Tracking**
• Keep track of extracted archives
• View extraction locations
• Quick access to previous operations

### Technical Highlights

⚙️ **Built with Modern Standards**
• TypeScript strict mode for reliability
• Comprehensive error handling
• Chrome Manifest V3 compliance
• Memory-efficient processing
• Fast, responsive operations

🔐 **Privacy & Security**
• No data collection or tracking
• All processing happens locally
• Minimal required permissions
• Open source codebase
• Regular security updates

---

## 📦 Installation

1. Download from Chrome Web Store
2. Click "Add to Chrome"
3. Grant required permissions
4. Click the ZipKit icon to start

---

## 🚀 Getting Started

### Creating an Archive
1. Click the ZipKit icon
2. Switch to "Create Archive" tab
3. Click "Select Files" or drag files
4. Choose your format (ZIP, TAR, or TAR.GZ)
5. Click "Create Archive"
6. File saves to your Downloads folder

### Extracting an Archive
1. Click the ZipKit icon
2. Click "Open Archive"
3. Select your archive file
4. Review security scan results
5. Click "Extract All"
6. Files extract to Downloads folder

---

## 🛡️ Security Features Explained

### What We Check

**Path Traversal Protection**
Prevents malicious archives from writing files outside safe directories. Blocks "../" and absolute paths.

**Zip Bomb Detection**
Identifies archives designed to crash your system by expanding to massive sizes. Checks compression ratios.

**Malicious Pattern Detection**
Scans file names and content for known malware signatures and suspicious patterns.

### Security Badges

• **🟢 Safe**: All security checks passed
• **🟡 Warning**: Potential issues detected, review before extracting
• **🔴 Danger**: Serious security threat detected, extraction blocked

---

## 🎯 Use Cases

### Personal Use
- Compress photos and documents for email
- Extract downloaded software archives
- Organize files for backup
- Create compressed folders for storage

### Professional Use
- Package project files for sharing
- Extract client deliverables safely
- Compress reports and presentations
- Secure file handling for sensitive data

### Developer Use
- Quick archive operations in workflow
- Safe extraction of third-party libraries
- Create deployment packages
- Test archive security

---

## 📊 Supported Formats

### Full Support
- **ZIP**: Most common format, widely compatible
- **TAR**: Unix/Linux standard, preserves permissions
- **TAR.GZ**: Compressed TAR archives
- **GZIP**: Single file compression

### Coming Soon
- 7z (high compression)
- RAR (universal format)
- Encrypted archives (password protection)
- Split archives (multi-part)

---

## 🔧 Technical Specifications

**Manifest Version**: V3
**Minimum Chrome Version**: 88+
**Architecture**: Modular TypeScript
**Processing**: Browser-native APIs
**Storage**: Local IndexedDB
**Network**: No external connections

---

## 📱 Permissions Explained

### Why We Need Them

**Storage** 📦
- Save your preferences and settings
- Store extraction history locally
- Remember your last used format

**Downloads** ⬇️
- Save extracted files to Downloads
- Create archives in Downloads folder
- No other file system access

**ActiveTab** 📄
- Access current page files for archiving
- Only when you explicitly select files
- No automatic data collection

---

## 🐛 Known Limitations

### Current Version
- Custom extraction directories not yet supported
- Limited compression level options
- Some advanced archive features pending

### Workarounds
- Files extract to Downloads by default
- Use system file manager to move files
- Default compression levels work for most use cases

### Coming in Future Updates
- File System Access API integration
- Custom extraction locations
- Advanced compression settings
- More archive format support

---

## 💡 Tips & Tricks

### Best Practices
1. **Always check security badges** before extracting unknown archives
2. **Review file tree** to see what's inside before extraction
3. **Use appropriate formats**: ZIP for sharing, TAR.GZ for backups
4. **Check history** to find previously extracted files

### Performance
- Larger files may take a few seconds to process
- Progress indicators show real-time status
- Cancel operations anytime if needed

### Security
- Never extract archives from untrusted sources without reviewing
- Pay attention to security warnings
- Report suspicious files to us via GitHub

---

## 🆘 Troubleshooting

### Common Issues

**"Permission Denied" Error**
→ Grant Downloads permission in chrome://extensions/

**Archive Won't Open**
→ Verify file format is supported (ZIP, TAR, TAR.GZ, GZIP)

**Security Warning Won't Clear**
→ Some files may trigger false positives, review carefully before proceeding

**Extraction Seems Slow**
→ Large archives take time, check progress indicator

### Getting Help
- Check our GitHub Issues
- Read documentation
- Submit bug reports with details

---

## 🔄 Update Policy

### What to Expect
- Regular security updates
- New features based on feedback
- Bug fixes within 48 hours of discovery
- Major updates every 2-3 months

### How to Update
Chrome updates extensions automatically. You'll always have the latest version.

---

## 🌟 Feedback Welcome!

We're continuously improving ZipKit based on your feedback.

**Rate Us**: Leave a review on Chrome Web Store
**Report Bugs**: GitHub Issues
**Request Features**: GitHub Discussions
**Contribute**: Fork on GitHub

---

## 📜 License & Legal

**License**: MIT Open Source
**Privacy**: No data collected
**Code**: Available on GitHub
**Support**: Community-driven

---

## 🎊 Thank You!

Thank you for choosing ZipKit! We're committed to providing a secure, user-friendly archive management experience.

**The ZipKit Team**

---

*Version 0.1.0 • September 2026 • Made with ❤️ for the Chrome community*
