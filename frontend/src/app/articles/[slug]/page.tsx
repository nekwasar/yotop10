import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleDetailClient from './client';
import { API } from '@/lib/api';
import { absoluteUrl } from '@/lib/urls';
import { buildArticleMetadata, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/lib/seo/metadata';
import { resolveRobots, ARTICLE_MIN_CONTENT_LENGTH } from '@/lib/seo/indexability';

export const runtime = 'nodejs';

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = String(resolvedParams.slug);

  try {
    const data = await API.getArticle(slug, { noCount: true });
    const article = data.article;

    const robots = resolveRobots(article.robots, {
      status: article.status,
      created_at: article.created_at,
      comment_count: article.comment_count,
      view_count: article.view_count,
      content_length: article.body?.length || 0,
      min_content_length: ARTICLE_MIN_CONTENT_LENGTH,
    });

    const description = article.body?.substring(0, 160) ?? '';
    const dynamicOgImageUrl = absoluteUrl(`/articles/${slug}/opengraph-image`);
    const image = {
      url: dynamicOgImageUrl,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: `${article.title} — YoTop10`,
      type: 'image/png',
    };

    const base = buildArticleMetadata({
      slug,
      title: article.title,
      description,
      path: `/articles/${slug}`,
      image,
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at || article.published_at || article.created_at,
      authorName: article.author_display_name || article.author_username,
      section: article.category_name || article.category_slug,
      tags: ['article', article.category_slug].filter(Boolean),
    });

    return {
      ...base,
      robots,
    };
  } catch {
    return { title: 'Article Not Found', robots: { index: false, follow: true } };
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const slug = String(resolvedParams.slug);

  let initialArticle = null;
  try {
    const data = await API.getArticle(slug, { noCount: true });
    initialArticle = data.article;
  } catch {
    notFound();
  }

  if (!initialArticle) {
    notFound();
  }

  return <ArticleDetailClient slug={slug} initialArticle={initialArticle} />;
}
