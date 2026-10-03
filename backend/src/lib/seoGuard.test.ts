import { describe, it, expect } from 'vitest';
import {
  shouldNoIndex,
  robotsFor,
  isThinProfile,
  profileRobots,
  SeoSignals,
  DEFAULT_MIN_CONTENT_LENGTH,
  ARTICLE_MIN_CONTENT_LENGTH,
} from './seoGuard';

describe('seoGuard', () => {
  describe('shouldNoIndex', () => {
    it('returns false for approved + engaged post (index)', () => {
      const signals: SeoSignals = {
        comment_count: 5,
        view_count: 100,
        content_length: 500,
        status: 'approved',
        age_hours: 72,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('returns true for pending_review post (noindex)', () => {
      const signals: SeoSignals = {
        comment_count: 10,
        view_count: 200,
        content_length: 500,
        status: 'pending_review',
        age_hours: 1,
      };
      expect(shouldNoIndex(signals)).toBe(true);
    });

    it('returns true for rejected post (noindex)', () => {
      const signals: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 500,
        status: 'rejected',
        age_hours: 10,
      };
      expect(shouldNoIndex(signals)).toBe(true);
    });

    it('returns true for stale post (0 comments, 0 views, >48h) (noindex)', () => {
      const signals: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 500,
        status: 'approved',
        age_hours: 72,
      };
      expect(shouldNoIndex(signals)).toBe(true);
    });

    it('returns false for stale but <48h (index)', () => {
      const signals: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 500,
        status: 'approved',
        age_hours: 24,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('returns true for thin content (<100 chars) + >24h (noindex)', () => {
      const signals: SeoSignals = {
        comment_count: 1,
        view_count: 5,
        content_length: 50,
        status: 'approved',
        age_hours: 48,
      };
      expect(shouldNoIndex(signals)).toBe(true);
    });

    it('returns false for thin content but <24h (index)', () => {
      const signals: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 50,
        status: 'approved',
        age_hours: 12,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('returns false for normal content (index)', () => {
      const signals: SeoSignals = {
        comment_count: 2,
        view_count: 10,
        content_length: 200,
        status: 'approved',
        age_hours: 100,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('handles zero content length edge case', () => {
      const signals: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 0,
        status: 'approved',
        age_hours: 25,
      };
      expect(shouldNoIndex(signals)).toBe(true);
    });

    it('returns false for very old but highly engaged post (index)', () => {
      const signals: SeoSignals = {
        comment_count: 500,
        view_count: 50000,
        content_length: 300,
        status: 'approved',
        age_hours: 8760,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('returns false for exactly at content_length boundary (100) (index)', () => {
      const signals: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 100,
        status: 'approved',
        age_hours: 48,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('returns false for exactly at age boundary (48h) with zero engagement (index)', () => {
      const signals: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 200,
        status: 'approved',
        age_hours: 48,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('returns true when the author fails the reputation gate (D4)', () => {
      const signals: SeoSignals = {
        comment_count: 50,
        view_count: 5000,
        content_length: 800,
        status: 'approved',
        age_hours: 72,
        author_reputable: false,
      };
      expect(shouldNoIndex(signals)).toBe(true);
    });

    it('returns false when the author passes the reputation gate (D4)', () => {
      const signals: SeoSignals = {
        comment_count: 5,
        view_count: 100,
        content_length: 800,
        status: 'approved',
        age_hours: 72,
        author_reputable: true,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('does not gate on reputation when it was not evaluated', () => {
      const signals: SeoSignals = {
        comment_count: 50,
        view_count: 5000,
        content_length: 800,
        status: 'approved',
        age_hours: 72,
      };
      expect(signals.author_reputable).toBeUndefined();
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('reaches an identical indexable decision regardless of ai_assisted (D3)', () => {
      const base: SeoSignals = {
        comment_count: 5,
        view_count: 100,
        content_length: 500,
        status: 'approved',
        age_hours: 72,
      };
      expect(shouldNoIndex({ ...base, ai_assisted: true })).toBe(shouldNoIndex(base));
      expect(shouldNoIndex({ ...base, ai_assisted: false })).toBe(shouldNoIndex(base));
    });

    it('reaches an identical noindex decision regardless of ai_assisted (D3)', () => {
      const base: SeoSignals = {
        comment_count: 0,
        view_count: 0,
        content_length: 50,
        status: 'pending_review',
        age_hours: 100,
      };
      expect(shouldNoIndex({ ...base, ai_assisted: true })).toBe(
        shouldNoIndex({ ...base, ai_assisted: false }),
      );
    });

    it('uses the article content threshold when provided', () => {
      const signals: SeoSignals = {
        comment_count: 1,
        view_count: 10,
        content_length: 150,
        status: 'approved',
        age_hours: 72,
        min_content_length: ARTICLE_MIN_CONTENT_LENGTH,
      };
      expect(shouldNoIndex(signals)).toBe(true);
    });

    it('indexes article-length content at the article threshold boundary', () => {
      const signals: SeoSignals = {
        comment_count: 1,
        view_count: 10,
        content_length: ARTICLE_MIN_CONTENT_LENGTH,
        status: 'approved',
        age_hours: 72,
        min_content_length: ARTICLE_MIN_CONTENT_LENGTH,
      };
      expect(shouldNoIndex(signals)).toBe(false);
    });

    it('exposes a 100-character default content threshold', () => {
      expect(DEFAULT_MIN_CONTENT_LENGTH).toBe(100);
      expect(ARTICLE_MIN_CONTENT_LENGTH).toBe(200);
    });
  });

  describe('robotsFor', () => {
    it('keeps noindex directives followable', () => {
      expect(robotsFor(true)).toBe('noindex, follow');
    });

    it('emits an indexable directive otherwise', () => {
      expect(robotsFor(false)).toBe('index, follow');
    });
  });

  describe('isThinProfile', () => {
    it('is thin with no bio and no approved posts (D7)', () => {
      expect(isThinProfile({ bio: '', approved_posts: 0 })).toBe(true);
      expect(isThinProfile({ bio: '   ', approved_posts: 0 })).toBe(true);
      expect(isThinProfile({ bio: undefined, approved_posts: 0 })).toBe(true);
      expect(isThinProfile({ bio: null, approved_posts: 0 })).toBe(true);
    });

    it('is not thin when a bio exists', () => {
      expect(isThinProfile({ bio: 'I rank things', approved_posts: 0 })).toBe(false);
    });

    it('is not thin when approved posts exist', () => {
      expect(isThinProfile({ bio: '', approved_posts: 1 })).toBe(false);
    });
  });

  describe('profileRobots', () => {
    it('noindexes thin profiles but keeps them followable (D7)', () => {
      expect(profileRobots({ bio: '', approved_posts: 0 })).toBe('noindex, follow');
    });

    it('indexes profiles with an approved post', () => {
      expect(profileRobots({ bio: '', approved_posts: 3 })).toBe('index, follow');
    });

    it('indexes profiles with a bio', () => {
      expect(profileRobots({ bio: 'hello', approved_posts: 0 })).toBe('index, follow');
    });
  });
});
