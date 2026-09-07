# Chrome Extension Architecture

## Overview

ZipKit is built as a Chrome Manifest V3 extension with a focus on minimal permissions, local-first operation, and modern browser capabilities. The extension provides both a lightweight popup interface for quick actions and a full-featured workspace in a dedicated browser tab.

## Manifest V3 Design

### Why Manifest V3

- Required for new Chrome Web Store submissions
- Service worker model (no persistent background page)
- Enhanced security model
- Better resource management
- Future-proof for browser evolution

### Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "ZipKit",
  "version": "0.1.0",
  "description": "Zip. Unzip. Pack. Unpack. Inspect. Scan.",

  "permissions": [
    "storage"
  ],

  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },

  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none';"
  }
}
```

### Permissions Strategy

**Requested Permissions:**
- `storage` — Save user preferences locally

**NOT Requested:**
- No host permissions
- No content script injection
- No network access
- No tabs permission
- No downloads permission

**File Access:**
- Via File System Access API (user-initiated)
- No permission required
- User explicitly grants access per operation
- No persistent file access

## Extension Components

```
┌─────────────────────────────────────────────────────┐
│                  Chrome Extension                    │
│                                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌────────┐ │
│  │   Popup     │    │  Background  │    │ Icons  │ │
│  │   (HTML)    │    │   Service    │    │ Assets │ │
│  │             │    │   Worker     │    │        │ │
│  └──────┬──────┘    └──────┬───────┘    └────────┘ │
│         │                  │                        │
│         │                  │                        │
│  ┌──────▼──────────────────▼───────┐               │
│  │       Workspace Tab              │               │
│  │     (Full Application)           │               │
│  │                                  │               │
│  │  ┌──────────────────────────┐   │               │
│  │  │   React Application      │   │               │
│  │  │   - File Browser         │   │               │
│  │  │   - Inspection View      │   │               │
│  │  │   - Extraction Wizard    │   │               │
│  │  │   - Creation Wizard      │   │               │
│  │  │   - Safety Reports       │   │               │
│  │  └──────────────────────────┘   │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

## Popup Interface

### Purpose

Quick access to common actions:
- Open workspace
- Quick inspect
- Quick extract
- Quick create
- Recent archives
- Settings

### Design Constraints

- Small window (typically 400x600px)
- Should load quickly (< 100ms)
- Minimal dependencies
- No complex state
- Launch point for full workspace

### Popup Architecture

```
popup.html (Entry Point)
    │
    ├── popup.js (Minimal JS)
    │   ├── Open workspace tab
    │   ├── Quick file picker
    │   ├── Recent archives list
    │   └── Settings link
    │
    └── popup.css (Lightweight styles)
```

### Popup Actions

**Open Workspace:**
- `chrome.tabs.create({ url: 'workspace/index.html' })`
- Pass context via URL params or storage

**Quick Inspect:**
- File picker → Open workspace with file
- Workspace handles full inspection

**Recent Archives:**
- Read from `chrome.storage.local`
- Click to reopen in workspace

**Settings:**
- Link to settings page or workspace settings tab

## Workspace Tab

### Purpose

Full-featured application for:
- Archive inspection
- File browsing
- Extraction with options
- Archive creation
- Safety analysis
- Operation progress
- Settings management

### Workspace Architecture

```
workspace/
├── index.html              # Entry point
├── index.tsx               # React root
├── App.tsx                 # Main application
├── components/
│   ├── FileBrowser/        # Archive content browser
│   ├── Inspector/          # Archive inspection view
│   ├── Extractor/          # Extraction wizard
│   ├── Creator/            # Creation wizard
│   ├── SafetyReport/       # Security analysis display
│   ├── ProgressView/       # Operation progress
│   └── Settings/           # User preferences
├── hooks/
│   ├── useArchive.ts       # Archive operations
│   ├── useFileSystem.ts    # File System Access API
│   ├── useWorker.ts        # Web Worker management
│   └── useProgress.ts      # Progress tracking
└── workers/
    ├── zip-worker.ts       # ZIP processing
    ├── tar-worker.ts       # TAR processing
    └── gzip-worker.ts      # GZIP processing
```

### Workspace Routing

```typescript
type Route =
  | { view: 'home' }
  | { view: 'inspect'; fileHandle: FileSystemFileHandle }
  | { view: 'extract'; fileHandle: FileSystemFileHandle; selection?: string[] }
  | { view: 'create' }
  | { view: 'settings' };
```

**Navigation:**
- Hash-based routing (e.g., `#/inspect`)
- State passed via React context
- Browser back/forward support
- Deep linking support

