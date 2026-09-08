import type { ArchiveEntry } from '@zipkit/archive-core';
import type { SecurityIssue, SecurityScanOptions } from '../types.js';

/**
 * Default configuration values.
 */
const DEFAULT_MAX_DIRECTORY_DEPTH = 100;
const DEFAULT_WARNING_DIRECTORY_DEPTH = 50;
const DEFAULT_MAX_PATH_LENGTH = 260; // Windows MAX_PATH limit

/**
 * Scans archive structure for security issues.
 */
export class StructureScanner {
  private options: Required<
    Pick<SecurityScanOptions, 'maxDirectoryDepth' | 'warningDirectoryDepth' | 'maxPathLength'>
  >;

  constructor(options?: SecurityScanOptions) {
    this.options = {
      maxDirectoryDepth: options?.maxDirectoryDepth ?? DEFAULT_MAX_DIRECTORY_DEPTH,
      warningDirectoryDepth: options?.warningDirectoryDepth ?? DEFAULT_WARNING_DIRECTORY_DEPTH,
      maxPathLength: options?.maxPathLength ?? DEFAULT_MAX_PATH_LENGTH,
    };
  }

  /**
   * Scan entries for structure-related security issues.
   */
  scan(entries: ArchiveEntry[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    let maxDepth = 0;

    for (const entry of entries) {
      // Calculate directory depth
      const depth = this.calculateDepth(entry.path);
      maxDepth = Math.max(maxDepth, depth);

      // Check individual entry depth
      if (depth > this.options.maxDirectoryDepth) {
        issues.push({
          type: 'deep-directory',
          severity: 'danger',
          entry: entry.path,
          message: `Path is extremely deep (${depth} levels) which may indicate malicious structure`,
          details: {
            depth,
            threshold: this.options.maxDirectoryDepth,
          },
        });
      } else if (depth > this.options.warningDirectoryDepth) {
        issues.push({
          type: 'deep-directory',
          severity: 'warning',
          entry: entry.path,
          message: `Path is very deep (${depth} levels)`,
          details: {
            depth,
            threshold: this.options.warningDirectoryDepth,
          },
        });
      }

      // Check path length
      const pathLength = entry.path.length;
      if (pathLength > this.options.maxPathLength) {
        issues.push({
          type: 'long-path',
          severity: 'warning',
          entry: entry.path,
          message: `Path is very long (${pathLength} characters) and may exceed OS limits`,
          details: {
            pathLength,
            threshold: this.options.maxPathLength,
          },
        });
      }
    }

    return issues;
  }

  /**
   * Calculate the directory depth of a path.
   */
  private calculateDepth(path: string): number {
    // Normalize path separators
    const normalized = path.replace(/\\/g, '/');

    // Remove leading/trailing slashes
    const trimmed = normalized.replace(/^\/+|\/+$/g, '');

    // Empty path has depth 0
    if (!trimmed) {
      return 0;
    }

    // Count path segments
    const segments = trimmed.split('/');

    // Filter out empty segments and current directory references
    const validSegments = segments.filter((seg) => seg && seg !== '.');

    return validSegments.length;
  }
}
