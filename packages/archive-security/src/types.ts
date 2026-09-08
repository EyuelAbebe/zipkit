/**
 * Security risk level for archive entries and overall archive.
 */
export type RiskLevel = 'safe' | 'warning' | 'danger';

/**
 * Types of security issues that can be detected in archives.
 */
export type SecurityIssueType =
  | 'path-traversal'
  | 'absolute-path'
  | 'high-expansion'
  | 'executable'
  | 'nested-archive'
  | 'deep-directory'
  | 'symlink-escape'
  | 'null-byte'
  | 'suspicious-pattern'
  | 'duplicate-path'
  | 'case-conflict'
  | 'long-path'
  | 'too-many-files'
  | 'hardlink';

/**
 * Represents a single security issue found in an archive.
 */
export interface SecurityIssue {
  /** Type of security issue */
  type: SecurityIssueType;
  /** Severity level of the issue */
  severity: RiskLevel;
  /** Path of the affected entry */
  entry: string;
  /** Human-readable message describing the issue */
  message: string;
  /** Additional details about the issue */
  details?: Record<string, unknown>;
}

/**
 * Comprehensive security report for an archive.
 */
export interface SecurityReport {
  /** Overall risk assessment of the archive */
  overall: RiskLevel;
  /** List of all security issues found */
  issues: SecurityIssue[];
  /** Statistical information about the archive */
  stats: {
    /** Total number of entries in the archive */
    totalEntries: number;
    /** Total compressed size in bytes */
    compressedSize: number;
    /** Total uncompressed size in bytes */
    uncompressedSize: number;
    /** Compression expansion ratio (uncompressed/compressed) */
    expansionRatio: number;
    /** Maximum directory depth found */
    maxDepth: number;
    /** Number of executable files found */
    executableCount: number;
    /** Number of nested archives found */
    nestedArchives: number;
  };
}

/**
 * Configuration options for security scanning.
 */
export interface SecurityScanOptions {
  /** Maximum allowed expansion ratio before flagging as danger (default: 1000) */
  maxExpansionRatio?: number;
  /** Expansion ratio threshold for warning (default: 100) */
  warningExpansionRatio?: number;
  /** Maximum allowed directory depth before flagging as danger (default: 100) */
  maxDirectoryDepth?: number;
  /** Directory depth threshold for warning (default: 50) */
  warningDirectoryDepth?: number;
  /** Maximum number of files before flagging as danger (default: 100000) */
  maxFileCount?: number;
  /** File count threshold for warning (default: 10000) */
  warningFileCount?: number;
  /** Maximum uncompressed file size in bytes before flagging (default: 10GB) */
  maxFileSize?: number;
  /** Maximum path length in characters before flagging (default: 260 for Windows) */
  maxPathLength?: number;
}
