import type { ArchiveEntry, ArchiveMetadata } from '@zipkit/archive-core';
import type { SecurityReport, SecurityScanOptions, RiskLevel } from './types.js';
import { PathScanner } from './scanners/path-scanner.js';
import { ExpansionScanner } from './scanners/expansion-scanner.js';
import { ContentScanner } from './scanners/content-scanner.js';
import { StructureScanner } from './scanners/structure-scanner.js';

/**
 * Main security scanner that orchestrates all individual scanners.
 * Provides comprehensive security analysis of archive files.
 */
export class ArchiveSecurityScanner {
  private pathScanner: PathScanner;
  private expansionScanner: ExpansionScanner;
  private contentScanner: ContentScanner;
  private structureScanner: StructureScanner;

  constructor(options?: SecurityScanOptions) {
    this.pathScanner = new PathScanner();
    this.expansionScanner = new ExpansionScanner(options);
    this.contentScanner = new ContentScanner();
    this.structureScanner = new StructureScanner(options);
  }

  /**
   * Scan an archive for security issues.
   *
   * @param entries - Array of archive entries to scan
   * @param metadata - Archive metadata containing format and size information
   * @returns Security report with overall risk level, issues, and statistics
   */
  async scan(entries: ArchiveEntry[], metadata: ArchiveMetadata): Promise<SecurityReport> {
    // Run all scanners
    const pathIssues = this.pathScanner.scan(entries);
    const expansionIssues = this.expansionScanner.scan(entries, metadata.totalCompressedSize);
    const contentIssues = this.contentScanner.scan(entries);
    const structureIssues = this.structureScanner.scan(entries);

    // Combine all issues
    const allIssues = [...pathIssues, ...expansionIssues, ...contentIssues, ...structureIssues];

    // Calculate overall risk level
    const overall = this.calculateOverallRisk(allIssues);

    // Calculate statistics
    const stats = this.calculateStats(entries, metadata);

    return {
      overall,
      issues: allIssues,
      stats,
    };
  }

  /**
   * Calculate overall risk level based on individual issues.
   */
  private calculateOverallRisk(issues: SecurityReport['issues']): RiskLevel {
    // If any issue is danger, overall is danger
    if (issues.some((issue) => issue.severity === 'danger')) {
      return 'danger';
    }

    // If any issue is warning, overall is warning
    if (issues.some((issue) => issue.severity === 'warning')) {
      return 'warning';
    }

    // Otherwise, safe
    return 'safe';
  }

  /**
   * Calculate comprehensive statistics about the archive.
   */
  private calculateStats(
    entries: ArchiveEntry[],
    metadata: ArchiveMetadata
  ): SecurityReport['stats'] {
    // Calculate expansion ratio
    const expansionRatio =
      metadata.totalCompressedSize > 0 ? metadata.totalSize / metadata.totalCompressedSize : 0;

    // Calculate max directory depth
    const maxDepth = Math.max(...entries.map((e) => this.calculateDepth(e.path)), 0);

    // Count executables (files with executable extensions or scripts)
    const executableCount = this.countExecutables(entries);

    // Count nested archives
    const nestedArchives = this.countNestedArchives(entries);

    return {
      totalEntries: metadata.totalEntries,
      compressedSize: metadata.totalCompressedSize,
      uncompressedSize: metadata.totalSize,
      expansionRatio: Math.round(expansionRatio * 10) / 10,
      maxDepth,
      executableCount,
      nestedArchives,
    };
  }

  /**
   * Calculate the directory depth of a path.
   */
  private calculateDepth(path: string): number {
    const normalized = path.replace(/\\/g, '/');
    const trimmed = normalized.replace(/^\/+|\/+$/g, '');

    if (!trimmed) {
      return 0;
    }

    const segments = trimmed.split('/').filter((seg) => seg && seg !== '.');
    return segments.length;
  }

  /**
   * Count executable files (executables, scripts, macro documents).
   */
  private countExecutables(entries: ArchiveEntry[]): number {
    const executableExtensions = [
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
      '.sh',
      '.bash',
      '.ps1',
      '.py',
      '.rb',
      '.pl',
      '.js',
      '.vbs',
      '.jar',
      '.docm',
      '.xlsm',
      '.pptm',
    ];

    return entries.filter((entry) => {
      if (entry.isDirectory) {
        return false;
      }

      const lowerPath = entry.path.toLowerCase();
      return executableExtensions.some((ext) => lowerPath.endsWith(ext));
    }).length;
  }

  /**
   * Count nested archive files.
   */
  private countNestedArchives(entries: ArchiveEntry[]): number {
    const archiveExtensions = [
      '.zip',
      '.tar',
      '.gz',
      '.tgz',
      '.bz2',
      '.tbz2',
      '.xz',
      '.7z',
      '.rar',
    ];

    return entries.filter((entry) => {
      if (entry.isDirectory) {
        return false;
      }

      const lowerPath = entry.path.toLowerCase();
      return archiveExtensions.some((ext) => lowerPath.endsWith(ext));
    }).length;
  }
}
