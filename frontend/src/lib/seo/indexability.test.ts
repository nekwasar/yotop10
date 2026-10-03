import { describe, it, expect } from 'vitest';
import {
  parseRobots,
  shouldNoindex,
  resolveRobots,
  resolveProfileRobots,
  isIndexable,
  DEFAULT_MIN_CONTENT_LENGTH,
  ARTICLE_MIN_CONTENT_LENGTH,
} from './indexability';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000);

const healthySignals = {
  status: 'approved',
  created_at: hoursAgo(72),
  comment_count: 5,
  view_count: 120,
  content_length: 400,
};

describe('parseRobots', () => {
  it('parses an indexable directive', () => {
    expect(parseRobots('index, follow')).toEqual({ index: true, follow: true });
  });

  it('parses a noindex directive but keeps it followable', () => {
    expect(parseRobots('noindex, follow')).toEqual({ index: false, follow: true });
  });

  it('parses a nofollow directive', () => {
    expect(parseRobots('index, nofollow')).toEqual({ index: true, follow: false });
    expect(parseRobots('noindex, nofollow')).toEqual({ index: false, follow: false });
  });

  it('treats missing directives as indexable', () => {
    expect(parseRobots(null)).toEqual({ index: true, follow: true });
    expect(parseRobots(undefined)).toEqual({ index: true, follow: true });
    expect(parseRobots('')).toEqual({ index: true, follow: true });
  });

  it('is case-insensitive', () => {
    expect(parseRobots('NOINDEX, FOLLOW').index).toBe(false);
  });
});

describe('shouldNoindex', () => {
  it('indexes healthy approved content', () => {
    expect(shouldNoindex(healthySignals)).toBe(false);
  });

  it('noindexes anything that is not approved', () => {
    expect(shouldNoindex({ ...healthySignals, status: 'pending_review' })).toBe(true);
    expect(shouldNoindex({ ...healthySignals, status: undefined })).toBe(true);
    expect(shouldNoindex({ ...healthySignals, status: null })).toBe(true);
  });

  it('noindexes stale content with zero engagement after 48h', () => {
    expect(shouldNoindex({
      ...healthySignals,
      created_at: hoursAgo(49),
      comment_count: 0,
      view_count: 0,
    })).toBe(true);
  });

  it('keeps unengaged content indexable inside the 48h window', () => {
    expect(shouldNoindex({
      ...healthySignals,
      created_at: hoursAgo(47),
      comment_count: 0,
      view_count: 0,
    })).toBe(false);
  });

  it('noindexes thin post content after 24h', () => {
    expect(shouldNoindex({
      ...healthySignals,
      created_at: hoursAgo(30),
      content_length: DEFAULT_MIN_CONTENT_LENGTH - 1,
    })).toBe(true);
  });

  it('uses the article threshold when provided', () => {
    expect(shouldNoindex({
      ...healthySignals,
      created_at: hoursAgo(30),
      content_length: 150,
      min_content_length: ARTICLE_MIN_CONTENT_LENGTH,
    })).toBe(true);
    expect(shouldNoindex({
      ...healthySignals,
      created_at: hoursAgo(30),
      content_length: ARTICLE_MIN_CONTENT_LENGTH,
      min_content_length: ARTICLE_MIN_CONTENT_LENGTH,
    })).toBe(false);
  });
});

describe('resolveRobots', () => {
  it('prefers the server-provided directive over local signals', () => {
    expect(resolveRobots('noindex, follow', { ...healthySignals, status: 'pending_review' }))
      .toEqual({ index: false, follow: true });
    expect(resolveRobots('index, follow', { ...healthySignals, status: 'pending_review' }))
      .toEqual({ index: true, follow: true });
  });

  it('falls back to quality signals when no directive is provided', () => {
    expect(resolveRobots(null, { ...healthySignals, status: 'pending_review' }))
      .toEqual({ index: false, follow: true });
    expect(resolveRobots(undefined, healthySignals))
      .toEqual({ index: true, follow: true });
    expect(resolveRobots('   ', { ...healthySignals, status: 'rejected' }))
      .toEqual({ index: false, follow: true });
  });

  it('defaults to indexable when nothing is known', () => {
    expect(resolveRobots()).toEqual({ index: true, follow: true });
    expect(resolveRobots(null)).toEqual({ index: true, follow: true });
  });
});

describe('isIndexable', () => {
  const fixtures = [
    { preferred: 'index, follow', fallback: undefined },
    { preferred: 'noindex, follow', fallback: undefined },
    { preferred: null, fallback: { ...healthySignals } },
    { preferred: null, fallback: { ...healthySignals, status: 'pending_review' } },
    { preferred: null, fallback: { ...healthySignals, created_at: hoursAgo(49), comment_count: 0, view_count: 0 } },
    { preferred: null, fallback: { ...healthySignals, created_at: hoursAgo(30), content_length: 40 } },
    { preferred: undefined, fallback: undefined },
  ];

  it('matches resolveRobots(...).index for every fixture (sitemap ⊆ metadata)', () => {
    for (const fixture of fixtures) {
      expect(isIndexable(fixture.preferred, fixture.fallback))
        .toBe(resolveRobots(fixture.preferred, fixture.fallback).index);
    }
  });

  it('drops every noindex entry', () => {
    expect(isIndexable('noindex, follow')).toBe(false);
    expect(isIndexable(null, { ...healthySignals, status: 'rejected' })).toBe(false);
    expect(isIndexable('index, follow', { ...healthySignals, status: 'rejected' })).toBe(true);
  });
});

describe('resolveProfileRobots', () => {
  it('prefers the server-provided directive', () => {
    expect(resolveProfileRobots({ robots: 'noindex, follow', bio: 'hello', approved_posts: 4 }))
      .toEqual({ index: false, follow: true });
    expect(resolveProfileRobots({ robots: 'index, follow', bio: '', approved_posts: 0 }))
      .toEqual({ index: true, follow: true });
  });

  it('noindexes a profile with no bio and no approved posts (D7)', () => {
    expect(resolveProfileRobots({ bio: '', approved_posts: 0 }))
      .toEqual({ index: false, follow: true });
    expect(resolveProfileRobots({ bio: '   ', approved_posts: 0 }))
      .toEqual({ index: false, follow: true });
    expect(resolveProfileRobots({ bio: null, approved_posts: null }))
      .toEqual({ index: false, follow: true });
  });

  it('indexes a profile with a bio', () => {
    expect(resolveProfileRobots({ bio: 'I rank things', approved_posts: 0 }))
      .toEqual({ index: true, follow: true });
  });

  it('indexes a profile with an approved post', () => {
    expect(resolveProfileRobots({ bio: '', approved_posts: 1 }))
      .toEqual({ index: true, follow: true });
  });
});
