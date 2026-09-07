# System Architecture

## Overview

ZipKit is a Chrome extension that provides local-first archive creation, extraction, and inspection capabilities. The system is designed around privacy, security, and performance principles with no remote server dependencies.

## Architectural Principles

### Local-First Design

- All archive processing occurs in the browser
- No remote servers or cloud dependencies
- User data never leaves the local machine
- Works offline

### Performance-First

- Web Workers for CPU-intensive operations
- Streaming architecture for large files
- Bounded memory usage
- Cancellable long-running operations

### Security-First

- Minimal Chrome extension permissions
- All archive input treated as untrusted
- Structural safety analysis before extraction
- Clear user warnings for risky operations

## High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Popup     │  │  Workspace   │  │    Background    │  │
│  │  (Quick UI)  │  │   (Tab UI)   │  │     Service      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐                  ┌─────────────────┐
│   UI Components   │                  │  Core Packages  │
│   (@zipkit/ui)    │                  │                 │
└───────────────────┘                  │  ┌────────────┐ │
                                       │  │ archive-   │ │
┌───────────────────┐                  │  │   core     │ │
│  Shared Utilities │                  │  └─────┬──────┘ │
│  (@zipkit/shared) │                  │        │        │
└───────────────────┘                  │  ┌─────┴──────┐ │
                                       │  │ archive-   │ │
                                       │  │ security   │ │
                                       │  └────────────┘ │
                                       └─────────────────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ▼                       ▼                       ▼
                 ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
                 │  Web Worker  │      │  Web Worker  │      │  Web Worker  │
                 │   (ZIP)      │      │   (TAR)      │      │  (GZIP)      │
                 └──────────────┘      └──────────────┘      └──────────────┘
                        │                       │                       │
                        └───────────────────────┴───────────────────────┘
                                                │
                                                ▼
                                    ┌────────────────────────┐
                                    │  File System Access    │
                                    │     Browser API        │
                                    └────────────────────────┘
```

## Package Structure

### Workspace Organization

```
zipkit/
├── apps/
│   ├── extension/          # Chrome extension application
│   └── website/            # Marketing/documentation website
└── packages/
    ├── archive-core/       # Archive format adapters and processing
    ├── archive-security/   # Safety scanning and validation
    ├── shared/             # Common utilities and types
    └── ui/                 # Reusable UI components
```

### Package Dependencies

```
extension → ui → shared
         ↘ archive-core → shared
         ↘ archive-security → archive-core → shared
```

### Package Responsibilities

**@zipkit/archive-core**

- Archive format detection
- Format-specific adapters (ZIP, TAR, GZIP)
- Streaming read/write operations
- Entry enumeration and metadata
- Progress tracking
- Cancellation handling

**@zipkit/archive-security**

- Path traversal detection
- Expansion ratio analysis
- Executable file detection
- Nested archive detection
- Symlink/hardlink analysis
- Risk assessment and reporting

**@zipkit/shared**

- Common TypeScript types
- Utility functions
- Constants and configuration
- Error definitions
- Validation helpers

**@zipkit/ui**

- React components
- File browser UI
- Progress indicators
- Warning displays
- Form controls
- Theme and styling

## Browser APIs Used

### File System Access API

- Select files for archiving
- Choose extraction destination
- Read archive files
- Write extracted files
- Directory creation

### Web Workers API

- Offload CPU-intensive archive processing
- Maintain UI responsiveness
- Parallel format processing
- Structured message passing

### Streams API

- Process large archives incrementally
- Bounded memory usage
- Backpressure handling
- Transform streams for compression/decompression

### Chrome Extension APIs (Minimal Set)

- `storage.local` — Persist user preferences
- `tabs` — Open workspace in new tab
- No host permissions required
- No content script injection

## Data Flow Architecture

### Archive Inspection Flow

```
User selects archive
      │
      ▼
Extension reads file handle
      │
      ▼
Spawn Web Worker for format
      │
      ▼
Worker streams archive headers
      │
      ▼
Extract entry metadata
      │
      ▼
Run safety analysis (archive-security)
      │
      ▼
Stream results to UI
      │
      ▼
Display file tree + warnings
```

### Archive Extraction Flow

```
User selects entries + destination
      │
      ▼
Confirm safety warnings
      │
      ▼
Pass selection to Web Worker
      │
      ▼
Worker streams selected entries
      │
      ▼
