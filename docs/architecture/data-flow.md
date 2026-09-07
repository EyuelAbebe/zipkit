# Data Flow Architecture

## Overview

This document describes the data flow patterns in ZipKit for core operations: archive inspection, extraction, creation, and safety scanning. All flows emphasize streaming, local processing, and user control.

## Core Flow Principles

### Streaming-First
- Data flows incrementally, never fully buffered
- Bounded memory usage regardless of archive size
- Early results displayed progressively
- Cancellable at any stage

### Local-Only
- All data flows within the browser
- No network requests
- No remote servers
- User's data never leaves their machine

### User-Initiated
- All operations start with explicit user action
- File System Access API provides security
- Clear permission boundaries
- Transparent operations

## Archive Inspection Flow

### High-Level Flow

```
User Action (Click "Inspect")
    │
    ▼
File System Access API (showOpenFilePicker)
    │
    ▼
File Handle Returned
    │
    ▼
Workspace receives file handle
    │
    ▼
Spawn format-specific Web Worker
    │
    ▼
Worker streams archive headers
    │
    ▼
Extract entry metadata (incremental)
    │
    ▼
Stream entries back to main thread
    │
    ▼
Safety analyzer processes entries
    │
    ▼
UI displays file tree progressively
    │
    ▼
Complete: Full file list + safety report
```

### Detailed Data Flow

```
┌─────────────┐
│    User     │
│  clicks     │
│  "Inspect"  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  showOpenFilePicker()           │
│  User selects archive file      │
└──────┬──────────────────────────┘
       │
       │ FileSystemFileHandle
       ▼
┌─────────────────────────────────┐
│  Workspace: detectFormat()      │
│  Read first 512 bytes           │
│  Identify: ZIP/TAR/GZIP         │
└──────┬──────────────────────────┘
       │
       │ ArchiveFormat
       ▼
┌─────────────────────────────────┐
│  Spawn Worker (format-specific) │
│  new Worker('zip-worker.js')    │
└──────┬──────────────────────────┘
       │
       │ postMessage({ type: 'inspect', fileHandle })
       ▼
┌────────────────────────────────────────────┐
│  Worker: Inspect Archive                   │
│  ┌─────────────────────────────────────┐   │
│  │ Read archive structure              │   │
│  │  └─ ZIP: Central Directory          │   │
│  │  └─ TAR: Sequential scan            │   │
│  │  └─ GZIP: Header + wrapped content  │   │
│  └────────┬────────────────────────────┘   │
│           │                                 │
│           ▼                                 │
│  ┌─────────────────────────────────────┐   │
│  │ For each entry:                     │   │
│  │  - Extract metadata                 │   │
│  │  - Path, size, timestamps           │   │
│  │  - Type (file/dir/link)             │   │
│  │  - Permissions                      │   │
│  │  - Don't decompress yet             │   │
│  └────────┬────────────────────────────┘   │
│           │                                 │
│           │ postMessage({ type: 'entry', entry })
│           ▼                                 │
└───────────┼─────────────────────────────────┘
            │
            │ ArchiveEntry (streaming)
            ▼
┌─────────────────────────────────┐
│  Main Thread: Receive Entry     │
│  ┌───────────────────────────┐  │
│  │ Safety Analysis:          │  │
│  │  - Path traversal check   │  │
│  │  - Executable detection   │  │
│  │  - Symlink validation     │  │
│  │  - Nested archive check   │  │
│  └────────┬──────────────────┘  │
│           │                     │
│           │ ArchiveEntry + Risk │
│           ▼                     │
│  ┌───────────────────────────┐  │
│  │ Update UI:                │  │
│  │  - Add to file tree       │  │
│  │  - Show in list           │  │
│  │  - Update counters        │  │
│  │  - Display warnings       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
            │
            │ (Repeat for all entries)
            ▼
┌─────────────────────────────────┐
│  Worker: postMessage({ type:   │
│  'complete', stats })           │
└──────┬──────────────────────────┘
       │
       │ OperationResult
       ▼
┌─────────────────────────────────┐
│  Main Thread:                   │
│  - Display complete file tree   │
│  - Show safety report           │
│  - Enable extraction            │
│  - Terminate worker             │
└─────────────────────────────────┘
```

