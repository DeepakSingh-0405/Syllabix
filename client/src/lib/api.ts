import { supabase } from './supabase';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5001/api/v1';

/**
 * Standardized error class for client API requests.
 * Normalizes HTTP error responses, network dropouts, rate limits, and backend outages.
 */
export class ApiClientError extends Error {
  public statusCode: number;
  public isBackendUnavailable: boolean;
  public isNetworkError: boolean;
  public isRateLimited: boolean;
  public rawData?: any;

  constructor(message: string, statusCode = 0, isBackendUnavailable = false, rawData?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.isBackendUnavailable = isBackendUnavailable;
    this.isNetworkError = statusCode === 0;
    this.isRateLimited = statusCode === 429;
    this.rawData = rawData;
  }
}

/**
 * Helper to determine whether an unknown error is due to the backend being offline, unreachable, or in an outage.
 */
export function isBackendUnavailableError(err: unknown): boolean {
  if (err instanceof ApiClientError) {
    return err.isBackendUnavailable || err.isNetworkError;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('unreachable') ||
      msg.includes('connection refused') ||
      msg.includes('econnrefused') ||
      msg.includes('econnreset') ||
      msg.includes('service unavailable') ||
      msg.includes('bad gateway')
    );
  }
  return false;
}

/**
 * Retrieves the active authentication bearer token, checking both Supabase Auth session
 * and local demo session storage with expiration validation.
 */
export async function getAuthToken(): Promise<string | null> {
  // 1. Check active local demo / mock session first if present
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedDemo = localStorage.getItem('syllabix_demo_session');
      if (savedDemo) {
        const parsed = JSON.parse(savedDemo);
        if (parsed?.session?.access_token) {
          const expiresAt = parsed.session.expires_at;
          if (expiresAt && Date.now() / 1000 > expiresAt) {
            localStorage.removeItem('syllabix_demo_session');
          } else {
            return parsed.session.access_token;
          }
        }
      }
    } catch {
      // Corrupted JSON in localStorage
    }
  }

  // 2. Check active Supabase session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
  } catch {
    // Supabase offline / error fallback
  }

  return null;
}

export async function request<T>(endpoint: string, options: RequestInit = {}, timeoutMs: number = 15000): Promise<T> {
  let token: string | null = null;
  try {
    token = await getAuthToken();
  } catch {
    token = null;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Setup abort controller for timeout safety
  let timeoutId: any = null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const signal = options.signal || controller?.signal;

  if (controller && timeoutMs > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal,
    });
  } catch (netErr: any) {
    if (timeoutId) clearTimeout(timeoutId);
    const isTimeout = netErr?.name === 'AbortError' || netErr?.name === 'TimeoutError';
    const message = isTimeout
      ? 'Request to Syllabix backend timed out. The server may be under heavy load or offline.'
      : 'Syllabix backend service is currently unreachable. Please check your network connection or verify the server is running.';
    throw new ApiClientError(message, 0, true, netErr);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  // Safely parse JSON or handle raw HTML error pages (e.g. 502/503 from proxies)
  const rawText = await response.text();
  let json: any = {};
  if (rawText && rawText.trim()) {
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { error: rawText.slice(0, 300) };
    }
  }

  if (!response.ok) {
    const status = response.status;
    const isOutage = status === 502 || status === 503 || status === 504;

    if (isOutage) {
      throw new ApiClientError(
        'Syllabix backend service is temporarily unavailable. Please retry in a moment.',
        status,
        true,
        json
      );
    }

    if (status === 429) {
      throw new ApiClientError(
        json.error?.message || json.error || 'Query rate limit exceeded. Please wait a few moments before requesting more operations.',
        429,
        false,
        json
      );
    }

    const errorMsg = typeof json.error === 'string'
      ? json.error
      : (json.error?.message || json.message || `HTTP Error ${status}`);
    throw new ApiClientError(errorMsg, status, false, json);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  isBackendUnavailable: isBackendUnavailableError,
};