Decompress + validate paths
      │
      ▼
Write to destination directory
      │
      ▼
Report progress to UI
      │
      ▼
Complete with summary
```

### Archive Creation Flow

```
User selects files + folders
      │
      ▼
Choose format and options
      │
      ▼
Spawn Web Worker for format
      │
      ▼
Worker reads file handles
      │
      ▼
Compress + write archive stream
      │
      ▼
Report progress to UI
      │
      ▼
Save archive to destination
```

## Worker Architecture

### Worker Communication Pattern

```
Main Thread                          Web Worker
     │                                    │
     │─────── spawn worker ──────────────>│
     │                                    │
     │────── postMessage(command) ───────>│
     │                                    │
     │                                    │ Process
     │                                    │
     │<───── postMessage(progress) ───────│
     │                                    │
     │<───── postMessage(progress) ───────│
     │                                    │
     │                                    │ Complete
     │                                    │
     │<───── postMessage(result) ─────────│
     │                                    │
     │─────── terminate ─────────────────>│
```

### Worker Lifecycle

1. **Spawn** — Create worker when operation starts
2. **Initialize** — Pass configuration and file handles
3. **Execute** — Worker processes with progress updates
4. **Stream** — Progressive results via postMessage
5. **Terminate** — Clean up when complete or cancelled

### Worker Benefits

- UI remains responsive during long operations
- CPU-intensive compression off main thread
- Parallel processing of different formats
- Isolation from extension context
- Easy cancellation model

## Memory Management

### Streaming Strategy

- Never load entire archive into memory
- Process archives in chunks (configurable, e.g., 64KB)
- Use TransformStream for compression/decompression
- Backpressure prevents memory overflow
- Bounded buffer sizes

### Large File Handling

- Entry-by-entry processing
- On-demand decompression
- Incremental reading from disk
- Progress tracking without full scan
- Selective extraction without full parse

## Extension Boundaries

### No Content Scripts

- Extension doesn't inject into web pages
- Reduces attack surface
- Simplifies security model
- No host permissions needed

### No Network Access

- No remote API calls
- No telemetry or analytics
- No update checks beyond Chrome Web Store
- Complete offline functionality

### Minimal Permissions

- Only request permissions actually needed
- No broad host permissions
- No cross-origin requests
- User controls all file access

## State Management

### Extension State

- User preferences in `chrome.storage.local`
- Recent archives list
- Default extraction paths
- Safety warning preferences

### Operation State

- Active operations tracked in memory
- Progress state in worker
- Cancellation tokens
- No persistent operation state

### UI State

- React component state
- No global store for MVP
- Props-based communication
- Event-driven updates

## Error Handling Strategy

### Archive Processing Errors

- Graceful degradation
- Partial extraction support
- Clear error messages to user
- No silent failures

### Worker Errors

- Caught and reported to main thread
- Worker termination on unrecoverable error
- Operation can be retried
- User informed of failure reason

### File System Errors

- Permission denied
- Out of disk space
- Invalid paths
- User-friendly error messages

## Security Boundaries

### Trust Boundaries

```
Trusted:
- Extension code
- UI components
- User preferences

Untrusted:
- Archive file contents
- Archive entry paths
- Archive metadata
- Decompressed data

Security Checks:
- Path validation before writing
- Expansion ratio monitoring
- Executable detection
- Symlink validation
```

### Isolation

- Web Workers provide process isolation
- No eval() or dynamic code execution
- No innerHTML in UI components
- CSP enforced by manifest

## Performance Characteristics

### Target Performance

- Inspect 100MB archive: < 5 seconds
- Extract 100MB archive: < 30 seconds
- Create 100MB archive: < 30 seconds
- UI remains responsive throughout
- Memory usage bounded to < 500MB

### Optimization Points

- Streaming prevents memory bloat
- Web Workers prevent UI blocking
- Incremental rendering of file lists
- Virtual scrolling for large archives
- Lazy loading of entry details

## Future Extension Points

### Additional Formats

- Add new format adapter implementing common interface
- Register adapter with archive-core
- Add worker for format
- No UI changes required

### Advanced Safety Features

- Extend archive-security package
- Add new analyzers
- Compose with existing checks
- New warning types in UI

### Cloud Integration (Non-MVP)

- Optional package for cloud providers
- Extension maintains local-first core
- User opt-in required
- Separate permission request
