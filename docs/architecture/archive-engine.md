# Archive Engine Architecture

## Overview

The archive engine is responsible for reading, writing, and analyzing archive files. It provides a unified abstraction over multiple archive formats with streaming support, progress tracking, and safety validation.

## Design Principles

### Format Abstraction
- Common interface for all archive formats
- Format-specific implementations isolated
- Easy to add new formats
- Format detection automatic

### Streaming-First
- Never load entire archive into memory
- Process incrementally
- Bounded memory usage
- Support arbitrarily large files

### Worker-Based
- CPU-intensive operations in Web Workers
- Main thread remains responsive
- Cancellable operations
- Progress reporting

### Safety-Integrated
- All operations validate security
- Path traversal prevention
- Expansion monitoring
- Clear risk assessment

## Core Abstraction: ArchiveAdapter

### Interface Definition

```typescript
interface ArchiveAdapter {
  // Format identification
  readonly format: ArchiveFormat;

  // Detection
  canHandle(fileHeader: Uint8Array): boolean;

  // Inspection
  inspect(
    file: FileSystemFileHandle,
    options?: InspectOptions
  ): AsyncIterable<ArchiveEntry>;

  // Extraction
  extract(
    file: FileSystemFileHandle,
    entries: ArchiveEntry[],
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncIterable<ExtractionProgress>;

  // Creation
  create(
    sources: FileSystemHandle[],
    destination: FileSystemFileHandle,
    options?: CreateOptions
  ): AsyncIterable<CreationProgress>;

  // Cancellation
  cancel(): void;
}
```

### Format Enum

```typescript
enum ArchiveFormat {
  ZIP = 'zip',
  TAR = 'tar',
  TAR_GZ = 'tar.gz',
  GZIP = 'gzip',
}
```

### Entry Metadata

```typescript
interface ArchiveEntry {
  // Identity
  path: string;
  name: string;

  // Type
  type: 'file' | 'directory' | 'symlink' | 'hardlink';

  // Sizes
  compressedSize: number;
  uncompressedSize: number;

  // Timestamps
  modifiedTime?: Date;
  accessedTime?: Date;
  createdTime?: Date;

  // Attributes
  permissions?: number;
  uid?: number;
  gid?: number;

  // Links
  linkTarget?: string;

  // Safety metadata
  isExecutable?: boolean;
  isNested?: boolean;
  pathTraversal?: boolean;

  // Format-specific
  metadata?: Record<string, unknown>;
}
```

## Format Adapters

### ZIP Adapter

**Implementation:**
- Central Directory scanning for inspection
- Local File Header parsing for extraction
- ZIP64 support for large files
- Deflate compression (primary method)
- Store method (uncompressed)

**Characteristics:**
- Random access to entries
- Fast inspection without decompression
- Metadata at end of file
- Well-supported across tools

**Complexity:**
- Variable compression methods
- ZIP64 extensions
- Data descriptor handling
- Central Directory parsing

### TAR Adapter

**Implementation:**
- Sequential entry scanning
- POSIX ustar format support
- Extended PAX headers for metadata
- No compression (handled by wrapper)

**Characteristics:**
- Sequential access only
- Simple format
- Preserves Unix permissions
- Symlink support

**Complexity:**
- Multiple TAR formats (ustar, pax, gnu)
- Long filename handling
- Sparse file support
- Extended attributes

### GZIP Adapter

**Implementation:**
- Single-file compression wrapper
- Header parsing
- Deflate decompression
- CRC32 validation

**Characteristics:**
- Wraps single file
- Often combined with TAR
- Fast compression
- Wide support

**Complexity:**
- Multi-member files
- Extra headers
- Footer validation

### TAR.GZ Adapter

**Implementation:**
- Combines GZIP and TAR adapters
- Two-stage processing
- Streaming decompression to TAR parser

**Characteristics:**
- Unix standard for archives
- Good compression
- Preserves attributes
- Sequential only

**Complexity:**
- Two-layer parsing
- Memory efficient streaming
- Error propagation across layers

## Streaming Architecture

### Inspection Streaming

```
File Handle
    │
    ▼
Read Stream
    │
    ▼
Format Detection
    │
    ▼
Header Parser
    │
    ▼
Entry Extractor
    │
    ▼
Async Iterator<ArchiveEntry>
    │
    ▼
Safety Analyzer
    │
    ▼
UI Display
```

**Benefits:**
- Incremental display
- Early cancellation
- Bounded memory
- Fast time-to-first-entry

### Extraction Streaming

