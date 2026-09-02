'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon, type LucideIconName } from './icons/Icon';
import { formatDate } from '@/lib/dates';
import type { Post } from '@/lib/api/types';

const CATEGORY_ICONS: Record<string, string> = {
  movies: 'Film', music: 'Music', food: 'UtensilsCrossed', gaming: 'Gamepad2',
  books: 'BookOpen', technology: 'Cpu', sports: 'Trophy', television: 'Tv',
  business: 'Briefcase', lifestyle: 'Heart',
};

function getCategoryIcon(slug: string): string {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (slug.startsWith(key)) return icon;
  }
  return 'Folder';
}

export const PostCarouselCard = memo(function PostCarouselCard({ post }: { post: Post }) {
  const topItems = post.topItems || [];
  const displayName = post.author_display_name || post.author_username;
  const totalItems = post.totalItems || topItems.length;
  const remaining = Math.max(0, totalItems - 3);

  return (
    <Link
      href={`/${post.slug}`}
      className="block overflow-hidden transition-opacity hover:opacity-90 focus:outline-none"
    >
      {/* Mobile: card style */}
      <div className="lg:hidden border border-white/5 bg-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-4 pt-4 pb-3">
          <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">{post.title}</h3>
          {post.intro && (
            <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed line-clamp-2">{post.intro}</p>
          )}
        </div>
        {topItems.length > 0 && (
          <div className="px-4 space-y-2 mb-2">
            {topItems.slice(0, 3).map((item) => (
              <div key={item.rank} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-black text-[10px] font-bold font-mono shrink-0">#{item.rank}</span>
                <span className="text-sm text-zinc-300 truncate">{item.title}</span>
              </div>
            ))}
            {remaining > 0 && <p className="text-right text-[10px] text-zinc-600 mt-1 mb-1">... and {remaining} more</p>}
          </div>
        )}
        <div className="mx-4 rounded-xl overflow-hidden h-44 bg-white/5">
          {post.hero_image_url ? (
            <Image src={post.hero_image_url} alt="" width={600} height={338} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
              <Icon name={getCategoryIcon(post.category_slug) as LucideIconName} size={48} className="text-white/25" />
            </div>
          )}
        </div>
        <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
          <span>By</span>
          <span className="font-mono text-zinc-400">@{displayName}</span>
          <span className="text-zinc-700">&middot;</span>
          <span suppressHydrationWarning>{formatDate(post.published_at || post.created_at)}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 mt-auto border-t border-white/5">
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Icon name="MessageCircle" size={14} />{post.comment_count}
          </span>
          <span className="text-[10px] text-zinc-600">{post.view_count} views</span>
        </div>
      </div>

      {/* Desktop: magazine cover — image behind, giant title overlay */}
      <div className="hidden lg:block relative h-[480px] bg-black">
        {/* Background image */}
        {post.hero_image_url ? (
          <Image
            src={post.hero_image_url}
            alt=""
            width={1200}
            height={675}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-white/[0.02]" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-10">
          {/* Category */}
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3">
            {post.category_name || post.category_slug}
          </span>

          {/* Giant title */}
          <h2 className="text-[40px] leading-[1.05] font-extrabold text-white tracking-[-0.02em] mb-3 max-w-2xl">
            {post.title}
          </h2>

          {/* Intro */}
          {post.intro && (
            <p className="text-[15px] leading-relaxed text-zinc-400 mb-5 max-w-xl line-clamp-2">
              {post.intro}
            </p>
          )}

          {/* Items — minimal, just top 3 */}
          {topItems.length > 0 && (
            <div className="flex items-center gap-6 mb-5">
              {topItems.slice(0, 3).map((item) => (
                <div key={item.rank} className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono text-zinc-600">{item.rank}</span>
                  <span className="text-[13px] text-zinc-300">{item.title}</span>
                </div>
              ))}
              {remaining > 0 && (
                <span className="text-[11px] text-zinc-600">+{remaining}</span>
              )}
            </div>
          )}

          {/* Byline */}
          <div className="flex items-center gap-2 text-[12px] text-zinc-500">
            <span className="font-mono text-zinc-400">@{displayName}</span>
            <span className="text-zinc-700">&middot;</span>
            <span suppressHydrationWarning>{formatDate(post.published_at || post.created_at)}</span>
            <span className="text-zinc-700">&middot;</span>
            <span>{post.comment_count} comments</span>
          </div>
        </div>
      </div>
    </Link>
  );
});
