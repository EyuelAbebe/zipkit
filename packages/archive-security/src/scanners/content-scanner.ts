import type { ArchiveEntry } from '@zipkit/archive-core';
import type { SecurityIssue } from '../types.js';

/**
 * File extensions for different dangerous file types.
 */
const EXECUTABLE_EXTENSIONS = [
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.app',
  '.cmd',
  '.bat',
  '.com',
  '.msi',
  '.scr',
  '.cpl',
  '.ocx',
  '.sys',
  '.drv',
];

const SCRIPT_EXTENSIONS = [
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.ps1',
  '.py',
  '.rb',
  '.pl',
  '.js',
  '.vbs',
  '.vbe',
  '.wsf',
  '.wsh',
  '.jar',
];

const MACRO_EXTENSIONS = [
  '.doc',
  '.docm',
  '.xls',
  '.xlsm',
  '.ppt',
  '.pptm',
  '.docx',
  '.xlsx',
  '.pptx',
];

const ARCHIVE_EXTENSIONS = [
  '.zip',
  '.tar',
  '.gz',
  '.tgz',
  '.bz2',
  '.tbz2',
  '.xz',
  '.7z',
  '.rar',
  '.iso',
  '.dmg',
];

/**
 * Scans archive content for dangerous file types.
 */
export class ContentScanner {
  /**
   * Scan entries for dangerous content types.
   */
  scan(entries: ArchiveEntry[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const entry of entries) {
      // Skip directories
      if (entry.isDirectory) {
        continue;
      }

      const lowerPath = entry.path.toLowerCase();

      // Check for executables
      if (this.hasExtension(lowerPath, EXECUTABLE_EXTENSIONS)) {
        issues.push({
          type: 'executable',
          severity: 'warning',
          entry: entry.path,
          message: 'Archive contains executable file',
          details: {
            extension: this.getExtension(entry.path),
            size: entry.size,
          },
        });
      }

      // Check for scripts
      if (this.hasExtension(lowerPath, SCRIPT_EXTENSIONS)) {
        issues.push({
          type: 'executable',
          severity: 'warning',
          entry: entry.path,
          message: 'Archive contains script file that could execute code',
          details: {
            extension: this.getExtension(entry.path),
            size: entry.size,
          },
        });
      }

      // Check for macro-enabled documents
      if (this.hasExtension(lowerPath, MACRO_EXTENSIONS)) {
        const macroEnabled = lowerPath.endsWith('m'); // docm, xlsm, pptm
        if (macroEnabled) {
          issues.push({
            type: 'executable',
            severity: 'warning',
            entry: entry.path,
            message: 'Archive contains macro-enabled document that could execute code',
            details: {
              extension: this.getExtension(entry.path),
              size: entry.size,
            },
          });
        }
      }

      // Check for nested archives
      if (this.hasExtension(lowerPath, ARCHIVE_EXTENSIONS)) {
        issues.push({
          type: 'nested-archive',
          severity: 'warning',
          entry: entry.path,
          message: 'Archive contains nested archive file',
          details: {
            extension: this.getExtension(entry.path),
            size: entry.size,
            compressedSize: entry.compressedSize,
          },
        });
      }

      // Check for symlinks (TAR archives)
      if (this.isSymlink(entry)) {
        issues.push({
          type: 'symlink-escape',
          severity: 'warning',
          entry: entry.path,
          message: 'Archive contains symbolic link that may point outside extraction directory',
          details: {
            path: entry.path,
          },
        });
      }

      // Check for hardlinks (TAR archives)
      if (this.isHardlink(entry)) {
        issues.push({
          type: 'hardlink',
          severity: 'warning',
          entry: entry.path,
          message: 'Archive contains hard link',
          details: {
            path: entry.path,
          },
        });
      }
    }

    return issues;
  }

  /**
   * Check if a path has one of the specified extensions.
   */
  private hasExtension(lowerPath: string, extensions: string[]): boolean {
    return extensions.some((ext) => lowerPath.endsWith(ext));
  }

  /**
   * Get the file extension from a path.
   */
  private getExtension(path: string): string {
    const match = path.match(/\.[^./\\]+$/);
    return match ? match[0] : '';
  }

  /**
   * Check if an entry is a symbolic link.
   * This is determined by the compression method or other metadata.
   * For TAR files, symlinks typically have specific indicators.
   */
  private isSymlink(entry: ArchiveEntry): boolean {
    // In TAR archives, symlinks are often indicated by compression method or flags
    // This is a heuristic - proper implementation would check TAR entry type
    return (
      entry.compressionMethod === 'symlink' || entry.compressionMethod?.includes('link') || false
    );
  }

  /**
   * Check if an entry is a hard link.
   */
  private isHardlink(entry: ArchiveEntry): boolean {
    // Similar to symlinks, this would need proper TAR entry type checking
    return entry.compressionMethod === 'hardlink' || false;
  }
}
