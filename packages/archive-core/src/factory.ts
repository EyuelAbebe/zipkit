import type { ArchiveAdapter } from './types.js';
import { UnsupportedFormatError } from './types.js';
import { ZipAdapter } from './adapters/zip-adapter.js';
import { TarAdapter } from './adapters/tar-adapter.js';
import { GzipAdapter } from './adapters/gzip-adapter.js';

/**
 * File signatures (magic numbers) for archive format detection.
 */
const SIGNATURES = {
  ZIP: [0x50, 0x4b, 0x03, 0x04], // PK\x03\x04
  ZIP_EMPTY: [0x50, 0x4b, 0x05, 0x06], // PK\x05\x06 (empty archive)
  ZIP_SPANNED: [0x50, 0x4b, 0x07, 0x08], // PK\x07\x08 (spanned archive)
  GZIP: [0x1f, 0x8b], // \x1f\x8b
  TAR_USTAR: 'ustar', // At offset 257
} as const;

/**
 * Detect archive format from file signature.
 */
async function detectFormat(file: File): Promise<'zip' | 'tar' | 'gzip' | 'tar.gz'> {
  // Read first 512 bytes for detection
  const headerSize = Math.min(512, file.size);
  const header = new Uint8Array(await file.slice(0, headerSize).arrayBuffer());

  // Check for ZIP signature
  if (
    header.length >= 4 &&
    (matchesSignature(header, SIGNATURES.ZIP) ||
      matchesSignature(header, SIGNATURES.ZIP_EMPTY) ||
      matchesSignature(header, SIGNATURES.ZIP_SPANNED))
  ) {
    return 'zip';
  }

  // Check for GZIP signature
  if (header.length >= 2 && matchesSignature(header, SIGNATURES.GZIP)) {
    // Could be .gz or .tar.gz - check file extension as hint
    const name = file.name.toLowerCase();
    if (name.endsWith('.tar.gz') || name.endsWith('.tgz')) {
      return 'tar.gz';
    }
    return 'gzip';
  }

  // Check for TAR signature (ustar at offset 257)
  if (header.length >= 262) {
    const decoder = new TextDecoder('ascii');
    const ustarMagic = decoder.decode(header.slice(257, 262));
    if (ustarMagic === SIGNATURES.TAR_USTAR) {
      return 'tar';
    }
  }

  // Fall back to file extension detection
  const name = file.name.toLowerCase();
  if (name.endsWith('.zip')) return 'zip';
  if (name.endsWith('.tar')) return 'tar';
  if (name.endsWith('.tar.gz') || name.endsWith('.tgz')) return 'tar.gz';
  if (name.endsWith('.gz')) return 'gzip';

  throw new UnsupportedFormatError(`Unable to detect archive format for file: ${file.name}`);
}

/**
 * Check if buffer matches a signature.
 */
function matchesSignature(buffer: Uint8Array, signature: readonly number[] | string): boolean {
  if (typeof signature === 'string') {
    const decoder = new TextDecoder('ascii');
    const str = decoder.decode(buffer);
    return str.includes(signature);
  }

  if (buffer.length < signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Create an appropriate adapter for the given archive file.
 * Automatically detects the format based on file signature.
 *
 * @param file The archive file to process
 * @returns An adapter instance for the detected format
 * @throws {UnsupportedFormatError} If the format cannot be detected or is not supported
 */
export async function createAdapter(file: File): Promise<ArchiveAdapter> {
  const format = await detectFormat(file);

  switch (format) {
    case 'zip':
      return new ZipAdapter(file);

    case 'tar':
      return new TarAdapter(file);

    case 'gzip':
      return new GzipAdapter(file, false);

    case 'tar.gz':
      return new GzipAdapter(file, true);

    default:
      throw new UnsupportedFormatError(`Unsupported format: ${format}`);
  }
}

/**
 * Create an adapter for a specific format without auto-detection.
 *
 * @param file The archive file to process
 * @param format The archive format
 * @returns An adapter instance for the specified format
 */
export function createAdapterForFormat(
  file: File,
  format: 'zip' | 'tar' | 'gzip' | 'tar.gz'
): ArchiveAdapter {
  switch (format) {
    case 'zip':
      return new ZipAdapter(file);

    case 'tar':
      return new TarAdapter(file);

    case 'gzip':
      return new GzipAdapter(file, false);

    case 'tar.gz':
      return new GzipAdapter(file, true);

    default:
      throw new UnsupportedFormatError(`Unsupported format: ${format}`);
  }
}
