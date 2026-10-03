import { describe, it, expect } from 'vitest';
import {
  buildArticleJsonLd,
  buildAuthorPerson,
  buildDiscussionForumPostingJsonLd,
  buildProfilePageJsonLd,
  profilePath,
  visibleAuthorName,
  visibleComments,
  type CommentSource,
} from './structuredData';

const SITE = 'https://yotop10.com';

describe('profilePath', () => {
  it('resolves identity URLs through the collision-free public slug', () => {
    expect(profilePath('a_dbb4_aed5')).toBe('/a/dbb4_aed5');
    expect(profilePath('cyprianzube')).toBe('/a/cyprianzube');
  });
});

describe('visibleAuthorName', () => {
  it('strips the storage prefix so the markup matches the byline', () => {
    expect(visibleAuthorName({ username: 'a_dbb4_aed5', displayName: 'a_dbb4_aed5' })).toBe('dbb4_aed5');
  });

  it('keeps a custom display name', () => {
    expect(visibleAuthorName({ username: 'a_dbb4_aed5', displayName: 'Cyprian' })).toBe('Cyprian');
  });

  it('falls back to the public slug when no display name exists', () => {
    expect(visibleAuthorName({ username: 'a_dbb4_aed5' })).toBe('dbb4_aed5');
  });
});

describe('buildAuthorPerson', () => {
  it('points the author at the profile URL used by the byline', () => {
    expect(buildAuthorPerson({ username: 'cyprianzube', displayName: 'Cyprian' })).toEqual({
      '@type': 'Person',
      name: 'Cyprian',
      url: `${SITE}/a/cyprianzube`,
    });
  });
});

describe('buildProfilePageJsonLd', () => {
  const source = {
    username: 'a_dbb4_aed5',
    bio: 'Ranked lists, defended with sources.',
    profile_image_url: 'https://cdn.example.com/avatar.png',
    links: { medium: 'cyprian', x: 'cyprian', github: 'cyprian' },
    created_at: '2026-10-01T00:00:00.000Z',
    member_since: '2026-10-01T00:00:00.000Z',
  };

  it('emits ProfilePage + Person mirroring the visible profile header', () => {
    const ld = buildProfilePageJsonLd(source);

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('ProfilePage');
    expect(ld['@id']).toBe(`${SITE}/a/dbb4_aed5#profile`);
    expect(ld.url).toBe(`${SITE}/a/dbb4_aed5`);

    const person = ld.mainEntity as Record<string, unknown>;
    expect(person['@type']).toBe('Person');
    expect(person['@id']).toBe(`${SITE}/a/dbb4_aed5#person`);
    expect(person.name).toBe('dbb4_aed5');
    expect(person.url).toBe(`${SITE}/a/dbb4_aed5`);
    expect(person.description).toBe('Ranked lists, defended with sources.');
    expect(person.image).toBe('https://cdn.example.com/avatar.png');
    expect(person.sameAs).toEqual([
      'https://medium.com/@cyprian',
      'https://x.com/cyprian',
      'https://github.com/cyprian',
    ]);
    expect(person.member).toEqual({
      '@type': 'OrganizationMembership',
      startDate: '2026-10-01T00:00:00.000Z',
      memberOf: { '@type': 'Organization', name: 'YoTop10', url: `${SITE}/` },
    });
  });

  it('omits optional claims instead of inventing them for a bare profile', () => {
    const ld = buildProfilePageJsonLd({ username: 'ghost_user' });
    const person = ld.mainEntity as Record<string, unknown>;

    expect(person.description).toBeUndefined();
    expect(person.image).toBeUndefined();
    expect(person.sameAs).toBeUndefined();
    expect(person.member).toBeUndefined();
    expect(Object.keys(person).sort()).toEqual(['@id', '@type', 'name', 'url']);
  });

  it('uses the creation date when member_since is absent', () => {
    const ld = buildProfilePageJsonLd({ username: 'cyprianzube', created_at: '2026-10-01T00:00:00.000Z' });
    const person = ld.mainEntity as Record<string, unknown>;
    const member = person.member as Record<string, unknown>;
    expect(member.startDate).toBe('2026-10-01T00:00:00.000Z');
  });

  it('serializes cleanly for the script tag', () => {
    const parsed = JSON.parse(JSON.stringify(buildProfilePageJsonLd(source)));
    expect(parsed['@type']).toBe('ProfilePage');
  });
});

