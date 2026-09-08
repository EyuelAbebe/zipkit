/**
 * Represents a single entry in an archive file.
 */
export interface ArchiveEntry {
  /** Full path of the entry within the archive */
  path: string;
  /** Uncompressed size in bytes */
  size: number;
  /** Compressed size in bytes */
  compressedSize: number;
  /** Whether this entry represents a directory */
  isDirectory: boolean;
  /** Last modification timestamp */
  lastModified: Date;
  /** Compression method used (e.g., 'deflate', 'store', 'gzip') */
  compressionMethod?: string;
}

/**
 * Metadata about an entire archive file.
 */
export interface ArchiveMetadata {
  /** Archive format type */
  format: 'zip' | 'tar' | 'tar.gz' | 'gzip';
  /** Total number of entries in the archive */
  totalEntries: number;
  /** Total uncompressed size in bytes */
  totalSize: number;
  /** Total compressed size in bytes */
  totalCompressedSize: number;
}

/**
 * Progress event emitted during archive operations.
 */
export interface ProgressEvent {
  /** Event type identifier */
  type: 'progress';
  /** Number of bytes processed so far */
  processed: number;
  /** Total bytes to process */
  total: number;
  /** Optional name of the file currently being processed */
  currentFile?: string;
}

/**
 * Options for extraction operations.
 */
export interface ExtractOptions {
  /** Signal for cancellation support */
  signal?: AbortSignal;
  /** Whether to preserve directory structure */
  preserveStructure?: boolean;
  /** Optional callback for progress updates */
  onProgress?: (event: ProgressEvent) => void;
}

/**
 * Options for creating archives.
 */
export interface CreateOptions {
  /** Compression level (0-9, where 0 = no compression, 9 = max compression) */
  compressionLevel?: number;
  /** Signal for cancellation support */
  signal?: AbortSignal;
  /** Optional callback for progress updates */
  onProgress?: (event: ProgressEvent) => void;
}

/**
 * Core adapter interface for archive processing.
 * All archive format implementations must implement this interface.
 */
export interface ArchiveAdapter {
  /**
   * Inspect the archive and return metadata.
   * @returns Promise resolving to archive metadata
   */
  inspect(): Promise<ArchiveMetadata>;

  /**
   * List all entries in the archive.
   * @param signal Optional abort signal for cancellation
   * @returns Async generator yielding archive entries
   */
  listEntries(signal?: AbortSignal): AsyncGenerator<ArchiveEntry>;

  /**
   * Extract the entire archive to a destination directory.
   * @param destination File System Access API directory handle
   * @param options Optional extraction options
   * @returns Async generator yielding progress events
   */
  extract(
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent>;

  /**
   * Extract selected entries to a destination directory.
   * @param entries Array of entry paths to extract
   * @param destination File System Access API directory handle
   * @param options Optional extraction options
   * @returns Async generator yielding progress events
   */
  extractSelected(
    entries: string[],
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent>;
}

/**
 * Error thrown when an archive format is not supported.
 */
export class UnsupportedFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFormatError';
  }
}

/**
 * Error thrown when an archive is corrupted or invalid.
 */
export class CorruptedArchiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorruptedArchiveError';
  }
}

/**
 * Error thrown when an operation is cancelled.
 */
export class OperationCancelledError extends Error {
  constructor(message: string = 'Operation was cancelled') {
    super(message);
    this.name = 'OperationCancelledError';
  }
}

/**
 * Error thrown when extraction fails.
 */
export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly entryPath?: string
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}