```
Selected Entries
    │
    ▼
Entry Stream
    │
    ▼
Decompression Transform
    │
    ▼
Path Validation
    │
    ▼
Destination Write
    │
    ▼
Progress Events
```

**Benefits:**
- Progressive extraction
- Memory bounded by chunk size
- Cancellable mid-stream
- Real-time progress

### Creation Streaming

```
Source Files
    │
    ▼
File Handle Stream
    │
    ▼
Read Transform
    │
    ▼
Compression Transform
    │
    ▼
Archive Writer
    │
    ▼
Progress Events
```

**Benefits:**
- Handle large source files
- Memory efficient
- Cancel during creation
- Progressive writing

## Progress Model

### Progress Events

```typescript
interface OperationProgress {
  // Stage
  stage: 'initializing' | 'processing' | 'finalizing' | 'complete';

  // Quantities
  totalEntries?: number;
  processedEntries: number;

  // Sizes
  totalBytes?: number;
  processedBytes: number;

  // Timing
  startTime: number;
  elapsedMs: number;
  estimatedRemainingMs?: number;

  // Current
  currentEntry?: string;

  // Errors
  errors: OperationError[];
}
```

### Progress Reporting Strategy

- Emit progress every N entries (e.g., 10)
- Emit progress every N bytes (e.g., 1MB)
- Emit progress every N milliseconds (e.g., 100ms)
- Debounce to prevent flooding
- Always emit completion event

### Throughput Calculation

```typescript
// Bytes per second
const throughput = processedBytes / (elapsedMs / 1000);

// Estimate remaining
const remainingBytes = totalBytes - processedBytes;
const estimatedRemainingMs = (remainingBytes / throughput) * 1000;
```

## Cancellation Model

### Cancellation Flow

```
User clicks Cancel
    │
    ▼
Main Thread: adapter.cancel()
    │
    ▼
Worker: abort signal triggered
    │
    ▼
Worker: cleanup current operation
    │
    ▼
Worker: send cancellation event
    │
    ▼
Main Thread: cleanup resources
    │
    ▼
UI: show cancellation message
```

### Cancellation Implementation

```typescript
class ArchiveAdapter {
  private abortController = new AbortController();

  cancel(): void {
    this.abortController.abort();
  }

  async *extract(...): AsyncIterable<Progress> {
    const signal = this.abortController.signal;

    for (const entry of entries) {
      // Check cancellation
      if (signal.aborted) {
        throw new CancellationError();
      }

      // Process entry
      yield progress;
    }
  }
}
```

### Cleanup on Cancellation

- Close open file handles
- Terminate streams
- Delete partial output files (optional)
- Release memory buffers
- Notify UI of cancellation

## Error Handling

### Error Categories

**Format Errors:**
- Invalid archive structure
- Unsupported compression method
- Corrupt data
- Truncated archive

**File System Errors:**
- Permission denied
- Disk full
- Path too long
- Invalid filename characters

**Security Errors:**
- Path traversal detected
- Expansion limit exceeded
- Symbolic link escape

**Resource Errors:**
- Out of memory
- Worker crash
- Browser quota exceeded

### Error Recovery Strategy

```typescript
interface OperationError {
  type: ErrorType;
  severity: 'warning' | 'error' | 'fatal';
  message: string;
  entry?: string;
  recoverable: boolean;
}
```

**Fatal Errors:**
- Stop operation immediately
- Report to user
- Cleanup resources
- No retry

**Recoverable Errors:**
- Log error
- Skip problematic entry
- Continue with remaining entries
- Report in summary

**Warnings:**
- Log warning
- Continue operation
- Report in summary
- Don't block completion

## Worker Communication

### Message Protocol

```typescript
// Command messages (Main → Worker)
type WorkerCommand =
  | { type: 'inspect'; fileHandle: FileSystemFileHandle; options?: InspectOptions }
  | { type: 'extract'; fileHandle: FileSystemFileHandle; entries: ArchiveEntry[]; destination: FileSystemDirectoryHandle; options?: ExtractOptions }
  | { type: 'create'; sources: FileSystemHandle[]; destination: FileSystemFileHandle; options?: CreateOptions }
  | { type: 'cancel' };

// Event messages (Worker → Main)
type WorkerEvent =
  | { type: 'progress'; progress: OperationProgress }
  | { type: 'entry'; entry: ArchiveEntry }
  | { type: 'complete'; result: OperationResult }
  | { type: 'error'; error: OperationError };
```

### Worker Lifecycle

