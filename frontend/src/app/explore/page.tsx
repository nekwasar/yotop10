import type { Metadata } from 'next';
import { API } from '@/lib/api';
import type { ExplorePost } from '@/lib/api/types';
import ExploreClient from './client';
import { buildWebsiteMetadata } from '@/lib/seo/metadata';
import { ssrLoad } from '@/lib/api/ssr';

export const runtime = 'nodejs';

const PER_PAGE = 10;

export const metadata: Metadata = buildWebsiteMetadata({
  path: '/explore',
  title: 'Explore',
  description: 'Discover trending lists, debates, and fact drops. Find something new every day on YoTop10.',
});

export default async function ExplorePage() {
  const { data, failed } = await ssrLoad(() => API.getExplore(1, PER_PAGE));

  const posts: ExplorePost[] = data?.posts || [];
  const hasMore = 1 < (data?.pagination?.totalPages || 1);

  return <ExploreClient initialPosts={posts} initialHasMore={hasMore} initialFailed={failed} />;
}
