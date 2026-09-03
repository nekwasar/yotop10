'use client';

import { PostCarouselCard } from '@/components/PostCarouselCard';
import { HomeCategoryFeed } from '@/components/HomeCategoryFeed';
import { HomeDebates } from '@/components/HomeDebates';
import { HomeArticles } from '@/components/HomeArticles';
import { HomeFactDrop } from '@/components/HomeFactDrop';
import CtaButton from '@/components/CtaButton';
import { Icon } from '@/components/icons/Icon';
import type { PostsResponse } from '@/lib/api/types';

interface CategoryItem {
  name: string;
  slug: string;
  icon?: string;
  post_count: number;
}

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

interface MobileHomeProps {
  posts: PostsResponse['posts'];
  categories: CategoryItem[];
  debates: DebateItem[];
  articles: ArticleItem[];
  facts: PostsResponse['posts'];
}

export default function MobileHome({ posts, categories, debates, articles, facts }: MobileHomeProps) {
  return (
    <>
      {/* Latest Lists carousel */}
      <div className="pb-2">
        <div className="px-3 sm:px-6 pt-6 pb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Icon name="Flame" size={16} className="text-zinc-400" />
            Latest Lists
          </h2>
        </div>
        <div className="flex flex-row overflow-x-auto overflow-y-hidden gap-3 pl-4 py-2 -webkit-overflow-scrolling-touch snap-x snap-mandatory scroll-smooth">
          {posts.map((post) => (
            <div key={post.id} className="flex-shrink-0 w-[calc(76vw-12px)] scroll-snap-align-start">
              <PostCarouselCard post={post} />
            </div>
          ))}
        </div>
      </div>

      {/* Hot Debates */}
      <HomeDebates debates={debates} />
      {debates.length > 0 && <hr className="border-white/5 mx-3 sm:mx-6" />}

      {/* Categories */}
      <HomeCategoryFeed categories={categories} />
      <hr className="border-white/5 mx-3 sm:mx-6" />

      {/* Did You Know */}
      <HomeFactDrop facts={facts} />
      {facts.length > 0 && <hr className="border-white/5 mx-3 sm:mx-6" />}

      {/* Recent Articles */}
      <HomeArticles articles={articles} />
      <hr className="border-white/5 mx-3 sm:mx-6" />

      {/* Bottom CTA */}
      <section className="px-3 sm:px-6 py-8 text-center">
        <p className="mb-4 text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
          Have a ranking to share? Submit your list and join the debate.
        </p>
        <CtaButton href="/new">
          <Icon name="Plus" size={16} />
          Submit a List
        </CtaButton>
      </section>
    </>
  );
}
