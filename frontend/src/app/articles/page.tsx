import { Suspense } from 'react';
import { API } from '@/lib/api';
import type { Article } from '@/lib/api/types';
import { ArticlesSkeleton } from '@/components/ArticlesSkeleton';
import ArticlesClient from './client';
import type { Metadata } from 'next';
import { buildWebsiteMetadata } from '@/lib/seo/metadata';
import { ssrLoad } from '@/lib/api/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildWebsiteMetadata({
  path: '/articles',
  title: 'Articles',
  description: 'Long-form, sourced articles. Deep dives with cover art and citations across every topic on YoTop10.',
});

const PAGE_SIZE = 10;

async function ArticlesFeed() {
  const { data, failed } = await ssrLoad(() => API.getArticles({ page: 1, limit: PAGE_SIZE }));

  const articles: Article[] = data?.articles || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const hasMore = 1 < totalPages;

  return <ArticlesClient initialArticles={articles} initialHasMore={hasMore} initialFailed={failed} />;
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <ArticlesFeed />
    </Suspense>
  );
}
