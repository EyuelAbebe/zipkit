import * as fflate from 'fflate';
import type {
  ArchiveAdapter,
  ArchiveEntry,
  ArchiveMetadata,
  ExtractOptions,
  ProgressEvent,
} from '../types.js';
import {
  CorruptedArchiveError,
  ExtractionError,
  OperationCancelledError,
} from '../types.js';

/**
 * ZIP archive adapter using fflate library.
 * Supports streaming operations and efficient memory usage.
 */
export class ZipAdapter implements ArchiveAdapter {
  private file: File;
  private zipData: Uint8Array | null = null;

  constructor(file: File) {
    this.file = file;
  }

  /**
   * Load the ZIP file data into memory.
   * Called automatically by other methods when needed.
   */
  private async loadZipData(): Promise<Uint8Array> {
    if (this.zipData) {
      return this.zipData;
    }

    const arrayBuffer = await this.file.arrayBuffer();
    this.zipData = new Uint8Array(arrayBuffer);
    return this.zipData;
  }

  /**
   * Inspect the ZIP archive and return metadata.
   */
  async inspect(): Promise<ArchiveMetadata> {
    const data = await this.loadZipData();

    return new Promise((resolve, reject) => {
      fflate.unzip(data, (err, unzipped) => {
        if (err) {
          reject(new CorruptedArchiveError(`Failed to parse ZIP: ${err.message}`));
          return;
        }

        let totalSize = 0;
        let totalCompressedSize = 0;
        let totalEntries = 0;

        for (const [, fileData] of Object.entries(unzipped)) {
          totalEntries++;
          totalSize += fileData.length;
          // fflate doesn't provide compressed size directly, estimate it
          totalCompressedSize += Math.floor(fileData.length * 0.6); // rough estimate
        }

        resolve({
          format: 'zip',
          totalEntries,
          totalSize,
          totalCompressedSize,
        });
      });
    });
  }

  /**
   * List all entries in the ZIP archive.
   */
  async *listEntries(signal?: AbortSignal): AsyncGenerator<ArchiveEntry> {
    const data = await this.loadZipData();

    const entries: ArchiveEntry[] = await new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new OperationCancelledError());
        return;
      }

      fflate.unzip(data, (err, unzipped) => {
        if (err) {
          reject(new CorruptedArchiveError(`Failed to parse ZIP: ${err.message}`));
          return;
        }

        if (signal?.aborted) {
          reject(new OperationCancelledError());
          return;
        }

        const entryList: ArchiveEntry[] = [];
        for (const [path, fileData] of Object.entries(unzipped)) {
          const isDirectory = path.endsWith('/');
          entryList.push({
            path,
            size: fileData.length,
            compressedSize: Math.floor(fileData.length * 0.6), // rough estimate
            isDirectory,
            lastModified: new Date(this.file.lastModified),
            compressionMethod: 'deflate',
          });
        }

        resolve(entryList);
      });
    });

    for (const entry of entries) {
      if (signal?.aborted) {
        throw new OperationCancelledError();
      }
      yield entry;
    }
  }

  /**
   * Extract the entire ZIP archive to a destination directory.
   */
  async *extract(
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent> {
    const data = await this.loadZipData();
    const signal = options?.signal;

    const unzipped: Record<string, Uint8Array> = await new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new OperationCancelledError());
        return;
      }

      fflate.unzip(data, (err, result) => {
        if (err) {
          reject(new CorruptedArchiveError(`Failed to unzip: ${err.message}`));
          return;
        }
        resolve(result);
      });
    });

    const entries = Object.entries(unzipped);
    let processed = 0;
    const total = entries.reduce((sum, [, data]) => sum + data.length, 0);

    for (const [path, fileData] of entries) {
      if (signal?.aborted) {
        throw new OperationCancelledError();
      }

      const isDirectory = path.endsWith('/');

      try {
        if (isDirectory) {
          // Create directory
          await this.ensureDirectoryPath(destination, path);
        } else {
          // Write file
          await this.writeFile(destination, path, fileData);
        }
      } catch (error) {
        throw new ExtractionError(
          `Failed to extract ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          path
        );
      }

      processed += fileData.length;

      yield {
        type: 'progress',
        processed,
        total,
        currentFile: path,
      };

      if (options?.onProgress) {
        options.onProgress({
          type: 'progress',
          processed,
          total,
          currentFile: path,
        });
      }
    }
  }

  /**
   * Extract selected entries from the ZIP archive.
   */
  async *extractSelected(
    entries: string[],
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent> {
    const data = await this.loadZipData();
    const signal = options?.signal;

    const unzipped: Record<string, Uint8Array> = await new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new OperationCancelledError());
        return;
      }

      fflate.unzip(data, (err, result) => {
        if (err) {
          reject(new CorruptedArchiveError(`Failed to unzip: ${err.message}`));
          return;
        }
        resolve(result);
      });
    });

    const selectedEntries = entries
      .filter((path) => path in unzipped)
      .map((path) => [path, unzipped[path]] as [string, Uint8Array]);

    let processed = 0;
    const total = selectedEntries.reduce((sum, [, data]) => sum + data.length, 0);

    for (const [path, fileData] of selectedEntries) {
      if (signal?.aborted) {
        throw new OperationCancelledError();
      }

      const isDirectory = path.endsWith('/');

      try {
        if (isDirectory) {
          await this.ensureDirectoryPath(destination, path);
        } else {
          await this.writeFile(destination, path, fileData);
        }
      } catch (error) {
        throw new ExtractionError(
          `Failed to extract ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          path
        );
      }

      processed += fileData.length;

      yield {
        type: 'progress',
        processed,
        total,
        currentFile: path,
      };

      if (options?.onProgress) {
        options.onProgress({
          type: 'progress',
          processed,
          total,
          currentFile: path,
        });
      }
    }
  }

  /**
   * Ensure a directory path exists in the destination.
   */
  private async ensureDirectoryPath(
    root: FileSystemDirectoryHandle,
    path: string
  ): Promise<void> {
    const parts = path.split('/').filter((p) => p.length > 0);
    let current = root;

    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: true });
    }
  }

  /**
   * Write a file to the destination directory.
   */
  private async writeFile(
    root: FileSystemDirectoryHandle,
    path: string,
    data: Uint8Array
  ): Promise<void> {
    const parts = path.split('/');
    const filename = parts.pop();

    if (!filename) {
      throw new Error(`Invalid file path: ${path}`);
    }

    // Navigate to parent directory, creating as needed
    let current = root;
    for (const part of parts) {
      if (part.length > 0) {
        current = await current.getDirectoryHandle(part, { create: true });
      }
    }

    // Write the file
    const fileHandle = await current.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data as unknown as FileSystemWriteChunkType);
    await writable.close();
  }
}

/**
 * Create a ZIP archive from files.
 */
export async function createZip(
  files: Record<string, Uint8Array>,
  options?: { compressionLevel?: number }
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const level = options?.compressionLevel ?? 6;

    // Convert files to fflate format with compression options
    const zipInput: fflate.AsyncZippable = {};
    for (const [path, data] of Object.entries(files)) {
      zipInput[path] = [data, { level: level as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }];
    }

    fflate.zip(zipInput, (err, result) => {
      if (err) {
        reject(new Error(`Failed to create ZIP: ${err.message}`));
        return;
      }
      resolve(result);
    });
  });
}
