'use client';

import { useState, useEffect } from 'react';
import { useViewport } from '@/hooks/useViewport';
import MobileHome from '@/components/MobileHome';
import DesktopHome from '@/components/DesktopHome';
import { HomeSkeleton } from '@/components/HomeSkeleton';
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

interface HomeClientProps {
  posts: PostsResponse['posts'];
  categories: CategoryItem[];
  debates: DebateItem[];
  articles: ArticleItem[];
  facts: PostsResponse['posts'];
}

export default function HomeClient({ posts, categories, debates, articles, facts }: HomeClientProps) {
  const isDesktop = useViewport();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <HomeSkeleton />;
  }

  if (isDesktop) {
    return <DesktopHome posts={posts} debates={debates} articles={articles} facts={facts} />;
  }

  return <MobileHome posts={posts} categories={categories} debates={debates} articles={articles} facts={facts} />;
}
