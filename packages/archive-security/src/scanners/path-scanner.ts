import type { ArchiveEntry } from '@zipkit/archive-core';
import type { SecurityIssue } from '../types.js';

/**
 * Scans archive entry paths for security issues.
 */
export class PathScanner {
  private seenPaths = new Map<string, string>(); // normalized -> original
  private seenLowerPaths = new Map<string, string>(); // lowercase -> original

  /**
   * Scan all entry paths for security issues.
   */
  scan(entries: ArchiveEntry[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const entry of entries) {
      issues.push(...this.scanEntry(entry));
    }

    return issues;
  }

  /**
   * Scan a single entry for path-related security issues.
   */
  private scanEntry(entry: ArchiveEntry): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const { path } = entry;

    // Check for null bytes
    if (path.includes('\0')) {
      issues.push({
        type: 'null-byte',
        severity: 'danger',
        entry: path,
        message: 'Path contains null byte which can be used to bypass security checks',
        details: { path },
      });
    }

    // Check for path traversal
    const traversalIssue = this.checkPathTraversal(path);
    if (traversalIssue) {
      issues.push(traversalIssue);
    }

    // Check for absolute paths
    const absoluteIssue = this.checkAbsolutePath(path);
    if (absoluteIssue) {
      issues.push(absoluteIssue);
    }

    // Check for suspicious patterns
    const suspiciousIssue = this.checkSuspiciousPattern(path);
    if (suspiciousIssue) {
      issues.push(suspiciousIssue);
    }

    // Check for duplicate paths
    const duplicateIssue = this.checkDuplicatePath(path);
    if (duplicateIssue) {
      issues.push(duplicateIssue);
    }

    // Check for case conflicts
    const caseConflictIssue = this.checkCaseConflict(path);
    if (caseConflictIssue) {
      issues.push(caseConflictIssue);
    }

    return issues;
  }

  /**
   * Check for path traversal sequences.
   */
  private checkPathTraversal(path: string): SecurityIssue | null {
    // Check for ../ or ..\\ sequences
    if (path.includes('../') || path.includes('..\\')) {
      return {
        type: 'path-traversal',
        severity: 'danger',
        entry: path,
        message:
          'Path contains directory traversal sequence that could escape extraction directory',
        details: { path },
      };
    }

    // Check for encoded traversal sequences
    const encodedPatterns = [
      '%2e%2e/', // URL encoded ../
      '%2e%2e\\', // URL encoded ..\
      '..%2f', // Partially encoded
      '..%5c', // Partially encoded
      '%252e%252e/', // Double encoded
    ];

    for (const pattern of encodedPatterns) {
      if (path.toLowerCase().includes(pattern)) {
        return {
          type: 'path-traversal',
          severity: 'danger',
          entry: path,
          message: 'Path contains encoded directory traversal sequence',
          details: { path, pattern },
        };
      }
    }

    // Check for path segments that are exactly ".."
    const segments = path.split(/[/\\]/);
    if (segments.some((seg) => seg === '..')) {
      return {
        type: 'path-traversal',
        severity: 'danger',
        entry: path,
        message: 'Path contains parent directory reference',
        details: { path },
      };
    }

    return null;
  }

  /**
   * Check for absolute paths.
   */
  private checkAbsolutePath(path: string): SecurityIssue | null {
    // Unix absolute path
    if (path.startsWith('/')) {
      return {
        type: 'absolute-path',
        severity: 'danger',
        entry: path,
        message: 'Path is absolute (starts with /) which could overwrite system files',
        details: { path },
      };
    }

    // Windows absolute path with drive letter (C:, D:, etc.)
    if (/^[a-zA-Z]:/.test(path)) {
      return {
        type: 'absolute-path',
        severity: 'danger',
        entry: path,
        message: 'Path contains Windows drive letter which could overwrite system files',
        details: { path },
      };
    }

    // Windows UNC path (\\server\share)
    if (path.startsWith('\\\\') || path.startsWith('//')) {
      return {
        type: 'absolute-path',
        severity: 'danger',
        entry: path,
        message: 'Path is UNC network path which is not allowed',
        details: { path },
      };
    }

    return null;
  }

  /**
   * Check for suspicious file patterns.
   */
  private checkSuspiciousPattern(path: string): SecurityIssue | null {
    // Hidden files (starting with .)
    const fileName = path.split(/[/\\]/).pop() || '';
    if (fileName.startsWith('.') && fileName !== '.' && fileName !== '..') {
      // This is just a warning, hidden files can be legitimate
      return {
        type: 'suspicious-pattern',
        severity: 'warning',
        entry: path,
        message: 'Path contains hidden file (starts with dot)',
        details: { path, fileName },
      };
    }

    // System directories (case-insensitive)
    const lowerPath = path.toLowerCase();
    const dangerousPatterns = [
      '/system32/',
      '/windows/',
      '/system/',
      '/boot/',
      '/etc/',
      '/usr/bin/',
      '/usr/sbin/',
      '/sbin/',
      '\\system32\\',
      '\\windows\\',
      '\\system\\',
    ];

    for (const pattern of dangerousPatterns) {
      if (lowerPath.includes(pattern)) {
        return {
          type: 'suspicious-pattern',
          severity: 'warning',
          entry: path,
          message: 'Path references system directory',
          details: { path, pattern },
        };
      }
    }

    return null;
  }

  /**
   * Check for duplicate paths.
   */
  private checkDuplicatePath(path: string): SecurityIssue | null {
    const normalized = this.normalizePath(path);

    if (this.seenPaths.has(normalized)) {
      const original = this.seenPaths.get(normalized)!;
      return {
        type: 'duplicate-path',
        severity: 'warning',
        entry: path,
        message: 'Duplicate path detected (same file appears multiple times)',
        details: { path, duplicate: original },
      };
    }

    this.seenPaths.set(normalized, path);
    return null;
  }

  /**
   * Check for case conflicts (paths that differ only in case).
   */
  private checkCaseConflict(path: string): SecurityIssue | null {
    const normalized = this.normalizePath(path);
    const lower = normalized.toLowerCase();

    if (this.seenLowerPaths.has(lower)) {
      const existing = this.seenLowerPaths.get(lower)!;
      const existingNormalized = this.normalizePath(existing);

      // Only flag if they're actually different paths (not duplicates)
      if (normalized !== existingNormalized) {
        return {
          type: 'case-conflict',
          severity: 'warning',
          entry: path,
          message:
            'Path differs only in case from another entry (may cause issues on case-insensitive filesystems)',
          details: { path, conflictsWith: existing },
        };
      }
    }

    this.seenLowerPaths.set(lower, path);
    return null;
  }

  /**
   * Normalize a path for comparison.
   */
  private normalizePath(path: string): string {
    // Convert backslashes to forward slashes
    let normalized = path.replace(/\\/g, '/');

    // Remove duplicate slashes
    normalized = normalized.replace(/\/+/g, '/');

    // Remove trailing slash (unless it's the root)
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }
}
