import { API } from '@/lib/api';
import type { Post } from '@/lib/api/types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CategoryFeedClient from './client';
import { absoluteUrl } from '@/lib/urls';
import { buildWebsiteMetadata, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/lib/seo/metadata';
import { isNotFound } from '@/lib/api/client';
import { ssrLoad } from '@/lib/api/ssr';
import { Icon } from '@/components/icons/Icon';
import { ReloadButton } from '@/components/ReloadButton';

export const runtime = 'nodejs';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  post_count: number;
  children: Array<{ id: string; name: string; slug: string; post_count: number }>;
}

interface PostsPayload {
  posts: Post[];
  pagination?: { page: number; totalPages: number };
}

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = slugParam ? slugParam.join('/') : '';
  if (!slug) return { title: 'Category Not Found' };
  try {
    const catData = await API.getCategory(slug) as { category: Category };
    const cat = catData.category;
    const description = cat.description?.slice(0, 200) || `Browse ${cat.post_count} ${cat.name} lists and debates on YoTop10.`;
    return buildWebsiteMetadata({
      path: `/c/${slug}`,
      title: cat.name,
      description,
      image: {
        url: absoluteUrl(`/og/category?slug=${encodeURIComponent(slug)}`),
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: `${cat.name} — YoTop10`,
        type: 'image/png',
      },
    });
  } catch (error) {
    // Only a real 404 earns "Not Found" — an outage is not a missing page.
    if (isNotFound(error)) return { title: 'Category Not Found' };
    return { title: 'Category — YoTop10' };
  }
}

/**
 * Backend unreachable / 5xx — deliberately NOT a 404. A category that exists
 * must never look like a dead link just because the API hiccuped.
 */
function CategoryUnavailable() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-zinc-600">
        <Icon name="CloudOff" size={48} />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">Category</h1>
      <p className="text-zinc-500 text-sm mb-6">
        We couldn&apos;t load this category right now. It may just be a hiccup.
      </p>
      <ReloadButton />
    </div>
  );
}

export default async function CategoryFeedPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = slugParam ? slugParam.join('/') : '';

  // Bare /c has no category — it is not an empty state, it is a missing page.
  if (!slug) notFound();

  // `isNotFound` stops the retry loop on an explicit 404: "this category does
  // not exist" is a final answer, not a transient failure to retry through.
  const categoryResult = await ssrLoad(
    () => API.getCategory(slug) as Promise<{ category: Category }>,
    3,
    isNotFound
  );

  if (categoryResult.failed) {
    if (isNotFound(categoryResult.error)) notFound();
    return <CategoryUnavailable />;
  }

  const category = categoryResult.data?.category ?? null;
  if (!category) notFound();

  const postsResult = await ssrLoad(
    () => API.getPosts({ category: slug, page: 1, limit: 20 }) as Promise<PostsPayload>
  );

  // The category itself loaded, so render it and let the feed area offer a
  // retry rather than throwing away what we already have.
  if (postsResult.failed) {
    return (
      <CategoryFeedClient
        slug={slug}
        initialCategory={category}
        initialPosts={[]}
        initialHasMore={false}
        initialPostsFailed
      />
    );
  }

  const posts = postsResult.data?.posts ?? [];
  const hasMore = (postsResult.data?.pagination?.totalPages ?? 1) > 1;

  return (
    <CategoryFeedClient
      slug={slug}
      initialCategory={category}
      initialPosts={posts}
      initialHasMore={hasMore}
    />
  );
}