### Data Structures

```typescript
// Entry metadata streamed from worker
interface ArchiveEntry {
  path: string;
  name: string;
  type: 'file' | 'directory' | 'symlink';
  compressedSize: number;
  uncompressedSize: number;
  modifiedTime?: Date;
  isExecutable?: boolean;
}

// Safety analysis result
interface SafetyRisk {
  type: 'path-traversal' | 'expansion' | 'executable' | 'nested';
  severity: 'low' | 'medium' | 'high';
  message: string;
  entry?: string;
}
```

### Performance Characteristics

- First entry visible: < 100ms
- 1000 entries listed: < 1 second
- 100,000 entries listed: < 30 seconds
- Memory usage: O(n) where n = entry count
- UI remains responsive throughout

## Archive Extraction Flow

### High-Level Flow

```
User selects entries to extract
    │
    ▼
User selects destination directory
    │
    ▼
Safety warnings displayed
    │
    ▼
User confirms extraction
    │
    ▼
Worker receives extraction command
    │
    ▼
Worker iterates selected entries
    │
    ▼
For each entry:
  - Validate path
  - Decompress data
  - Stream to destination
  - Report progress
    │
    ▼
Complete: Files written to disk
```

### Detailed Data Flow

```
┌─────────────┐
│    User     │
│  selects    │
│  entries    │
└──────┬──────┘
       │
       │ Set<entryPath>
       ▼
┌─────────────────────────────────┐
│  showDirectoryPicker()          │
│  User selects destination       │
└──────┬──────────────────────────┘
       │
       │ FileSystemDirectoryHandle
       ▼
┌─────────────────────────────────┐
│  Safety Check:                  │
│  - Analyze selected entries     │
│  - Check expansion ratio        │
│  - Detect risky patterns        │
│  - Display warnings             │
└──────┬──────────────────────────┘
       │
       │ User confirms
       ▼
┌─────────────────────────────────┐
│  postMessage({                  │
│    type: 'extract',             │
│    fileHandle,                  │
│    entries,                     │
│    destination                  │
│  })                             │
└──────┬──────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────┐
│  Worker: Extract Selected Entries              │
│                                                │
│  For each selected entry:                     │
│  ┌───────────────────────────────────────┐    │
│  │ 1. Validate destination path          │    │
│  │    - No traversal                     │    │
│  │    - No overwrite without permission  │    │
│  │    - Valid characters                 │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ 2. Locate entry in archive            │    │
│  │    - ZIP: Jump to offset              │    │
│  │    - TAR: Scan to entry               │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ 3. Create destination file/dir        │    │
│  │    destination.getFileHandle()        │    │
│  │    destination.getDirectoryHandle()   │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ 4. Stream decompression               │    │
│  │    Read compressed chunks (64KB)      │    │
│  │    Decompress incrementally           │    │
│  │    Write to destination (64KB)        │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           │ postMessage({ type: 'progress' }) │
│           ▼                                    │
└───────────┼────────────────────────────────────┘
            │
            │ ExtractionProgress (periodic)
            ▼
┌─────────────────────────────────┐
│  Main Thread: Update UI         │
│  - Current file name            │
│  - Bytes processed              │
│  - Percentage complete          │
│  - Estimated time remaining     │
│  - Files completed              │
└─────────────────────────────────┘
            │
            │ (Repeat for all entries)
            ▼
┌─────────────────────────────────┐
│  Worker: postMessage({          │
│    type: 'complete',            │
│    extractedCount,              │
│    totalBytes,                  │
│    errors                       │
│  })                             │
└──────┬──────────────────────────┘
       │
       │ OperationResult
       ▼
┌─────────────────────────────────┐
│  Main Thread:                   │
│  - Show completion message      │
│  - Display any errors           │
│  - Offer to open destination    │
│  - Terminate worker             │
└─────────────────────────────────┘
```

### Streaming Decompression Detail

