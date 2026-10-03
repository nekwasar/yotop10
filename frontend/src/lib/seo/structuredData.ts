import { absoluteUrl } from '@/lib/urls';
import { toPublicSlug } from '@/lib/username';

export interface AuthorRef {
  username: string;
  displayName?: string | null;
}

export interface ProfileLinks {
  medium?: string;
  x?: string;
  github?: string;
}

export interface ProfilePageSource {
  username: string;
  bio?: string | null;
  profile_image_url?: string | null;
  links?: ProfileLinks | null;
  created_at?: string;
  member_since?: string | null;
}

export interface ArticleSource {
  slug: string;
  title: string;
  body?: string | null;
  cover_image?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  created_at: string;
  updated_at?: string | null;
  published_at?: string | null;
  author: AuthorRef;
}

export function profilePath(username: string): string {
  return `/a/${toPublicSlug(username)}`;
}

export function visibleAuthorName(author: AuthorRef): string {
  const stripped = (author.displayName || '').replace(/^a_/, '').trim();
  return stripped || toPublicSlug(author.username);
}

function buildSameAs(links?: ProfileLinks | null): string[] {
  const medium = (links?.medium || '').trim();
  const handleX = (links?.x || '').trim();
  const github = (links?.github || '').trim();
  const urls: string[] = [];
  if (medium) urls.push(`https://medium.com/@${medium}`);
  if (handleX) urls.push(`https://x.com/${handleX}`);
  if (github) urls.push(`https://github.com/${github}`);
  return urls;
}

export function buildAuthorPerson(author: AuthorRef): Record<string, unknown> {
  return {
    '@type': 'Person',
    name: visibleAuthorName(author),
    url: absoluteUrl(profilePath(author.username)),
  };
}

export function buildProfilePageJsonLd(profile: ProfilePageSource): Record<string, unknown> {
  const url = absoluteUrl(profilePath(profile.username));
  const bio = (profile.bio || '').trim();
  const sameAs = buildSameAs(profile.links);
  const memberSince = (profile.member_since || profile.created_at || '').trim();

  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': `${url}#person`,
    name: toPublicSlug(profile.username),
    url,
  };
  if (bio) {
    person.description = bio;
  }
  if (profile.profile_image_url) {
    person.image = profile.profile_image_url;
  }
  if (sameAs.length > 0) {
    person.sameAs = sameAs;
  }
  if (memberSince) {
    person.member = {
      '@type': 'OrganizationMembership',
      startDate: memberSince,
      memberOf: { '@type': 'Organization', name: 'YoTop10', url: absoluteUrl('/') },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profile`,
    url,
    mainEntity: person,
  };
}

export function buildArticleJsonLd(article: ArticleSource): Record<string, unknown> {
  const url = absoluteUrl(`/articles/${article.slug}`);
  const description = (article.body || '').substring(0, 160);
  const section = (article.category_name || article.category_slug || '').trim();

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.cover_image || absoluteUrl(`/articles/${article.slug}/opengraph-image`),
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    mainEntityOfPage: url,
    author: buildAuthorPerson(article.author),
  };
  if (description) {
    ld.description = description;
  }
  if (section) {
    ld.articleSection = section;
  }
  return ld;
}
