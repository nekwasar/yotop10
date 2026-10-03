'use client';

import { useEffect, useState } from 'react';
import { Icon } from './icons/Icon';

interface StatsData {
  total_posts: number;
  total_debates: number;
  total_users: number;
  total_facts: number;
}

const COUNT_KEYS = ['total_posts', 'total_debates', 'total_users', 'total_facts'] as const;

/**
 * The rail renders `.toLocaleString()` on every counter, so a partial or
 * malformed payload would throw mid-render. Require all four to be finite
 * numbers, otherwise hide the rail exactly like an error does.
 */
function toCounts(data: unknown): StatsData | null {
  if (!data || typeof data !== 'object') return null;
  const source = data as Record<string, unknown>;
  const out: Partial<StatsData> = {};
  for (const key of COUNT_KEYS) {
    const value = source[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    out[key] = value;
  }
  return out as StatsData;
}

export function DesktopStats({ className = '' }: { className?: string }) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { apiFetch } = await import('@/lib/api/client');
        if (cancelled) return;
        const data = await apiFetch<StatsData>('/stats/platform');
        if (cancelled) return;
        setStats(toCounts(data));
      } catch {
        // Optional homepage rail: a failure hides the section rather than
        // rendering an empty card.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) return null;

  const items = [
    { icon: 'FileText' as const, label: 'Posts', value: stats.total_posts.toLocaleString() },
    { icon: 'MessageCircle' as const, label: 'Debates', value: stats.total_debates.toLocaleString() },
    { icon: 'Users' as const, label: 'Curators', value: stats.total_users.toLocaleString() },
    { icon: 'Lightbulb' as const, label: 'Facts', value: stats.total_facts.toLocaleString() },
  ];

  return (
    <section className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="ChartColumn" size={16} className="text-orange-400" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Platform</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <Icon name={item.icon} size={18} className="text-orange-400/60 mx-auto mb-1" />
            <p className="text-lg font-bold font-mono text-white">{item.value}</p>
            <p className="text-3xs text-zinc-600 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
