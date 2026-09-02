'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons/Icon';

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
        const data = await apiFetch<{ entries: HofEntry[] }>('/hall-of-fame?limit=3');
        setEntries(data.entries?.slice(0, 3) || []);
      } catch { /* ignore */ }
    })();
  }, []);

  if (entries.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="ed-section-title flex items-center gap-2 mb-4">
        <Icon name="Crown" size={16} />
        Hall of Fame
      </h2>
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <Link
            key={entry.id}
            href={`/${entry.post.slug}`}
            className={`block ${i < 3 ? 'ed-card-featured' : 'ed-card'} group`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="ed-number-sm">{String(i + 1).padStart(2, '0')}</span>
              <span className="ed-label text-white/40 uppercase">Featured</span>
            </div>
            <h3 className="ed-headline-sm group-hover:text-white transition line-clamp-2 mb-1">{entry.post.title}</h3>
            {entry.editorial_note && (
              <p className="ed-body text-white/40 line-clamp-2 leading-relaxed mb-2">{entry.editorial_note}</p>
            )}
            <div className="flex items-center gap-3 ed-meta text-white/30">
              <span>{entry.post.author_display_name || entry.post.author_username}</span>
              <span>{entry.post.view_count.toLocaleString()} views</span>
              <span>{entry.post.comment_count} comments</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
