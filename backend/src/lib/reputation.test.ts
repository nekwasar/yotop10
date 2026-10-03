import { describe, it, expect, vi, beforeEach } from 'vitest';

const { aggregateMock, userFindMock } = vi.hoisted(() => ({
  aggregateMock: vi.fn(),
  userFindMock: vi.fn(),
}));

vi.mock('../models/Post', () => ({
  Post: { aggregate: (pipeline: unknown[]) => aggregateMock(pipeline) },
}));

vi.mock('../models/User', () => ({
  User: { find: (query: unknown) => userFindMock(query) },
}));

import {
  evaluateAuthorReputation,
  fetchAuthorReputations,
  REPUTATION_MIN_APPROVED_POSTS,
  REPUTATION_MIN_ACCOUNT_AGE_DAYS,
  REPUTATION_MIN_TRUST_SCORE,
} from './reputation';

const NOW = new Date('2026-10-03T00:00:00.000Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86400000).toISOString();

function userQueryChain(users: Array<Record<string, unknown>>) {
  return {
    select: () => ({ lean: () => Promise.resolve(users) }),
  };
}

describe('reputation', () => {
  describe('constants', () => {
    it('matches the locked D4 thresholds', () => {
      expect(REPUTATION_MIN_APPROVED_POSTS).toBe(1);
      expect(REPUTATION_MIN_ACCOUNT_AGE_DAYS).toBe(7);
      expect(REPUTATION_MIN_TRUST_SCORE).toBe(1.0);
    });
  });

  describe('evaluateAuthorReputation', () => {
    it('is reputable when every threshold is met', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 3,
        created_at: daysAgo(30),
        trust_score: 1.4,
        now: NOW,
      });
      expect(result).toEqual({ approved_posts: 3, account_age_days: 30, reputable: true });
    });

    it('is not reputable with zero approved posts', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 0,
        created_at: daysAgo(30),
        trust_score: 1.4,
        now: NOW,
      });
      expect(result.reputable).toBe(false);
    });

    it('is not reputable one day before the account age threshold', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 5,
        created_at: daysAgo(6),
        trust_score: 1.4,
        now: NOW,
      });
      expect(result.account_age_days).toBe(6);
      expect(result.reputable).toBe(false);
    });

    it('is reputable exactly at the account age threshold', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 1,
        created_at: daysAgo(7),
        trust_score: 1.0,
        now: NOW,
      });
      expect(result.account_age_days).toBe(7);
      expect(result.reputable).toBe(true);
    });

    it('is not reputable below the trust score threshold', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 10,
        created_at: daysAgo(100),
        trust_score: 0.9,
        now: NOW,
      });
      expect(result.reputable).toBe(false);
    });

    it('treats a missing trust score as zero', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 10,
        created_at: daysAgo(100),
        now: NOW,
      });
      expect(result.reputable).toBe(false);
    });

    it('is not reputable when the account creation date is unknown', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 10,
        created_at: null,
        trust_score: 2.0,
        now: NOW,
      });
      expect(result.account_age_days).toBe(0);
      expect(result.reputable).toBe(false);
    });

    it('clamps a future creation date to zero days', () => {
      const result = evaluateAuthorReputation({
        approved_posts: 10,
        created_at: daysAgo(-3),
        trust_score: 2.0,
        now: NOW,
      });
      expect(result.account_age_days).toBe(0);
      expect(result.reputable).toBe(false);
    });
  });

  describe('fetchAuthorReputations', () => {
    beforeEach(() => {
      aggregateMock.mockReset();
      userFindMock.mockReset();
    });

    it('returns an empty map without querying for empty input', async () => {
      const result = await fetchAuthorReputations([]);
      expect(result.size).toBe(0);
      expect(aggregateMock).not.toHaveBeenCalled();
      expect(userFindMock).not.toHaveBeenCalled();
    });

    it('resolves reputation for known authors', async () => {
      aggregateMock.mockResolvedValue([{ _id: 'u1', count: 4 }]);
      userFindMock.mockReturnValue(userQueryChain([
        { user_id: 'u1', created_at: daysAgo(60), trust_score: 1.2 },
      ]));

      const result = await fetchAuthorReputations(['u1']);
      expect(result.get('u1')).toEqual({ approved_posts: 4, account_age_days: 60, reputable: true });
      expect(aggregateMock).toHaveBeenCalledWith([
        { $match: { author_id: { $in: ['u1'] }, status: 'approved', deleted: { $ne: true } } },
        { $group: { _id: '$author_id', count: { $sum: 1 } } },
      ]);
      expect(userFindMock).toHaveBeenCalledWith({ user_id: { $in: ['u1'] } });
    });

    it('marks authors without a user record as not reputable', async () => {
      aggregateMock.mockResolvedValue([]);
      userFindMock.mockReturnValue(userQueryChain([]));

      const result = await fetchAuthorReputations(['missing']);
      expect(result.get('missing')).toEqual({ approved_posts: 0, account_age_days: 0, reputable: false });
    });

    it('deduplicates author ids before querying', async () => {
      aggregateMock.mockResolvedValue([]);
      userFindMock.mockReturnValue(userQueryChain([]));

      await fetchAuthorReputations(['u1', 'u1', null, undefined, '']);
      expect(userFindMock).toHaveBeenCalledWith({ user_id: { $in: ['u1'] } });
    });

    it('counts an author with approved posts but a young account as not reputable', async () => {
      aggregateMock.mockResolvedValue([{ _id: 'u2', count: 12 }]);
      userFindMock.mockReturnValue(userQueryChain([
        { user_id: 'u2', created_at: daysAgo(2), trust_score: 1.0 },
      ]));

      const result = await fetchAuthorReputations(['u2']);
      expect(result.get('u2')).toEqual({ approved_posts: 12, account_age_days: 2, reputable: false });
    });
  });
});
