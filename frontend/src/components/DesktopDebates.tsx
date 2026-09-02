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

  return (
    <section className={`${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="ed-section-title flex items-center gap-2">
          <Icon name="MessageCircle" size={16} className="text-zinc-500" />
          Hot Debates
        </h2>
        <Link href="/arguments" className="ed-meta text-white/40 hover:text-white transition">
          View all &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {localDebates.slice(0, 4).map((d) => {
          const votesA = d.votes_a ?? 0;
          const votesB = d.votes_b ?? 0;
          const totalVotes = votesA + votesB;
          const hasVotes = totalVotes > 0;
          const pctA = hasVotes ? Math.round((votesA / totalVotes) * 100) : 0;
          const pctB = hasVotes ? Math.round((votesB / totalVotes) * 100) : 0;
          const voted = (d.id ? votedMap[d.id] : null) ?? null;

          return (
            <article
              key={d.slug}
              className="ed-card p-6 lg:p-8 group overflow-hidden"
            >
              <Link href={`/${d.slug}`} className="block relative h-28 lg:h-36 w-full overflow-hidden bg-zinc-100">
                {d.hero_image_url ? (
                  <Image src={d.hero_image_url} alt="" fill className="object-cover grayscale transition duration-500 group-hover:scale-105" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="MessageCircle" size={32} className="text-zinc-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 text-2xs lg:text-xs font-medium text-zinc-700 tracking-wider flex items-center gap-1">
                  <Icon name="Flame" size={10} />
                  TRENDING
                </span>
              </Link>
              <div className="mt-3 lg:mt-4 mb-3 lg:mb-4">
                <Link href={`/${d.slug}`} className="block">
                  <h3 className="ed-headline-sm leading-snug line-clamp-2 group-hover:text-white transition">{d.title}</h3>
                </Link>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-white/10 text-2xs font-mono text-white/70 shrink-0">
                    {(d.user_display_name || 'A')[0].toUpperCase()}
                  </span>
                  <span className="ed-meta text-2xs text-white/40">{d.user_display_name || 'anonymous'}</span>
                  <span className="text-white/20"><Icon name="BadgeCheck" size={10} /></span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white/70 truncate">{d.item_a_title || ''}</span>
                    <span className="text-sm font-bold font-mono text-white/90 shrink-0 ml-2">{hasVotes ? `${pctA}%` : '--'}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${hasVotes ? pctA : 0}%`, opacity: hasVotes ? 0.8 : 0 }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="ed-meta text-3xs text-white/30">{votesA.toLocaleString()} votes</span>
                    <button
                      onClick={() => handleVote(d, 'A')}
                      className={`ed-meta rounded px-3 py-1 text-xs font-semibold transition ${
                        voted === 'A'
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {voted === 'A' ? 'Voted' : 'Vote A'}
                    </button>
                  </div>
                </div>
                <div className="border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white/70 truncate">{d.item_b_title || ''}</span>
                    <span className="text-sm font-bold font-mono text-white/90 shrink-0 ml-2">{hasVotes ? `${pctB}%` : '--'}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${hasVotes ? pctB : 0}%`, opacity: hasVotes ? 0.5 : 0 }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="ed-meta text-3xs text-white/30">{votesB.toLocaleString()} votes</span>
                    <button
                      onClick={() => handleVote(d, 'B')}
                      className={`ed-meta rounded px-3 py-1 text-xs font-semibold transition ${
                        voted === 'B'
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {voted === 'B' ? 'Voted' : 'Vote B'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 lg:gap-6 pt-4 mt-4 border-t border-white/[0.06]">
                <span className="flex items-center gap-1 text-3xs lg:text-sm text-white/30">
                  <Icon name="Users" size={12} className="lg:w-4 lg:h-4" />
                  {totalVotes}
                </span>
                <Link href={`/${d.slug}`} className="flex items-center gap-1 text-3xs lg:text-sm text-white/30 hover:text-white/60 transition">
                  <Icon name="MessageCircle" size={12} className="lg:w-4 lg:h-4" />
                  {d.comment_count}
                </Link>
                <span className="flex items-center gap-1 text-3xs lg:text-sm text-white/30">
                  <Icon name="Eye" size={12} className="lg:w-4 lg:h-4" />
                  {(d.view_count ?? 0).toLocaleString()}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