```
Main Thread                   Worker
     │                          │
     │──── new Worker() ────────>│
     │                          │
     │──── postMessage(cmd) ────>│
     │                          │ Initialize
     │                          │
     │<─── entry event ──────────│ Process
     │<─── progress event ───────│
     │<─── entry event ──────────│
     │<─── progress event ───────│
     │                          │
     │──── cancel ──────────────>│ Abort
     │                          │
     │<─── complete event ───────│
     │                          │
     │──── terminate() ─────────>│
```

### Worker Pooling Strategy

**MVP Approach:**
- One worker per operation
- Worker created on demand
- Terminated after completion
- No pooling

**Future Optimization:**
- Worker pool with configurable size
- Reuse workers across operations
- Parallel processing of multiple archives
- Queue operations when pool full

## Format Detection

### Detection Strategy

```typescript
async function detectFormat(
  fileHandle: FileSystemFileHandle
): Promise<ArchiveFormat> {
  // Read first 512 bytes
  const file = await fileHandle.getFile();
  const header = new Uint8Array(await file.slice(0, 512).arrayBuffer());

  // Try adapters in order
  for (const adapter of adapters) {
    if (adapter.canHandle(header)) {
      return adapter.format;
    }
  }

  throw new UnsupportedFormatError();
}
```

### Format Signatures

**ZIP:**
- Starts with `50 4B 03 04` (PK\x03\x04)
- Or `50 4B 05 06` (empty ZIP)

**TAR:**
- Magic bytes at offset 257: `75 73 74 61 72` ("ustar")
- Or older TAR formats (structural detection)

**GZIP:**
- Starts with `1F 8B` (gzip magic)
- Followed by compression method (usually `08`)

**TAR.GZ:**
- GZIP signature + TAR content after decompression

### Fallback Detection

If signature detection fails:
- Try file extension
- Attempt parsing with each adapter
- Prompt user for format

## Safety Integration

### Safety Hooks in Adapter

```typescript
class SafeArchiveAdapter implements ArchiveAdapter {
  constructor(
    private adapter: ArchiveAdapter,
    private security: SecurityAnalyzer
  ) {}

  async *inspect(file, options) {
    for await (const entry of this.adapter.inspect(file, options)) {
      // Analyze each entry
      const risks = await this.security.analyzeEntry(entry);
      entry.risks = risks;

      yield entry;
    }
  }

  async *extract(file, entries, destination, options) {
    // Pre-extraction validation
    const analysis = await this.security.analyzeArchive(entries);

    if (analysis.hasBlockingRisks && !options.force) {
      throw new SecurityError(analysis.risks);
    }

    // Extract with path validation
    for await (const progress of this.adapter.extract(...)) {
      yield progress;
    }
  }
}
```

### Safety Checks During Operations

**Inspection:**
- Path traversal detection
- Executable identification
- Nested archive detection
- Symlink analysis

**Extraction:**
- Path validation before write
- Expansion ratio monitoring
- Disk space checking
- Symlink target validation

**Creation:**
- Source path validation
- Size limit checking
- Permission preservation

## Performance Optimization

### Chunk Size Tuning

- Read chunks: 64KB (configurable)
- Write chunks: 64KB (configurable)
- Decompress chunks: 128KB (configurable)
- Balance memory vs throughput

### Parallelization Opportunities

**Not Parallelized in MVP:**
- Single archive processed sequentially
- Entry-by-entry processing
- Single worker per operation

**Future Parallelization:**
- Multiple archive inspection
- Parallel entry extraction (ZIP only)
- Multi-threaded compression
- Batch operations

### Memory Bounds

- Maximum read buffer: 1MB
- Maximum write buffer: 1MB
- Maximum decompressed buffer: 2MB
- Maximum entries in memory: 100,000
- Virtual scrolling for UI display

## Testing Strategy

### Adapter Contract Tests

- All adapters implement common interface
- Shared test suite for all formats
- Test edge cases for each format
- Performance benchmarks

### Test Fixtures

- Small archives (< 1MB)
- Medium archives (10-100MB)
- Large archives (> 100MB)
- Malformed archives
- Security test archives (path traversal, bombs)

### Worker Tests

- Mock worker communication
- Test message protocol
- Test cancellation
- Test error propagation

## Extension Points

### Adding New Formats

1. Implement ArchiveAdapter interface
2. Add format detection logic
3. Register adapter with factory
4. Add worker for format
5. Add tests with fixtures

### Custom Compression

1. Implement compression transform stream
2. Integrate with adapter
3. Add options to UI
4. Test performance

### Advanced Features

- Multi-volume archives: extend adapter interface
- Password protection: add decryption transform
- Encryption: add encryption options
- Repair: add validation and correction logic
