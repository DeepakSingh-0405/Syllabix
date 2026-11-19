/**
 * Utility for sanitizing and escaping special regular expression characters.
 * Prevents Regular Expression Denial of Service (ReDoS) and query injection attacks.
 */
export function escapeRegex(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