```
Archive Entry (Compressed)
    │
    ▼
┌─────────────────────────────────┐
│  Read Compressed Chunk (64KB)   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Decompression Transform Stream │
│  (Deflate/GZIP/etc.)            │
└──────┬──────────────────────────┘
       │
       │ Decompressed chunk (≤128KB)
       ▼
┌─────────────────────────────────┐
│  Write to Destination           │
│  (Backpressure if slow)         │
└──────┬──────────────────────────┘
       │
       │ Emit progress event
       ▼
┌─────────────────────────────────┐
│  postMessage({ progress })      │
└─────────────────────────────────┘
```

### Path Validation Flow

```
Entry path: "../../etc/passwd"
    │
    ▼
┌─────────────────────────────────┐
│  Normalize path                 │
│  Remove ".." components         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Check for traversal            │
│  Path still contains ".."?      │
└──────┬──────────────────────────┘
       │
       ▼ YES
┌─────────────────────────────────┐
│  REJECT: Path traversal         │
│  Log error                      │
│  Skip entry                     │
│  Warn user                      │
└─────────────────────────────────┘
```

### Cancellation Flow

```
User clicks "Cancel"
    │
    ▼
Main thread: adapter.cancel()
    │
    ▼
postMessage({ type: 'cancel' })
    │
    ▼
Worker: abortController.abort()
    │
    ▼
Worker: cleanup current operation
  - Close file streams
  - Delete partial files (optional)
  - Release resources
    │
    ▼
postMessage({ type: 'cancelled' })
    │
    ▼
Main thread: display cancellation
Worker: terminate()
```

## Archive Creation Flow

### High-Level Flow

```
User clicks "Create Archive"
    │
    ▼
User selects source files/folders
    │
    ▼
User chooses format and options
    │
    ▼
User selects destination
    │
    ▼
Worker receives creation command
    │
    ▼
Worker iterates source files
    │
    ▼
For each file:
  - Read content
  - Compress
  - Write to archive
  - Report progress
    │
    ▼
Complete: Archive saved
```

### Detailed Data Flow

```
┌─────────────┐
│    User     │
│  clicks     │
│  "Create"   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  showOpenFilePicker({           │
│    multiple: true               │
│  })                             │
│  User selects files/folders     │
└──────┬──────────────────────────┘
       │
       │ FileSystemHandle[]
       ▼
┌─────────────────────────────────┐
│  User Configuration:            │
│  - Format (ZIP/TAR/TAR.GZ)      │
│  - Compression level            │
│  - Archive name                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  showSaveFilePicker()           │
│  User chooses destination       │
└──────┬──────────────────────────┘
       │
       │ FileSystemFileHandle
       ▼
┌─────────────────────────────────┐
│  postMessage({                  │
│    type: 'create',              │
│    sources,                     │
│    destination,                 │
│    format,                      │
│    options                      │
│  })                             │
└──────┬──────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────┐
│  Worker: Create Archive                        │
│                                                │
│  ┌───────────────────────────────────────┐    │
│  │ 1. Initialize archive writer          │    │
│  │    - Create destination file          │    │
│  │    - Write format headers             │    │
│  │    - Setup compression stream         │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ 2. Enumerate all source files         │    │
│  │    - Recursively traverse directories │    │
│  │    - Collect file handles             │    │
│  │    - Calculate total size             │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           │ postMessage({ type: 'enumerated' })│
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ 3. For each source file:              │    │
│  │    ┌──────────────────────────────┐   │    │
│  │    │ - Read file content          │   │    │
│  │    │ - Stream through compressor  │   │    │
│  │    │ - Write to archive           │   │    │
│  │    │ - Write entry metadata       │   │    │
│  │    └──────────────────────────────┘   │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           │ postMessage({ type: 'progress' }) │
│           ▼                                    │
└───────────┼────────────────────────────────────┘
            │
            │ CreationProgress (periodic)
            ▼
┌─────────────────────────────────┐
│  Main Thread: Update UI         │
│  - Current file                 │
│  - Files added                  │
│  - Bytes written                │
│  - Compression ratio            │
└─────────────────────────────────┘
            │
            │ (Repeat for all files)
            ▼
┌─────────────────────────────────┐
│  Worker: Finalize Archive       │
│  - Write format footer          │
│  - Flush compression buffer     │
│  - Close file                   │
└──────┬──────────────────────────┘
       │
       │ postMessage({ type: 'complete' })
       ▼
┌─────────────────────────────────┐
│  Main Thread:                   │
│  - Show completion              │
│  - Display stats                │
│  - Offer to inspect             │
│  - Terminate worker             │
└─────────────────────────────────┘
```