describe('buildArticleJsonLd', () => {
  const source = {
    slug: 'dopamine-controls-your-life',
    title: 'Dopamine Controls Your Life',
    body: 'B'.repeat(400),
    cover_image: null,
    category_name: 'Science',
    category_slug: 'science',
    created_at: '2026-10-01T00:00:00.000Z',
    updated_at: '2026-10-02T00:00:00.000Z',
    published_at: '2026-10-01T12:00:00.000Z',
    author: { username: 'a_cyprianzube', displayName: 'Cyprian' },
  };

  it('emits Article metadata that mirrors the rendered page', () => {
    const ld = buildArticleJsonLd(source);

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Article');
    expect(ld.headline).toBe('Dopamine Controls Your Life');
    expect(ld.description).toBe('B'.repeat(160));
    expect(ld.image).toBe(`${SITE}/articles/dopamine-controls-your-life/opengraph-image`);
    expect(ld.datePublished).toBe('2026-10-01T12:00:00.000Z');
    expect(ld.dateModified).toBe('2026-10-02T00:00:00.000Z');
    expect(ld.mainEntityOfPage).toBe(`${SITE}/articles/dopamine-controls-your-life`);
    expect(ld.articleSection).toBe('Science');
    expect(ld.author).toEqual({
      '@type': 'Person',
      name: 'Cyprian',
      url: `${SITE}/a/cyprianzube`,
    });
  });

  it('keeps the cover image when one is set', () => {
    const ld = buildArticleJsonLd({ ...source, cover_image: 'https://cdn.example.com/cover.jpg' });
    expect(ld.image).toBe('https://cdn.example.com/cover.jpg');
  });

  it('leaves out empty optional fields instead of padding them', () => {
    const ld = buildArticleJsonLd({
      slug: 'bare-article',
      title: 'Bare',
      body: '',
      cover_image: undefined,
      category_name: undefined,
      category_slug: undefined,
      created_at: '2026-10-01T00:00:00.000Z',
      author: { username: 'cyprianzube' },
    });

    expect(ld.description).toBeUndefined();
    expect(ld.articleSection).toBeUndefined();
    expect(Object.keys(ld).sort()).toEqual([
      '@context',
      '@type',
      'author',
      'dateModified',
      'datePublished',
      'headline',
      'image',
      'mainEntityOfPage',
    ]);
  });

  it('never invents a publisher, rating or comment count', () => {
    const ld = buildArticleJsonLd(source);
    expect(ld.publisher).toBeUndefined();
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.interactionStatistic).toBeUndefined();
  });
});