### Workspace State

```typescript
interface WorkspaceState {
  // Current operation
  currentOperation?: Operation;

  // Current archive
  currentArchive?: {
    fileHandle: FileSystemFileHandle;
    format: ArchiveFormat;
    entries: ArchiveEntry[];
    analysis: SafetyAnalysis;
  };

  // UI state
  selectedEntries: Set<string>;
  expandedPaths: Set<string>;
  searchQuery: string;

  // Preferences
  preferences: UserPreferences;
}
```

## Background Service Worker

### Purpose

Minimal background logic:
- Handle extension installation
- Initialize default settings
- Coordinate workspace tabs (if needed)
- No persistent processing

### Service Worker Lifecycle

```typescript
// Install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default preferences
    chrome.storage.local.set({ preferences: defaultPreferences });
  }
});

// No persistent event handlers needed for MVP
```

### Service Worker Constraints

- No persistent state (worker can be killed anytime)
- Must complete quickly or use long-lived ports
- Limited API access compared to background pages
- No DOM access

### MVP Service Worker

For MVP, the service worker is minimal:
- Set defaults on install
- No active processing
- Processing happens in workspace workers

## File System Integration

### File System Access API

ZipKit uses the modern File System Access API for all file operations.

### File Picker Flow

```typescript
// Select archive to inspect
async function selectArchive(): Promise<FileSystemFileHandle> {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Archive Files',
        accept: {
          'application/zip': ['.zip'],
          'application/x-tar': ['.tar'],
          'application/gzip': ['.gz', '.tgz'],
        },
      },
    ],
    multiple: false,
  });

  return fileHandle;
}

// Select extraction destination
async function selectDestination(): Promise<FileSystemDirectoryHandle> {
  return await window.showDirectoryPicker({
    mode: 'readwrite',
  });
}

// Select files to archive
async function selectSources(): Promise<FileSystemHandle[]> {
  return await window.showOpenFilePicker({
    multiple: true,
  });
}
```

### Permission Model

- User explicitly chooses files/directories
- Permission granted per operation
- No persistent access (for MVP)
- Can request permission again if needed

### Benefits

- No Chrome permission required
- User controls all access
- Clear security model
- Works with local filesystem
- No origin restrictions

## Communication Patterns

### Popup ↔ Workspace

```
Popup                          Workspace Tab
  │                                  │
  │── chrome.tabs.create() ─────────>│
  │                                  │
  │── storage.local.set(context) ───>│
  │                                  │
  │                                  │─ Read context
  │                                  │─ Initialize with file
```

### Workspace ↔ Worker

```
Workspace                         Worker
    │                               │
    │── new Worker() ───────────────>│
    │                               │
    │── postMessage(command) ───────>│
    │                               │
    │<─ postMessage(progress) ───────│
    │<─ postMessage(entry) ──────────│
    │<─ postMessage(complete) ───────│
    │                               │
    │── terminate() ─────────────────>│
```

### Storage Communication

```typescript
// Save preferences
await chrome.storage.local.set({ preferences });

// Load preferences
const { preferences } = await chrome.storage.local.get('preferences');

// Listen to changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.preferences) {
    updatePreferences(changes.preferences.newValue);
  }
});
```

## Storage Strategy

### chrome.storage.local

**Stored Data:**
- User preferences
- Recent archives list (paths/names only, not handles)
- Default extraction path (path only)
- Safety warning acknowledgments
- UI state preferences

