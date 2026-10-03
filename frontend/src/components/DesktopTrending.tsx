'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons/Icon';

export function DesktopTrending({ className = '' }: { className?: string }) {
  const [trending, setTrending] = useState<string[]>([]);

  useEffect(() => {
    // Cancelled before the dynamic import resolves, so an unmounted rail never
    // issues a stray request (and never rejects a promise nobody is awaiting).
    let cancelled = false;

    (async () => {
      try {
        const { apiFetch } = await import('@/lib/api/client');
        if (cancelled) return;
        // The endpoint returns `{ trending: [{ query, count }] }`, not
        // `{ terms: string[] }` — reading `terms` always yielded undefined, so
        // this section never rendered.
        const data = await apiFetch<{ trending?: Array<{ query: string }> }>('/search/trending');
        if (cancelled) return;
        setTrending((data.trending || []).map((item) => item.query).slice(0, 6));
      } catch {
        // Optional homepage rail: a failure hides the section rather than
        // rendering an empty card.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (trending.length === 0) return null;

  return (
    <section className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="TrendingUp" size={16} className="text-orange-400" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Trending Now</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {trending.map(term => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/10 hover:border-orange-500/30 transition"
          >
            {term}
          </Link>
        ))}
      </div>
    </section>
  );
}
