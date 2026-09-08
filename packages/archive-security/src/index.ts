/**
 * @zipkit/archive-security
 *
 * Security scanning package for ZipKit.
 * Detects malicious archives, path traversal attacks, archive bombs, and dangerous file types.
 */

// Main scanner
export { ArchiveSecurityScanner } from './scanner.js';

// Types
export type {
  RiskLevel,
  SecurityIssueType,
  SecurityIssue,
  SecurityReport,
  SecurityScanOptions,
} from './types.js';

// Individual scanners (for advanced usage)
export { PathScanner } from './scanners/path-scanner.js';
export { ExpansionScanner } from './scanners/expansion-scanner.js';
export { ContentScanner } from './scanners/content-scanner.js';
export { StructureScanner } from './scanners/structure-scanner.js';

// Path validation utilities (for use during extraction)
export {
  normalizePath,
  sanitizePath,
  isPathSafe,
  validatePath,
  joinPathSafe,
} from './validators/path-validator.js';