**Not Stored:**
- File handles (can't be serialized)
- Archive contents
- Operation state
- Temporary data

**Limits:**
- 10MB total storage (extension quota)
- Sufficient for preferences
- Clear old entries if needed

### Storage Schema

```typescript
interface StorageSchema {
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultFormat: ArchiveFormat;
    compressionLevel: number;
    showHiddenFiles: boolean;
    confirmOverwrite: boolean;
    safetyWarnings: {
      pathTraversal: boolean;
      expansion: boolean;
      executables: boolean;
    };
  };

  recentArchives: Array<{
    name: string;
    format: ArchiveFormat;
    lastOpened: number;
    size: number;
  }>;

  version: string;
}
```

## Security Model

### Content Security Policy

```
script-src 'self';
object-src 'none';
```

**Implications:**
- No inline scripts
- No eval()
- No external scripts
- All code bundled with extension
- Web Workers must be same-origin

### No Content Scripts

- Extension doesn't inject into pages
- Reduces attack surface
- Simplifies security review
- No host permissions needed

### Isolated Execution

- Extension pages in isolated context
- Workers further isolated
- No access to web page DOM
- No cross-origin requests

### User Trust

- All file access user-initiated
- Clear permission prompts
- No background uploads
- No telemetry
- Open source (trustable)

## Build and Packaging

### Build Process

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Watch mode
npm run build:watch
```

### Build Output

```
dist/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── workspace/
│   ├── index.html
│   ├── index.js
│   └── index.css
├── background/
│   └── service-worker.js
└── workers/
    ├── zip-worker.js
    ├── tar-worker.js
    └── gzip-worker.js
```

### Bundle Strategy

- Separate bundles for each context
- Shared code in separate chunk
- Tree-shaking for production
- Minification for production
- Source maps for development

### Extension Packaging

```bash
# Create extension package
npm run package

# Output: zipkit-v0.1.0.zip
```

## Development Workflow

### Local Testing

```bash
# Build extension
npm run build:dev

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select dist/ directory
```

### Hot Reload

- Watch mode rebuilds on changes
- Manual reload required in Chrome
- Extension reload reloads all pages
- Workers reload with extension

### Debugging

**Popup:**
- Right-click popup → Inspect
- DevTools for popup context

**Workspace:**
- Standard DevTools (F12)
- React DevTools extension

**Service Worker:**
- chrome://extensions/ → Inspect background page
- Service Worker DevTools

**Workers:**
- Chrome DevTools → Sources → Threads
- Console logs appear in worker context

## Extension Distribution

### MVP Distribution

- Manual download from GitHub Releases
- Users install via "Load unpacked"
- Or drag-and-drop ZIP to extensions page
- Developer mode required

### Chrome Web Store (Post-MVP)

1. Register developer account
2. Pay one-time fee ($5)
3. Upload extension package
4. Fill store listing
5. Submit for review
6. Address review feedback
7. Publish

### Update Mechanism

**MVP:**
- Manual updates (download new version)
- No automatic updates

**Chrome Web Store:**
- Automatic updates via Chrome
- Update check frequency controlled by Chrome
- Silent updates (user doesn't need to act)

## Performance Considerations

### Load Time

- Popup: < 100ms
- Workspace: < 500ms
- Service worker: < 100ms
- Workers: < 200ms

### Resource Usage

- Memory: < 500MB during operations
- CPU: Intensive work in workers
- Storage: < 10MB for preferences
- Network: None (local-first)

### Optimization

- Lazy load workspace components
- Virtual scrolling for large file lists
- Debounce search/filter
- Minimize popup dependencies
- Preload critical assets

## Extension Lifecycle

### Installation

1. User installs extension
2. Service worker initializes
3. Default preferences set
4. Icon appears in toolbar

### First Use

1. User clicks extension icon
2. Popup opens
3. User opens workspace
4. Workspace prompts for first action

### Regular Use

1. Click icon or use keyboard shortcut
2. Quick actions from popup
3. Or open workspace for full features

### Uninstallation

1. User removes extension
2. Chrome clears storage
3. No persistent data left
4. No cleanup needed

## Extension Updates

### Update Process

1. New version built
2. Manifest version incremented
3. Extension packaged
4. Uploaded to distribution channel
5. Users receive update

### Migration

```typescript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    migrateStorage(previousVersion);
  }
});

async function migrateStorage(fromVersion: string) {
  // Handle breaking changes
  // Migrate storage schema
  // Preserve user preferences
}
```

## Testing Strategy

### Extension Testing

- Load extension in test Chrome profile
- Automated testing with Puppeteer
- E2E tests simulate user interactions
- Test all permission flows

### Workspace Testing

- Unit tests for React components
- Integration tests for workflows
- Manual testing in browser
- Cross-browser testing (Chrome variants)

### Worker Testing

- Test message protocol
- Test with mock workers
- Test with real workers
- Performance benchmarks

## Future Enhancements

### Context Menus

```json
{
  "permissions": ["contextMenus"],
  "background": {
    "service_worker": "background/service-worker.js"
  }
}
```

- Right-click archive → Inspect
- Right-click files → Create archive
- Browser context integration

### Keyboard Shortcuts

```json
{
  "commands": {
    "open-workspace": {
      "suggested_key": {
        "default": "Ctrl+Shift+Z"
      },
      "description": "Open ZipKit workspace"
    }
  }
}
```

### Download Integration

- Intercept archive downloads
- Offer inspection before save
- Automatic safety scanning
- Requires `downloads` permission

### Omnibox Integration

```json
{
  "omnibox": {
    "keyword": "zip"
  }
}
```

- Type "zip" in address bar
- Quick archive operations
- Search recent archives
