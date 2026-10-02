'use client';

import { Icon } from '@/components/icons/Icon';

interface ReloadButtonProps {
  label?: string;
  className?: string;
}

/**
 * Full reload affordance for server components, which cannot hold a function
 * prop. Used on server-rendered failure states so the next request runs a
 * fresh SSR pass instead of showing a stale error.
 */
export function ReloadButton({
  label = 'Try again',
  className = 'mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white',
}: ReloadButtonProps) {
  return (
    <button type="button" onClick={() => window.location.reload()} className={className}>
      <Icon name="RefreshCw" size={14} />
      {label}
    </button>
  );
}
