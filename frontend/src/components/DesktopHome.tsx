'use client';

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
  return (
    <>
      {/* Hero: first post as giant headline */}
      {posts.length > 0 && (
        <div className="mb-16">
          <div className="mb-4">
            <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Latest</h2>
          </div>
          <a href={`/${posts[0].slug}`} className="block group">
            <h3 className="text-[48px] font-bold text-white leading-tight mb-4 group-hover:opacity-80 transition-opacity">
              {posts[0].title}
            </h3>
            {posts[0].intro && (
              <p className="text-[22px] text-zinc-400 mb-6 max-w-3xl leading-relaxed">
                {posts[0].intro}
              </p>
            )}
            <div className="flex items-center gap-4 text-[16px] text-zinc-500">
              <span>{posts[0].author_display_name || posts[0].author_username}</span>
              <span>&middot;</span>
              <span>{posts[0].category_name || posts[0].category_slug}</span>
            </div>
          </a>
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
