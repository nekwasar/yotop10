import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeSkeleton } from '@/components/HomeSkeleton';
import HomeClient from '@/components/HomeClient';
import CtaButton from '@/components/CtaButton';
import { Icon } from '@/components/icons/Icon';
import type { PostsResponse } from '@/lib/api/types';

const API_BASE = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';

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

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export const metadata: Metadata = {
  title: 'YoTop10 — Fact Mine. Debate Ground.',
  description: 'The open catalog of ranked lists. Submit your list. Defend your rankings. Vote on debates, discover facts, and curate the best of everything.',
  openGraph: {
    title: 'YoTop10 — Fact Mine. Debate Ground.',
    description: 'The open catalog of ranked lists. Submit your list. Defend your rankings.',
  },
};

export default async function Home() {
  const [postsData, catsData, argsData, artsData, factsData] = await Promise.all([
    fetchJson<PostsResponse>(`${API_BASE}/posts?post_type=top_list%2Cbest_of%2Cworst_of`, { posts: [] }),
    fetchJson<{ categories: CategoryItem[] }>(`${API_BASE}/categories`, { categories: [] }),
    fetchJson<{ arguments: DebateItem[] }>(`${API_BASE}/arguments?limit=12`, { arguments: [] }),
    fetchJson<{ articles: ArticleItem[] }>(`${API_BASE}/articles?limit=8`, { articles: [] }),
    fetchJson<PostsResponse>(`${API_BASE}/posts?post_type=fact_drop&limit=10`, { posts: [] }),
  ]);

  const uniqueByTitle = <T extends { title: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = item.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const posts = uniqueByTitle(postsData.posts || []);
  const categories = catsData.categories || [];
  const debates = uniqueByTitle(argsData.arguments || []);
  const articles = uniqueByTitle(artsData.articles || []);
  const facts = uniqueByTitle(factsData.posts || []);

  const hasContent = posts.length > 0 || debates.length > 0 || categories.some(c => c.post_count > 0) || articles.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5">
          <Icon name="FileText" size={36} className="text-zinc-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Welcome to YoTop10</h2>
        <p className="mb-8 max-w-md text-sm text-zinc-500 leading-relaxed">
          The open catalog of ranked lists. Be the first to submit a list and start the conversation.
        </p>
        <CtaButton href="/new">
          <Icon name="Plus" size={16} />
          Submit a List
        </CtaButton>
      </div>
    );
  }

  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient posts={posts} categories={categories} debates={debates} articles={articles} facts={facts} />
    </Suspense>
  );
}
