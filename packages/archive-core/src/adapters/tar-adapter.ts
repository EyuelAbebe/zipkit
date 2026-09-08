import type {
  ArchiveAdapter,
  ArchiveEntry,
  ArchiveMetadata,
  ExtractOptions,
  ProgressEvent,
} from '../types.js';
import {
  ExtractionError,
  OperationCancelledError,
} from '../types.js';

/**
 * TAR header structure (POSIX ustar format).
 * TAR files consist of 512-byte headers followed by file data.
 */
interface TarHeader {
  name: string;
  mode: string;
  uid: string;
  gid: string;
  size: number;
  mtime: number;
  checksum: string;
  typeflag: string;
  linkname: string;
  magic: string;
  version: string;
  uname: string;
  gname: string;
  devmajor: string;
  devminor: string;
  prefix: string;
}

/**
 * TAR archive adapter with custom parser.
 * Supports POSIX ustar TAR format.
 */
export class TarAdapter implements ArchiveAdapter {
  private file: File;
  private tarData: Uint8Array | null = null;

  constructor(file: File) {
    this.file = file;
  }

  /**
   * Load the TAR file data into memory.
   */
  private async loadTarData(): Promise<Uint8Array> {
    if (this.tarData) {
      return this.tarData;
    }

    const arrayBuffer = await this.file.arrayBuffer();
    this.tarData = new Uint8Array(arrayBuffer);
    return this.tarData;
  }

  /**
   * Parse a TAR header from a 512-byte block.
   */
  private parseTarHeader(block: Uint8Array): TarHeader | null {
    if (block.length < 512) {
      return null;
    }

    // Check if block is all zeros (end of archive)
    if (block.every((byte) => byte === 0)) {
      return null;
    }

    const decoder = new TextDecoder('ascii');

    // Helper to read null-terminated string
    const readString = (offset: number, length: number): string => {
      const bytes = block.slice(offset, offset + length);
      const nullIndex = bytes.indexOf(0);
      return decoder.decode(bytes.slice(0, nullIndex >= 0 ? nullIndex : length)).trim();
    };

    // Helper to read octal number
    const readOctal = (offset: number, length: number): number => {
      const str = readString(offset, length);
      return str ? parseInt(str, 8) : 0;
    };

    return {
      name: readString(0, 100),
      mode: readString(100, 8),
      uid: readString(108, 8),
      gid: readString(116, 8),
      size: readOctal(124, 12),
      mtime: readOctal(136, 12),
      checksum: readString(148, 8),
      typeflag: readString(156, 1),
      linkname: readString(157, 100),
      magic: readString(257, 6),
      version: readString(263, 2),
      uname: readString(265, 32),
      gname: readString(297, 32),
      devmajor: readString(329, 8),
      devminor: readString(337, 8),
      prefix: readString(345, 155),
    };
  }

  /**
   * Get the full path from TAR header (handles prefix).
   */
  private getFullPath(header: TarHeader): string {
    if (header.prefix) {
      return `${header.prefix}/${header.name}`;
    }
    return header.name;
  }

  /**
   * Inspect the TAR archive and return metadata.
   */
  async inspect(): Promise<ArchiveMetadata> {
    const data = await this.loadTarData();

    let offset = 0;
    let totalEntries = 0;
    let totalSize = 0;

    while (offset < data.length) {
      const headerBlock = data.slice(offset, offset + 512);
      const header = this.parseTarHeader(headerBlock);

      if (!header) {
        break; // End of archive
      }

      totalEntries++;
      totalSize += header.size;

      // Move to next header (skip file data)
      const dataBlocks = Math.ceil(header.size / 512);
      offset += 512 + dataBlocks * 512;
    }

    return {
      format: 'tar',
      totalEntries,
      totalSize,
      totalCompressedSize: totalSize, // TAR doesn't compress
    };
  }

  /**
   * List all entries in the TAR archive.
   */
  async *listEntries(signal?: AbortSignal): AsyncGenerator<ArchiveEntry> {
    const data = await this.loadTarData();
    let offset = 0;

    while (offset < data.length) {
      if (signal?.aborted) {
        throw new OperationCancelledError();
      }

      const headerBlock = data.slice(offset, offset + 512);
      const header = this.parseTarHeader(headerBlock);

      if (!header) {
        break; // End of archive
      }

      const path = this.getFullPath(header);
      const isDirectory = header.typeflag === '5' || path.endsWith('/');

      yield {
        path,
        size: header.size,
        compressedSize: header.size, // TAR doesn't compress
        isDirectory,
        lastModified: new Date(header.mtime * 1000),
        compressionMethod: 'none',
      };

      // Move to next header
      const dataBlocks = Math.ceil(header.size / 512);
      offset += 512 + dataBlocks * 512;
    }
  }

  /**
   * Extract the entire TAR archive to a destination directory.
   */
  async *extract(
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent> {
    const data = await this.loadTarData();
    const signal = options?.signal;

    let offset = 0;
    let processed = 0;
    const total = data.length;

    while (offset < data.length) {
      if (signal?.aborted) {
        throw new OperationCancelledError();
      }

      const headerBlock = data.slice(offset, offset + 512);
      const header = this.parseTarHeader(headerBlock);

      if (!header) {
        break; // End of archive
      }

      const path = this.getFullPath(header);
      const isDirectory = header.typeflag === '5' || path.endsWith('/');
      const dataBlocks = Math.ceil(header.size / 512);

      try {
        if (isDirectory) {
          await this.ensureDirectoryPath(destination, path);
        } else if (header.size > 0) {
          const fileData = data.slice(offset + 512, offset + 512 + header.size);
          await this.writeFile(destination, path, fileData);
        }
      } catch (error) {
        throw new ExtractionError(
          `Failed to extract ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          path
        );
      }

      offset += 512 + dataBlocks * 512;
      processed = offset;

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
   * Extract selected entries from the TAR archive.
   */
  async *extractSelected(
    entries: string[],
    destination: FileSystemDirectoryHandle,
    options?: ExtractOptions
  ): AsyncGenerator<ProgressEvent> {
    const data = await this.loadTarData();
    const signal = options?.signal;
    const entrySet = new Set(entries);

    let offset = 0;
    let processed = 0;
    const total = entries.length;
    let extractedCount = 0;

    while (offset < data.length && extractedCount < entries.length) {
      if (signal?.aborted) {
        throw new OperationCancelledError();
      }

      const headerBlock = data.slice(offset, offset + 512);
      const header = this.parseTarHeader(headerBlock);

      if (!header) {
        break; // End of archive
      }

      const path = this.getFullPath(header);
      const dataBlocks = Math.ceil(header.size / 512);

      if (entrySet.has(path)) {
        const isDirectory = header.typeflag === '5' || path.endsWith('/');

        try {
          if (isDirectory) {
            await this.ensureDirectoryPath(destination, path);
          } else if (header.size > 0) {
            const fileData = data.slice(offset + 512, offset + 512 + header.size);
            await this.writeFile(destination, path, fileData);
          }
        } catch (error) {
          throw new ExtractionError(
            `Failed to extract ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            path
          );
        }

        extractedCount++;
        processed = extractedCount;

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

      offset += 512 + dataBlocks * 512;
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
