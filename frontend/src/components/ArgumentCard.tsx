'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Icon } from './icons/Icon';
import { ArgumentBar } from './ArgumentBar';
import { relativeTime } from '@/lib/dates';
import type { ArgumentPost } from '@/lib/api/types';

const POST_TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  this_vs_that: { label: 'THIS VS THAT', badgeClass: 'ed-label border-white/20 text-white/70' },
  counter_list: { label: 'COUNTER LIST', badgeClass: 'ed-label border-white/20 text-white/70' },
};

interface ArgumentCardProps {
  argument: ArgumentPost;
}

export const ArgumentCard = memo(function ArgumentCard({ argument }: ArgumentCardProps) {
  const config = POST_TYPE_CONFIG[argument.post_type] ?? {
    label: argument.post_type.toUpperCase(),
    badgeClass: 'ed-label border-white/10 text-white/40',
  };

  const topComment = argument.top_comments?.[0];
  const contentPreview = topComment
    ? topComment.content.length > 100
      ? topComment.content.slice(0, 100) + '...'
      : topComment.content
    : null;

  return (
    <div className="ed-card rounded-2xl border border-white/[0.06] p-5 transition-colors duration-200 hover:border-white/20">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`ed-label text-2xs font-mono px-2 py-0.5 rounded border ${config.badgeClass}`}>
          {config.label}
        </span>

        <span className="ed-meta text-2xs font-mono text-white/40 uppercase">
          {argument.category_name || argument.category_slug}
        </span>

        {argument.velocity > 0 && (
          <span className="ed-meta text-2xs font-mono text-white/50">
            {argument.velocity} replies/hour
          </span>
        )}
      </div>

      <Link href={`/${argument.slug}`} className="block group">
        <h3 className="ed-headline-sm text-lg font-bold text-white group-hover:text-white transition-colors mb-3">
          {argument.title}
        </h3>
      </Link>

      {topComment && (
        <div className="ed-body mb-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-white/10 text-2xs font-mono text-white/70 tabular-nums">
              {topComment.rank}
            </span>
            <span className="ed-body text-xs text-white/50">
              On item #{topComment.rank}: {topComment.item_title}
            </span>
          </div>
          <p className="ed-body text-sm text-white/40 leading-relaxed mb-2">
            {contentPreview}
          </p>
          <div className="flex items-center gap-3">
            <span className="ed-meta text-3xs font-mono text-white/40">
              @{topComment.author_username}
            </span>
            <span className="flex items-center gap-1 ed-meta text-3xs text-white/30">
              <Icon name="Flame" size={11} />
              <span className="font-mono tabular-nums">{topComment.fire_count}</span>
            </span>
          </div>
        </div>
      )}

      <div className="mb-3">
        <ArgumentBar supportPct={argument.support_pct} contradictPct={argument.contradict_pct} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center rounded-full bg-white/10 text-xs font-mono text-white/60 w-6 h-6 shrink-0">
            {(argument.author_display_name || argument.author_username || '?')[0].toUpperCase()}
          </span>
          <span className="ed-body text-xs text-white/60">
            @{argument.author_username}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono tabular-nums text-2xs text-white/30">
          <span className="ed-meta text-3xs text-white/30" suppressHydrationWarning>
            {relativeTime(argument.last_active)}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={11} />
            {argument.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="MessageCircle" size={11} />
            {argument.comment_count}
          </span>
        </div>
      </div>
    </div>
  );
});
