'use client';

import { Icon } from '@/components/icons/Icon';

interface DataLoadErrorProps {
  onRetry: () => void;
  retrying?: boolean;
  title?: string;
  className?: string;
}

/**
 * Shown when a section failed to load — deliberately distinct from an empty
 * state, so a network problem never reads as "this site has no content".
 */
export function DataLoadError({
  onRetry,
  retrying = false,
  title = "Couldn't load this section",
  className = '',
}: DataLoadErrorProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center backdrop-blur-xl ${className}`}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Icon name="CloudOff" size={24} className="text-zinc-600" />
      </div>
      <p className="font-medium text-zinc-400">{title}</p>
      <p className="mt-1 text-sm text-zinc-600">Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="RefreshCw" size={14} className={retrying ? 'animate-spin' : ''} />
        {retrying ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  );
}
