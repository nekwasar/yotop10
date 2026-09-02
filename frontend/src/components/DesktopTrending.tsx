'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons/Icon';

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
      <h2 className="ed-section-title flex items-center gap-2 mb-4">
        <Icon name="TrendingUp" size={16} />
        Trending Now
      </h2>
      <div className="space-y-3">
        {trending.map((term, i) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="ed-card flex items-center gap-4 group hover:border-white/20"
          >
            <span className="ed-number-sm">{String(i + 1).padStart(2, '0')}</span>
            <span className="ed-headline-sm group-hover:text-white transition">{term}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
