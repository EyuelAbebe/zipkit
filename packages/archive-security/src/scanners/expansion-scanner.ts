import type { ArchiveEntry } from '@zipkit/archive-core';
import type { SecurityIssue, SecurityScanOptions } from '../types.js';

/**
 * Default configuration values.
 */
const DEFAULT_MAX_EXPANSION_RATIO = 1000;
const DEFAULT_WARNING_EXPANSION_RATIO = 100;
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const DEFAULT_MAX_FILE_COUNT = 100000;
const DEFAULT_WARNING_FILE_COUNT = 10000;

/**
 * Scans archives for expansion-related threats (zip bombs).
 */
export class ExpansionScanner {
  private options: Required<
    Pick<
      SecurityScanOptions,
      | 'maxExpansionRatio'
      | 'warningExpansionRatio'
      | 'maxFileSize'
      | 'maxFileCount'
      | 'warningFileCount'
    >
  >;

  constructor(options?: SecurityScanOptions) {
    this.options = {
      maxExpansionRatio: options?.maxExpansionRatio ?? DEFAULT_MAX_EXPANSION_RATIO,
      warningExpansionRatio: options?.warningExpansionRatio ?? DEFAULT_WARNING_EXPANSION_RATIO,
      maxFileSize: options?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE,
      maxFileCount: options?.maxFileCount ?? DEFAULT_MAX_FILE_COUNT,
      warningFileCount: options?.warningFileCount ?? DEFAULT_WARNING_FILE_COUNT,
    };
  }

  /**
   * Scan entries for expansion-related security issues.
   */
  scan(entries: ArchiveEntry[], totalCompressedSize: number): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Calculate overall expansion ratio
    const totalUncompressed = entries.reduce((sum, entry) => sum + entry.size, 0);
    const expansionRatio = totalCompressedSize > 0 ? totalUncompressed / totalCompressedSize : 0;

    // Check overall expansion ratio
    if (expansionRatio > this.options.maxExpansionRatio) {
      issues.push({
        type: 'high-expansion',
        severity: 'danger',
        entry: '<archive>',
        message: `Extremely high expansion ratio (${expansionRatio.toFixed(1)}:1) indicates potential zip bomb`,
        details: {
          expansionRatio: Math.round(expansionRatio * 10) / 10,
          totalCompressedSize,
          totalUncompressedSize: totalUncompressed,
          threshold: this.options.maxExpansionRatio,
        },
      });
    } else if (expansionRatio > this.options.warningExpansionRatio) {
      issues.push({
        type: 'high-expansion',
        severity: 'warning',
        entry: '<archive>',
        message: `High expansion ratio (${expansionRatio.toFixed(1)}:1) may indicate compressed archive`,
        details: {
          expansionRatio: Math.round(expansionRatio * 10) / 10,
          totalCompressedSize,
          totalUncompressedSize: totalUncompressed,
          threshold: this.options.warningExpansionRatio,
        },
      });
    }

    // Check for individual large files
    for (const entry of entries) {
      if (entry.size > this.options.maxFileSize) {
        issues.push({
          type: 'high-expansion',
          severity: 'danger',
          entry: entry.path,
          message: `File is extremely large (${this.formatSize(entry.size)}) when uncompressed`,
          details: {
            uncompressedSize: entry.size,
            compressedSize: entry.compressedSize,
            maxFileSize: this.options.maxFileSize,
          },
        });
      }

      // Check individual file expansion ratio
      const fileExpansionRatio = entry.compressedSize > 0 ? entry.size / entry.compressedSize : 0;
      if (fileExpansionRatio > this.options.maxExpansionRatio) {
        issues.push({
          type: 'high-expansion',
          severity: 'danger',
          entry: entry.path,
          message: `File has extreme expansion ratio (${fileExpansionRatio.toFixed(1)}:1)`,
          details: {
            expansionRatio: Math.round(fileExpansionRatio * 10) / 10,
            compressedSize: entry.compressedSize,
            uncompressedSize: entry.size,
          },
        });
      }
    }

    // Check total file count (zip bomb pattern)
    const fileCount = entries.filter((e) => !e.isDirectory).length;
    if (fileCount > this.options.maxFileCount) {
      issues.push({
        type: 'high-expansion',
        severity: 'danger',
        entry: '<archive>',
        message: `Archive contains extremely many files (${fileCount.toLocaleString()}) which may indicate zip bomb`,
        details: {
          fileCount,
          threshold: this.options.maxFileCount,
        },
      });
    } else if (fileCount > this.options.warningFileCount) {
      issues.push({
        type: 'high-expansion',
        severity: 'warning',
        entry: '<archive>',
        message: `Archive contains many files (${fileCount.toLocaleString()})`,
        details: {
          fileCount,
          threshold: this.options.warningFileCount,
        },
      });
    }

    return issues;
  }

  /**
   * Format byte size to human-readable string.
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
