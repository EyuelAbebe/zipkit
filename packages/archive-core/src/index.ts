/**
 * @zipkit/archive-core
 *
 * Core archive processing package for ZipKit.
 * Supports ZIP, TAR, GZIP, and TAR.GZ formats with streaming capabilities.
 */

// Export types and interfaces
export type {
  ArchiveEntry,
  ArchiveMetadata,
  ProgressEvent,
  ExtractOptions,
  CreateOptions,
  ArchiveAdapter,
} from './types.js';

// Export error classes
export {
  UnsupportedFormatError,
  CorruptedArchiveError,
  OperationCancelledError,
  ExtractionError,
} from './types.js';

// Export adapters
export { ZipAdapter, createZip } from './adapters/zip-adapter.js';
export { TarAdapter } from './adapters/tar-adapter.js';
export { GzipAdapter, compressGzip } from './adapters/gzip-adapter.js';

// Export factory functions
export { createAdapter, createAdapterForFormat } from './factory.js';

// Export worker client
export { ArchiveWorkerClient } from './worker/worker-client.js';

// Re-export worker types for convenience
export type { WorkerRequest, WorkerResponse } from './worker/archive-worker.js';
