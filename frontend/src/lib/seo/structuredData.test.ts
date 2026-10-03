import { describe, it, expect } from 'vitest';
import {
  buildArticleJsonLd,
  buildAuthorPerson,
  buildProfilePageJsonLd,
  profilePath,
  visibleAuthorName,
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
