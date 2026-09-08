/**
 * Path validation utilities for safe archive extraction.
 * These utilities ensure paths are safe before writing to disk.
 */

/**
 * Normalize a path for consistent processing.
 * Converts backslashes to forward slashes, removes duplicate slashes,
 * and resolves relative path components.
 *
 * @param path - The path to normalize
 * @returns Normalized path
 */
export function normalizePath(path: string): string {
  // Convert backslashes to forward slashes
  let normalized = path.replace(/\\/g, '/');

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Remove leading slash
  if (normalized.startsWith('/')) {
    normalized = normalized.slice(1);
  }

  // Remove trailing slash (unless it's just "/")
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // Resolve . and .. components safely
  const segments: string[] = [];
  for (const segment of normalized.split('/')) {
    if (segment === '' || segment === '.') {
      // Skip empty and current directory references
      continue;
    }

    if (segment === '..') {
      // Parent directory reference - only pop if we have segments
      // This prevents escaping the base directory
      if (segments.length > 0) {
        segments.pop();
      }
    } else {
      segments.push(segment);
    }
  }

  return segments.join('/');
}

/**
 * Sanitize a path by removing dangerous components.
 * This is more aggressive than normalizePath and should be used
 * when dealing with untrusted input.
 *
 * @param path - The path to sanitize
 * @returns Sanitized path
 */
export function sanitizePath(path: string): string {
  // First normalize the path
  let sanitized = normalizePath(path);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove any remaining absolute path markers
  sanitized = sanitized.replace(/^[a-zA-Z]:/, ''); // Windows drive letters
  sanitized = sanitized.replace(/^\/+/, ''); // Leading slashes

  // Ensure the path doesn't start with . or ..
  while (sanitized.startsWith('./') || sanitized.startsWith('../')) {
    sanitized = sanitized.replace(/^\.\.?\//, '');
  }

  // If path is exactly . or .., return empty string
  if (sanitized === '.' || sanitized === '..') {
    sanitized = '';
  }

  return sanitized;
}

/**
 * Check if a path is safe for extraction to a destination.
 * A path is safe if it doesn't attempt to escape the destination directory
 * and doesn't contain dangerous patterns.
 *
 * @param path - The entry path to validate
 * @param destinationBase - The base destination directory path
 * @returns True if the path is safe, false otherwise
 */
export function isPathSafe(path: string, destinationBase: string): boolean {
  // Sanitize the path
  const sanitized = sanitizePath(path);

  // Empty paths are not safe
  if (!sanitized) {
    return false;
  }

  // Check for null bytes
  if (path.includes('\0')) {
    return false;
  }

  // Check for absolute paths
  if (path.startsWith('/') || /^[a-zA-Z]:/.test(path) || path.startsWith('\\\\')) {
    return false;
  }

  // Check for parent directory traversal
  if (path.includes('../') || path.includes('..\\')) {
    return false;
  }

  // Check path segments for exactly ".."
  const segments = path.split(/[/\\]/);
  if (segments.some((seg) => seg === '..')) {
    return false;
  }

  // Normalize both paths for comparison
  const normalizedPath = normalizePath(path);
  const normalizedBase = normalizePath(destinationBase);

  // Construct the full destination path
  const fullPath = normalizedBase ? `${normalizedBase}/${normalizedPath}` : normalizedPath;

  // Ensure the full path starts with the base (no escape)
  if (normalizedBase && !fullPath.startsWith(normalizedBase)) {
    return false;
  }

  return true;
}

/**
 * Validate a path before extraction.
 * Throws an error if the path is unsafe.
 *
 * @param path - The entry path to validate
 * @param destinationBase - The base destination directory path
 * @throws Error if the path is unsafe
 */
export function validatePath(path: string, destinationBase: string): void {
  if (!isPathSafe(path, destinationBase)) {
    throw new Error(
      `Unsafe path detected: "${path}". Path would escape destination directory or contains dangerous patterns.`
    );
  }
}

/**
 * Join path segments safely, ensuring no traversal.
 *
 * @param segments - Path segments to join
 * @returns Joined and normalized path
 */
export function joinPathSafe(...segments: string[]): string {
  // Filter out empty segments
  const filtered = segments.filter((seg) => seg);

  if (filtered.length === 0) {
    return '';
  }

  // Join with / and normalize
  const joined = filtered.join('/');
  return normalizePath(joined);
}