### Compression Stream Detail

```
Source File
    │
    ▼
┌─────────────────────────────────┐
│  Read Chunk (64KB)              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Compression Transform Stream   │
│  (Deflate/GZIP)                 │
└──────┬──────────────────────────┘
       │
       │ Compressed chunk (variable size)
       ▼
┌─────────────────────────────────┐
│  Write to Archive               │
│  (With entry headers)           │
└──────┬──────────────────────────┘
       │
       │ Emit progress
       ▼
┌─────────────────────────────────┐
│  postMessage({ progress })      │
└─────────────────────────────────┘
```

### Directory Traversal

```
Source: FileSystemDirectoryHandle
    │
    ▼
┌─────────────────────────────────┐
│  Iterate directory entries      │
│  for await (const entry of dir) │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Entry is file?                 │
└──────┬──────────────────────────┘
       │ YES
       ▼
┌─────────────────────────────────┐
│  Add to archive queue           │
└─────────────────────────────────┘
       │ NO (is directory)
       ▼
┌─────────────────────────────────┐
│  Recurse into subdirectory      │
│  (Maintain relative paths)      │
└─────────────────────────────────┘
```

## Safety Scanning Flow

### High-Level Flow

```
Archive entries received
    │
    ▼
For each entry:
  - Check path traversal
  - Detect executables
  - Detect nested archives
  - Check symlinks
    │
    ▼
Aggregate risk analysis
    │
    ▼
Calculate expansion ratio
    │
    ▼
Generate safety report
    │
    ▼
Display warnings to user
```

### Detailed Data Flow

```
┌─────────────────────────────────┐
│  ArchiveEntry[]                 │
│  (from inspection)              │
└──────┬──────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────┐
│  Safety Analyzer                               │
│                                                │
│  For each entry:                              │
│  ┌───────────────────────────────────────┐    │
│  │ Path Traversal Check:                 │    │
│  │  - Contains ".."                      │    │
│  │  - Absolute path                      │    │
│  │  - Symlink to outside                 │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ Executable Detection:                 │    │
│  │  - File extension (.exe, .sh, etc.)   │    │
│  │  - Execute permission bit             │    │
│  │  - File signature (PE, ELF, Mach-O)   │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ Nested Archive Detection:             │    │
│  │  - File extension                     │    │
│  │  - MIME type                          │    │
│  │  - File signature                     │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           ▼                                    │
│  ┌───────────────────────────────────────┐    │
│  │ Symlink Analysis:                     │    │
│  │  - Target path                        │    │
│  │  - Points outside archive             │    │
│  │  - Circular references                │    │
│  └────────┬──────────────────────────────┘    │
│           │                                    │
│           │ Risk[]                             │
│           ▼                                    │
└───────────┼────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Aggregate Analysis:            │
│  ┌───────────────────────────┐  │
│  │ Expansion Ratio:          │  │
│  │  totalUncompressed /      │  │
│  │  totalCompressed          │  │
│  └────────┬──────────────────┘  │
│           │                     │
│           ▼                     │
│  ┌───────────────────────────┐  │
│  │ Risk Summary:             │  │
│  │  - Count by severity      │  │
│  │  - Blocking risks         │  │
│  │  - Warnings               │  │
│  └────────┬──────────────────┘  │
│           │                     │
│           │ SafetyReport        │
│           ▼                     │
└───────────┼─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Display Safety Report:         │
│  - Risk summary                 │
│  - Detailed warnings            │
│  - Recommendation               │
│  - Allow/block extraction       │
└─────────────────────────────────┘
```

### Risk Assessment Logic

