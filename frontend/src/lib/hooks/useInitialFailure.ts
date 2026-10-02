'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface InitialFailureState {
  failed: boolean;
  retrying: boolean;
  retry: () => Promise<void>;
  setFailed: (value: boolean) => void;
}

/**
 * Tracks a server-side load that failed and exposes a client-side recovery.
 *
 * The initial SSR payload arrives with `initiallyFailed`; we attempt one
 * automatic reload on mount so a single blip does not strand the visitor, and
 * expose `retry` for a manual Retry button. `failed` only ever becomes false
 * once `reload` actually resolves.
 */
export function useInitialFailure(
  initiallyFailed: boolean,
  reload: () => Promise<void>
): InitialFailureState {
  const [failed, setFailed] = useState(initiallyFailed);
  const [retrying, setRetrying] = useState(false);
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  const retry = useCallback(async () => {
    setRetrying(true);
    try {
      await reloadRef.current();
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    if (initiallyFailed) {
      void retry();
    }
  }, [initiallyFailed, retry]);

  return { failed, retrying, retry, setFailed };
}
