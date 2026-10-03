export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_INTERNAL_API_URL || 'http://backend:8000/api';
  }
  return '/api';
}

/**
 * Carries the HTTP status that produced the failure so callers can tell a
 * definitive "does not exist" (404) apart from a transient outage (425/5xx/
 * network). The message format is unchanged on purpose — a few screens parse
 * `API Error: <status>` out of it.
 */
export class ApiError extends Error {
  readonly status?: number;
  readonly endpoint: string;

  constructor(message: string, endpoint: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.endpoint = endpoint;
    this.status = status;
  }
}

/** True only for an explicit HTTP 404 — never for a network/5xx failure. */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  retryCount = 0
): Promise<T> {
  const MAX_RETRIES = 3;
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  let deviceFingerprint: string | null = null;
  if (typeof window !== 'undefined') {
    try { deviceFingerprint = localStorage.getItem('yotop10_fp'); } catch { /* private browsing */ }
  }

  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  // Server-side renders never keep the Set-Cookie the backend issues, so every
  // SSR call is a fresh cookie-less hit. Counting those against the shared
  // per-IP grace budget exhausts it for real users behind the same IP. Mark
  // trusted internal traffic so the backend can skip the counter.
  if (typeof window === 'undefined') {
    const secret = process.env.INTERNAL_API_SECRET;
    if (secret) {
      headers['X-Internal-Request'] = secret;
    }
  }

  if (deviceFingerprint) {
    headers['X-Device-Fingerprint'] = deviceFingerprint;
  }

  // Always send Tier 0 machine-stable signals for cross-browser matching
  if (typeof window !== 'undefined') {
    try {
      headers['X-Tier0'] = JSON.stringify({
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        timezoneOffset: new Date().getTimezoneOffset(),
        platform: navigator.platform || 'unknown',
        devicePixelRatio: window.devicePixelRatio,
        maxTouchPoints: navigator.maxTouchPoints || 0,
      });
    } catch {}
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, credentials: 'include' });

    // Capture fingerprint merge token if present (cross-browser identity linking)
    const mergeToken = response.headers.get('x-merge-token');
    if (mergeToken && typeof window !== 'undefined') {
      try { sessionStorage.setItem('yotop10_merge_token', mergeToken); } catch {}
    }
  } catch (err) {
    // Network error (ECONNREFUSED, DNS failure, etc.) — backend unreachable
    throw new ApiError(`API Network Error: ${url} - ${(err as Error).message}`, url);
  }

  if (response.status === 425) {
    // Do not retry FormData (upload) — body stream may be consumed, and grace retry would create churn
    if (isFormData) {
      const t = await response.text().catch(() => '');
      throw new ApiError(`API Error: 425 Too Early - ${t}`, url, 425);
    }
    if (retryCount >= MAX_RETRIES) {
      throw new ApiError(`API Error: 425 Too Early - Max retries (${MAX_RETRIES}) exceeded`, url, 425);
    }
    await new Promise(r => setTimeout(r, 500));
    return apiFetch(endpoint, options, retryCount + 1);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(`API Error: ${response.status} ${response.statusText} - ${errorText}`, url, response.status);
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    throw new ApiError(`API Error: Empty response body from ${url}`, url, response.status);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(`API Error: Invalid JSON response from ${url}`, url, response.status);
  }
}
