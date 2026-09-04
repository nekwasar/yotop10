'use client';

import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  const m = window.matchMedia('(min-width: 980px)');
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
}

function getSnapshot() {
  return window.matchMedia('(min-width: 980px)').matches;
}

function getServerSnapshot() {
  return false;
}

export function useViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
