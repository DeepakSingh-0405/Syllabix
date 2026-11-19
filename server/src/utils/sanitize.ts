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

/**
 * Formats a sanitized error response payload for API controllers and middlewares.
 * Ensures internal errors, sensitive filesystem paths, and stack traces are suppressed in production,
 * while preserving detailed diagnostic visibility during development and testing.
 */
export function formatSanitizedError(
  err: any,
  fallbackMessage = 'An unexpected internal server error occurred.',
  code?: string
): { code: string; message: string; stack?: string } {
  const isProduction = process.env.NODE_ENV === 'production';
  const errorCode = code || err?.code || 'INTERNAL_SERVER_ERROR';

  const message = isProduction
    ? fallbackMessage
    : (err?.message || fallbackMessage);

  const payload: { code: string; message: string; stack?: string } = {
    code: errorCode,
    message,
  };

  if (!isProduction && err?.stack) {
    payload.stack = err.stack;
  }

  return payload;
}