```typescript
interface SafetyReport {
  risks: SafetyRisk[];
  expansionRatio: number;
  hasBlockingRisks: boolean;
  recommendation: 'safe' | 'caution' | 'danger';
}

function assessRisks(entries: ArchiveEntry[]): SafetyReport {
  const risks: SafetyRisk[] = [];

  // Path traversal (BLOCKING)
  for (const entry of entries) {
    if (hasPathTraversal(entry.path)) {
      risks.push({
        type: 'path-traversal',
        severity: 'high',
        message: `Entry attempts to escape: ${entry.path}`,
        entry: entry.path,
      });
    }
  }

  // Expansion ratio (WARNING if > 100)
  const ratio = calculateExpansionRatio(entries);
  if (ratio > 100) {
    risks.push({
      type: 'expansion',
      severity: 'high',
      message: `High expansion ratio: ${ratio}x (possible archive bomb)`,
    });
  }

  // Executables (INFO)
  const executables = entries.filter((e) => e.isExecutable);
  if (executables.length > 0) {
    risks.push({
      type: 'executable',
      severity: 'medium',
      message: `Contains ${executables.length} executable file(s)`,
    });
  }

  // Determine recommendation
  const hasHigh = risks.some((r) => r.severity === 'high');
  const recommendation = hasHigh ? 'danger' : risks.length > 0 ? 'caution' : 'safe';

  return {
    risks,
    expansionRatio: ratio,
    hasBlockingRisks: risks.some((r) => r.type === 'path-traversal'),
    recommendation,
  };
}
```

## Worker Communication Patterns

### Command-Response Pattern

```
Main Thread                Worker
     │                       │
     │──── Command ─────────>│
     │                       │
     │                       │ Process
     │                       │
     │<──── Response ────────│
```

### Progress Streaming Pattern

```
Main Thread                Worker
     │                       │
     │──── Command ─────────>│
     │                       │
     │<──── Progress ────────│ (25%)
     │                       │
     │<──── Progress ────────│ (50%)
     │                       │
     │<──── Progress ────────│ (75%)
     │                       │
     │<──── Complete ────────│ (100%)
```

### Entry Streaming Pattern

```
Main Thread                Worker
     │                       │
     │──── Inspect ─────────>│
     │                       │
     │<──── Entry ───────────│
     │<──── Entry ───────────│
     │<──── Entry ───────────│
     │<──── Entry ───────────│
     │<──── Complete ────────│
```

### Cancellation Pattern

```
Main Thread                Worker
     │                       │
     │──── Command ─────────>│
     │                       │
     │<──── Progress ────────│
     │                       │
     │──── Cancel ──────────>│
     │                       │ Cleanup
     │                       │
     │<──── Cancelled ───────│
```

## Performance Considerations

### Backpressure Handling

```
Fast Producer (Worker)     Slow Consumer (Disk)
     │                           │
     │──── Write ───────────────>│ (Buffer full)
     │                           │
     │  (Blocked until space)    │
     │                           │
     │<──── Backpressure ────────│
     │                           │
     │  (Wait for drain)         │
     │                           │
     │──── Write ───────────────>│ (Buffer available)
```

### Chunk Size Optimization

- **Read chunks:** 64KB (balance memory vs syscalls)
- **Write chunks:** 64KB (match read size)
- **Decompress buffer:** 128KB (allow expansion)
- **UI update throttle:** 100ms (prevent flooding)

### Memory Bounds

- Maximum buffered: 10MB (5x write buffer)
- Entry metadata: ~500 bytes each
- 100,000 entries: ~50MB metadata
- Working memory: ~100MB total
- Peak usage: ~500MB during operations

## Error Propagation

### Worker Error Flow

```
Worker Error
    │
    ▼
Catch in worker
    │
    ▼
postMessage({ type: 'error', error })
    │
    ▼
Main thread receives
    │
    ▼
Display to user
    │
    ▼
Cleanup operation
```

### Recoverable Error Flow

```
Entry processing error
    │
    ▼
Log error
    │
    ▼
Add to error list
    │
    ▼
Continue with next entry
    │
    ▼
Report errors in summary
```

## Summary

All data flows in ZipKit follow these principles:

1. **Streaming** — Incremental processing, bounded memory
2. **Local** — No network, all in-browser
3. **Progressive** — Early results, real-time feedback
4. **Cancellable** — User control at all times
5. **Safe** — Validation at every stage
6. **Transparent** — Clear progress and errors

These patterns enable ZipKit to handle archives of any size efficiently while maintaining security and providing an excellent user experience.
