'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  total_posts: number;
  total_debates: number;
  total_users: number;
  total_facts: number;
}

export function DesktopStats({ className = '' }: { className?: string }) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { apiFetch } = await import('@/lib/api/client');
        const data = await apiFetch<StatsData>('/stats/platform');
        setStats(data);
      } catch { /* ignore */ }
    })();
  }, []);

  if (!stats) return null;

  const items = [
    { label: 'Posts', value: stats.total_posts },
    { label: 'Debates', value: stats.total_debates },
    { label: 'Curators', value: stats.total_users },
    { label: 'Facts', value: stats.total_facts },
  ];

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Platform</h2>
        <div className="h-px flex-1 bg-white/[0.06] mx-6" />
      </div>

      {/* Stats — giant numbers */}
      <div className="space-y-0">
        {items.map((item) => (
          <div key={item.label} className="py-4 border-t border-white/[0.06]">
            <p className="text-[32px] font-extrabold text-white leading-none mb-1 tabular-nums">{item.value.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-600 uppercase tracking-[0.1em]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
