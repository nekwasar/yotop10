'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DesktopDebates } from '@/components/DesktopDebates';
import { DesktopArticles } from '@/components/DesktopArticles';
import { DesktopFacts } from '@/components/DesktopFacts';
import { DesktopCta } from '@/components/DesktopCta';
import { DesktopTrending } from '@/components/DesktopTrending';
import type { PostsResponse } from '@/lib/api/types';

interface DebateItem {
  id?: string;
  slug: string;
  title: string;
  comment_count: number;
  velocity?: number;
  support_pct?: number;
  contradict_pct?: number;
  post_type?: string;
  item_a_title?: string;
  item_b_title?: string;
  votes_a?: number;
  votes_b?: number;
  hero_image_url?: string | null;
  user_display_name?: string;
  view_count?: number;
  created_at?: string;
}

interface ArticleItem {
  slug: string;
  title: string;
  cover_image?: string;
  reading_time?: number;
  author_username?: string;
  author_display_name?: string;
}

interface DesktopHomeProps {
  posts: PostsResponse['posts'];
  debates: DebateItem[];
  articles: ArticleItem[];
  facts: PostsResponse['posts'];
}

export default function DesktopHome({ posts, debates, articles, facts }: DesktopHomeProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % posts.length), 4500);
    return () => clearInterval(id);
  }, [posts.length]);

  const active = posts[idx];
  const minis = posts.slice(0, 6);

  return (
    <>
      {/* Hero slider: all latest + mini strip + add-post box */}
      {posts.length > 0 && active && (
        <div className="mb-16">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Latest</h2>
            <span className="text-[11px] text-zinc-500 font-mono">
              {idx + 1} / {posts.length}
            </span>
          </div>

          {/* Active slide */}
          <Link href={`/${active.slug}`} className="block group">
            <h3 className="text-[48px] font-bold text-white leading-tight mb-4 group-hover:opacity-80 transition-opacity">
              {active.title}
            </h3>
            {active.intro && (
              <p className="text-[22px] text-zinc-400 mb-6 max-w-3xl leading-relaxed line-clamp-3">
                {active.intro}
              </p>
            )}
            <div className="flex items-center gap-4 text-[16px] text-zinc-500 mb-6">
              <span>{active.author_display_name || active.author_username}</span>
              <span>&middot;</span>
              <span>{active.category_name || active.category_slug}</span>
            </div>
          </Link>

          {/* Mini strip + add-post box */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {minis.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setIdx(i)}
                className={`flex-shrink-0 text-left w-[220px] p-3 border transition ${
                  i === idx ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400'
                }`}
              >
                <span className="text-[11px] font-mono block mb-1 opacity-60">#{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px] font-semibold leading-snug line-clamp-2 block">{p.title}</span>
              </button>
            ))}
            <Link
              href="/new"
              className="flex-shrink-0 w-[220px] p-3 border border-dashed border-white/20 bg-transparent hover:bg-white hover:text-black text-zinc-400 hover:text-black transition flex flex-col items-center justify-center text-center gap-1"
            >
              <span className="text-[18px] leading-none">+</span>
              <span className="text-[12px] font-bold uppercase tracking-[0.1em]">add post</span>
            </Link>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-4">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-[2px] transition-all ${i === idx ? 'w-6 bg-white' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Debates: full width */}
      {debates.length > 0 && (
        <div className="mb-16">
          <DesktopDebates debates={debates} />
        </div>
      )}

      {/* Trending: full width */}
      <div className="mb-16">
        <DesktopTrending />
      </div>

      {/* Articles: full width */}
      {articles.length > 0 && (
        <div className="mb-16">
          <DesktopArticles articles={articles} />
        </div>
      )}

      {/* Facts: full width */}
      {facts.length > 0 && (
        <div className="mb-16">
          <DesktopFacts facts={facts} />
        </div>
      )}

      {/* CTA: full width */}
      <DesktopCta />
    </>
  );
}
