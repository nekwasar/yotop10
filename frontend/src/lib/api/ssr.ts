export interface SsrLoadResult<T> {
  data: T | null;
  failed: boolean;
}

const DEFAULT_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 200;

/**
 * Server-side loader that distinguishes "the backend could not be reached"
 * from "the database really is empty".
 *
 * A single transient error used to be swallowed into an empty array, which
 * rendered the same "Be the first to submit" state as a genuinely empty
 * database. Retry with backoff first; if it still fails, report `failed` so
 * the page can offer a retry instead of claiming there is nothing to show.
 */
export async function ssrLoad<T>(
  load: () => Promise<T>,
  attempts: number = DEFAULT_ATTEMPTS
): Promise<SsrLoadResult<T>> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return { data: await load(), failed: false };
    } catch {
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_DELAY_MS * attempt));
      }
    }
  }
  return { data: null, failed: true };
}
