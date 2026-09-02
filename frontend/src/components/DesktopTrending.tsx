'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function DesktopTrending({ className = '' }: { className?: string }) {
  const [trending, setTrending] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { apiFetch } = await import('@/lib/api/client');
        const data = await apiFetch<{ terms: string[] }>('/search/trending');
        setTrending(data.terms?.slice(0, 6) || []);
      } catch { /* ignore */ }
    })();
  }, []);

  if (trending.length === 0) return null;

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Trending</h2>
        <div className="h-px flex-1 bg-white/[0.06] mx-6" />
      </div>

      {/* Trending list — editorial numbered */}
      <div className="space-y-0">
        {trending.map((term, i) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="flex items-baseline gap-5 py-4 border-t border-white/[0.06] group"
          >
            <span className="text-[32px] font-extrabold text-white/[0.06] leading-none w-10 text-right tabular-nums">{i + 1}</span>
            <span className="text-[17px] font-medium text-zinc-400 group-hover:text-white transition-colors">{term}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
