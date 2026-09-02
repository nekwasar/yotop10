'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HofEntry {
  id: string;
  post_id: string;
  post: {
    slug: string;
    title: string;
    post_type: string;
    author_username: string;
    author_display_name: string;
    view_count: number;
    comment_count: number;
  };
  editorial_note?: string | null;
}

export function DesktopHallOfFame({ className = '' }: { className?: string }) {
  const [entries, setEntries] = useState<HofEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { apiFetch } = await import('@/lib/api/client');
        const data = await apiFetch<{ entries: HofEntry[] }>('/hall-of-fame?limit=6');
        setEntries(data.entries?.slice(0, 6) || []);
      } catch { /* ignore */ }
    })();
  }, []);

  if (entries.length === 0) return null;

  const featured = entries.slice(0, 3);
  const rest = entries.slice(3, 6);

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Hall of Fame</h2>
        <div className="h-px flex-1 bg-white/[0.06] mx-6" />
        <Link href="/hall-of-fame" className="text-[12px] text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.08em]">View all</Link>
      </div>

      {/* Featured — 3 white cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {featured.map((entry, i) => (
          <Link
            key={entry.id}
            href={`/${entry.post.slug}`}
            className="bg-white p-6 group hover:opacity-90 transition-opacity"
          >
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-3 block">Featured</span>
            <h3 className="text-[17px] font-bold text-black leading-snug mb-3 line-clamp-3">{entry.post.title}</h3>
            {entry.editorial_note && (
              <p className="text-[13px] text-zinc-500 leading-relaxed mb-3 line-clamp-2">{entry.editorial_note}</p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span>{entry.post.author_display_name || entry.post.author_username}</span>
              <span>{entry.post.view_count.toLocaleString()} views</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Rest — simple list */}
      {rest.length > 0 && (
        <div className="space-y-0">
          {rest.map((entry) => (
            <Link
              key={entry.id}
              href={`/${entry.post.slug}`}
              className="flex items-baseline justify-between py-4 border-t border-white/[0.06] group"
            >
              <h4 className="text-[15px] font-medium text-zinc-400 group-hover:text-white transition-colors line-clamp-1 flex-1 mr-4">{entry.post.title}</h4>
              <span className="text-[11px] text-zinc-700 shrink-0">{entry.post.view_count.toLocaleString()} views</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
