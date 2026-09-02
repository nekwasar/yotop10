'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './icons/Icon';

interface DebateItem {
  id?: string;
  slug: string;
  title: string;
  comment_count: number;
  view_count?: number;
  post_type?: string;
  item_a_title?: string;
  item_b_title?: string;
  votes_a?: number;
  votes_b?: number;
  hero_image_url?: string | null;
  user_display_name?: string;
  created_at?: string;
}

export function DesktopDebates({ debates, className = '' }: { debates: DebateItem[]; className?: string }) {
  const sorted = [...debates].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const [localDebates, setLocalDebates] = useState(sorted);
  const [votedMap, setVotedMap] = useState<Record<string, 'A' | 'B' | null>>({});

  if (!localDebates || localDebates.length === 0) return null;

  const handleVote = async (debate: DebateItem, side: 'A' | 'B') => {
    const pid = debate.id;
    if (!pid) return;
    try {
      const { apiFetch } = await import('@/lib/api/client');
      const res = await apiFetch<{ votes_a: number; votes_b: number; voted: string | null }>(`/posts/${pid}/vote`, {
        method: 'POST',
        body: JSON.stringify({ side }),
      });
      setLocalDebates(prev =>
        prev.map(d =>
          d.id === pid ? { ...d, votes_a: res.votes_a, votes_b: res.votes_b } : d
        )
      );
      setVotedMap(prev => ({ ...prev, [pid]: res.voted as 'A' | 'B' | null }));
    } catch { /* silently fail */ }
  };

  const featured = localDebates[0];
  const rest = localDebates.slice(1, 4);

  const renderVoteBar = (d: DebateItem, side: 'A' | 'B', label: string, votes: number, pct: number, voted: string | null) => (
    <div className="border border-white/[0.06] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-zinc-300 truncate">{label}</span>
        <span className="text-[13px] font-bold font-mono text-white shrink-0 ml-2">{d.votes_a != null ? `${pct}%` : '--'}</span>
      </div>
      <div className="h-[3px] bg-white/[0.06] mb-3">
        <div className="h-full bg-white transition-all" style={{ width: `${pct}%`, opacity: voted === side ? 1 : 0.5 }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-600">{votes.toLocaleString()} votes</span>
        <button
          onClick={() => handleVote(d, side)}
          className={`text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1 transition-colors ${
            voted === side ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
          }`}
        >
          {voted === side ? 'Voted' : `Vote ${side}`}
        </button>
      </div>
    </div>
  );

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Debates</h2>
        <div className="h-px flex-1 bg-white/[0.06] mx-6" />
        <Link href="/arguments" className="text-[12px] text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.08em]">View all</Link>
      </div>

      {/* Featured debate — large */}
      {featured && (() => {
        const vA = featured.votes_a ?? 0;
        const vB = featured.votes_b ?? 0;
        const total = vA + vB;
        const pctA = total > 0 ? Math.round((vA / total) * 100) : 0;
        const pctB = total > 0 ? Math.round((vB / total) * 100) : 0;
        const voted = featured.id ? votedMap[featured.id] ?? null : null;
        return (
          <div className="mb-6">
            {featured.hero_image_url && (
              <Link href={`/${featured.slug}`} className="block mb-4 overflow-hidden">
                <Image src={featured.hero_image_url} alt="" width={800} height={300} className="w-full h-[240px] object-cover grayscale opacity-60 hover:opacity-80 transition-opacity" unoptimized />
              </Link>
            )}
            <Link href={`/${featured.slug}`}>
              <h3 className="text-[28px] leading-[1.1] font-bold text-white tracking-[-0.01em] mb-4 hover:opacity-80 transition-opacity">{featured.title}</h3>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              {renderVoteBar(featured, 'A', featured.item_a_title || '', vA, pctA, voted)}
              {renderVoteBar(featured, 'B', featured.item_b_title || '', vB, pctB, voted)}
            </div>
            <div className="flex items-center gap-5 mt-3 text-[11px] text-zinc-600">
              <span>{total.toLocaleString()} votes</span>
              <span>{featured.comment_count} comments</span>
              <span>{(featured.view_count ?? 0).toLocaleString()} views</span>
            </div>
          </div>
        );
      })()}

      {/* Smaller debates — list style */}
      <div className="space-y-4">
        {rest.map((d) => {
          const vA = d.votes_a ?? 0;
          const vB = d.votes_b ?? 0;
          const total = vA + vB;
          const pctA = total > 0 ? Math.round((vA / total) * 100) : 0;
          const pctB = total > 0 ? Math.round((vB / total) * 100) : 0;
          const voted = d.id ? votedMap[d.id] ?? null : null;
          return (
            <div key={d.slug} className="border border-white/[0.06] p-5">
              <Link href={`/${d.slug}`}>
                <h4 className="text-[17px] font-semibold text-white leading-snug mb-3 hover:opacity-80 transition-opacity line-clamp-2">{d.title}</h4>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                {renderVoteBar(d, 'A', d.item_a_title || '', vA, pctA, voted)}
                {renderVoteBar(d, 'B', d.item_b_title || '', vB, pctB, voted)}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-600">
                <span>{total} votes</span>
                <span>{d.comment_count} comments</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