describe('visibleComments', () => {
  it('keeps only depth-0 roots, flattened in render order (parent then replies)', () => {
    const reply = makeComment({ id: 'c2', depth: 1 });
    const roots = [makeComment({ id: 'c1', replies: [reply] }), makeComment({ id: 'c3' })];

    expect(visibleComments(roots).map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
  });

  it('drops orphaned replies the client never renders', () => {
    expect(visibleComments([makeComment({ id: 'c9', depth: 1 })]).map((c) => c.id)).toEqual([]);
  });

  it('returns an empty list for missing input', () => {
    expect(visibleComments([])).toEqual([]);
    expect(visibleComments(undefined as never)).toEqual([]);
  });
});

describe('buildDiscussionForumPostingJsonLd', () => {
  const post = {
    slug: 'top-10-coffee-shops',
    title: 'Top 10 Coffee Shops',
    intro: 'Ranked after 40 visits across three cities.',
    comment_count: 3,
    created_at: '2026-10-01T00:00:00.000Z',
    author: { username: 'a_cyprianzube', displayName: 'Cyprian' },
  };

  it('returns null on a comment-less post so no markup is emitted', () => {
    expect(buildDiscussionForumPostingJsonLd(post, [])).toBeNull();
  });

  it('returns null when the visible intro is empty (text is a required property)', () => {
    expect(buildDiscussionForumPostingJsonLd({ ...post, intro: '   ' }, [makeComment({})])).toBeNull();
  });

  it('emits the required DiscussionForumPosting properties', () => {
    const ld = buildDiscussionForumPostingJsonLd(post, [makeComment({})]);

    expect(ld).not.toBeNull();
    expect(ld!['@context']).toBe('https://schema.org');
    expect(ld!['@type']).toBe('DiscussionForumPosting');
    expect(ld!.headline).toBe('Top 10 Coffee Shops');
    expect(ld!.text).toBe('Ranked after 40 visits across three cities.');
    expect(ld!.datePublished).toBe('2026-10-01T00:00:00.000Z');
    expect(ld!.mainEntityOfPage).toBe(`${SITE}/top-10-coffee-shops`);
    expect(ld!.author).toEqual({
      '@type': 'Person',
      name: 'Cyprian',
      url: `${SITE}/a/cyprianzube`,
    });
  });

  it('marks up each visible comment with Google-required properties, in page order', () => {
    const reply = makeComment({
      id: 'c2',
      depth: 1,
      content: 'Agreed.',
      author_username: 'a_ee51_ff30',
      author_display_name: 'a_ee51_ff30',
    });
    const ld = buildDiscussionForumPostingJsonLd(post, [
      makeComment({ id: 'c1' }),
      makeComment({ id: 'c0', depth: 1 }),
      makeComment({
        id: 'c3',
        content: 'Second root',
        author_username: 'cyprianzube',
        author_display_name: 'Cyprian Zube',
        replies: [reply],
      }),
    ]);

    const comments = ld!.comment as Array<Record<string, unknown>>;
    expect(comments).toHaveLength(3);
    expect(comments.map((c) => c.text)).toEqual(['Great list!', 'Second root', 'Agreed.']);
    expect(comments[0]).toEqual({
      '@type': 'Comment',
      datePublished: '2026-10-02T00:00:00.000Z',
      text: 'Great list!',
      author: {
        '@type': 'Person',
        name: 'dbb4_aed5',
        url: `${SITE}/a/dbb4_aed5`,
      },
    });
    expect(comments[1].author).toEqual({
      '@type': 'Person',
      name: 'Cyprian Zube',
      url: `${SITE}/a/cyprianzube`,
    });
    expect(comments[2].author).toEqual({
      '@type': 'Person',
      name: 'ee51_ff30',
      url: `${SITE}/a/ee51_ff30`,
    });
  });

  it('shows the count from the visible Comments (N) heading', () => {
    const ld = buildDiscussionForumPostingJsonLd(post, [makeComment({})]);
    expect(ld!.commentCount).toBe(3);
  });

  it('never reports fewer comments than it marks up when the counter lags', () => {
    const ld = buildDiscussionForumPostingJsonLd(
      { ...post, comment_count: 1 },
      [makeComment({ id: 'c1' }), makeComment({ id: 'c2' })],
    );
    expect(ld!.commentCount).toBe(2);
  });

  it('skips blank comment bodies instead of emitting empty required text', () => {
    const ld = buildDiscussionForumPostingJsonLd(post, [
      makeComment({ content: '   ' }),
      makeComment({ id: 'c2', content: 'Kept' }),
    ]);

    const comments = ld!.comment as Array<Record<string, unknown>>;
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toBe('Kept');
  });

  it('round-trips through JSON without undefined or unsupported values', () => {
    const ld = buildDiscussionForumPostingJsonLd(post, [
      makeComment({
        replies: [makeComment({ id: 'c2', depth: 1, content: '<script></script>' })],
      }),
    ]);

    const parsed = JSON.parse(JSON.stringify(ld));
    expect(parsed['@type']).toBe('DiscussionForumPosting');
    expect(parsed.comment).toHaveLength(2);
    expect(parsed.comment[1].text).toBe('<script></script>');
  });
});

function makeComment(over: Partial<CommentSource> = {}): CommentSource {
  return {
    id: 'c1',
    content: 'Great list!',
    depth: 0,
    author_username: 'a_dbb4_aed5',
    author_display_name: 'a_dbb4_aed5',
    created_at: '2026-10-02T00:00:00.000Z',
    ...over,
  };
}
