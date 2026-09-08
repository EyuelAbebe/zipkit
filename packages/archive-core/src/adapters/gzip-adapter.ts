import type {
  ArchiveAdapter,
  ArchiveEntry,
  ArchiveMetadata,
  ExtractOptions,
  ProgressEvent,
} from '../types.js';
import { CorruptedArchiveError, ExtractionError, OperationCancelledError } from '../types.js';
import { TarAdapter } from './tar-adapter.js';

/**
 * GZIP adapter using browser's native DecompressionStream API.
 * Supports both standalone GZIP files and TAR.GZ combinations.
 */
export class GzipAdapter implements ArchiveAdapter {
  private file: File;
  private isTarGz: boolean;
  private decompressedData: Uint8Array | null = null;
  private tarAdapter: TarAdapter | null = null;

  constructor(file: File, isTarGz: boolean = false) {
    this.file = file;
    this.isTarGz = isTarGz;
  }

  /**
   * Decompress the GZIP file using browser's DecompressionStream.
   */
  private async decompress(): Promise<Uint8Array> {
    if (this.decompressedData) {
      return this.decompressedData;
    }

    try {
      const stream = this.file.stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));

      const reader = decompressedStream.getReader();
      const chunks: Uint8Array[] = [];
      let totalLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalLength += value.length;
      }

      // Combine chunks into single Uint8Array
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      this.decompressedData = result;

      // If this is a TAR.GZ, create a TAR adapter from the decompressed data
      if (this.isTarGz) {
        const decompressedFile = new File([this.decompressedData as BlobPart], 'decompressed.tar', {
          type: 'application/x-tar',
        });
        this.tarAdapter = new TarAdapter(decompressedFile);
      }

      return this.decompressedData;
    } catch (error) {
      throw new CorruptedArchiveError(
        `Failed to decompress GZIP: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Inspect the GZIP archive and return metadata.
   */
  async inspect(): Promise<ArchiveMetadata> {
    await this.decompress();

    if (this.isTarGz && this.tarAdapter) {
      const tarMetadata = await this.tarAdapter.inspect();
      return {
        ...tarMetadata,
        format: 'tar.gz',
        totalCompressedSize: this.file.size,
      };
    }

    // Single GZIP file
    return {
      format: 'gzip',
      totalEntries: 1,
      totalSize: this.decompressedData?.length ?? 0,
      totalCompressedSize: this.file.size,
    };
  }

  /**
   * List all entries in the archive.
   * For TAR.GZ, delegates to TarAdapter.
   * For plain GZIP, returns single entry.
   */
  async *listEntries(signal?: AbortSignal): AsyncGenerator<ArchiveEntry> {
    await this.decompress();

    if (this.isTarGz && this.tarAdapter) {
      // Delegate to TAR adapter
      yield* this.tarAdapter.listEntries(signal);
      return;
    }

    // Single GZIP file - return as single entry
    if (signal?.aborted) {
      throw new OperationCancelledError();
    }

    const filename = this.file.name.replace(/\.gz$/, '');

    yield {
      path: filename,
      size: this.decompressedData?.length ?? 0,
      compressedSize: this.file.size,
      isDirectory: false,
      lastModified: new Date(this.file.lastModified),
      compressionMethod: 'gzip',
    };
  }

  /**
   * Extract the archive to a destination directory.
   */
  async *extract(
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent> {
    await this.decompress();

    if (this.isTarGz && this.tarAdapter) {
      // Delegate to TAR adapter
      yield* this.tarAdapter.extract(destination, options);
      return;
    }

    // Single GZIP file extraction
    const signal = options?.signal;

    if (signal?.aborted) {
      throw new OperationCancelledError();
    }

    if (!this.decompressedData) {
      throw new ExtractionError('No decompressed data available');
    }

    const filename = this.file.name.replace(/\.gz$/, '');

    try {
      const fileHandle = await destination.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(this.decompressedData as unknown as FileSystemWriteChunkType);
      await writable.close();

      yield {
        type: 'progress',
        processed: this.decompressedData.length,
        total: this.decompressedData.length,
        currentFile: filename,
      };

      if (options?.onProgress) {
        options.onProgress({
          type: 'progress',
          processed: this.decompressedData.length,
          total: this.decompressedData.length,
          currentFile: filename,
        });
      }
    } catch (error) {
      throw new ExtractionError(
        `Failed to extract ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filename
      );
    }
  }

  /**
   * Extract selected entries from the archive.
   */
  async *extractSelected(
    entries: string[],
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent> {
    await this.decompress();

    if (this.isTarGz && this.tarAdapter) {
      // Delegate to TAR adapter
      yield* this.tarAdapter.extractSelected(entries, destination, options);
      return;
    }

    // For single GZIP file, extract if the filename matches
    const filename = this.file.name.replace(/\.gz$/, '');

    if (entries.includes(filename)) {
      yield* this.extract(destination, options);
    }
  }
}

/**
 * Compress data using GZIP.
 */
export async function compressGzip(data: Uint8Array): Promise<Uint8Array> {
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });

  const compressedStream = readableStream.pipeThrough(new CompressionStream('gzip'));

  const reader = compressedStream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    totalLength += value.length;
  }

  // Combine chunks
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
