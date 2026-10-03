import type { Metadata } from 'next';
import { API } from '@/lib/api';
import type { ArgumentPost, Category } from '@/lib/api/types';
import ArgumentsClient from './client';
import { buildWebsiteMetadata } from '@/lib/seo/metadata';
import { ssrLoad } from '@/lib/api/ssr';

export const runtime = 'nodejs';

const PER_PAGE = 20;

export const metadata: Metadata = buildWebsiteMetadata({
  path: '/arguments',
  title: 'Hot Debates',
  description: 'Vote on the most heated debates. Pick a side, cast your vote, and join the discussion on YoTop10.',
});

export default async function ArgumentsPage() {
  const [postsRes, catsRes] = await Promise.all([
    ssrLoad(() => API.getArguments({ page: 1, limit: PER_PAGE })),
    ssrLoad(() => API.getCategories()),
  ]);

  const posts: ArgumentPost[] = postsRes.data?.arguments || [];
  const categories: Category[] = catsRes.data?.categories || [];
  const hasMore = 1 < (postsRes.data?.pagination?.totalPages || 1);

  return (
    <ArgumentsClient
      initialPosts={posts}
      initialCategories={categories}
      initialHasMore={hasMore}
      initialFailed={postsRes.failed}
    />
  );
}
