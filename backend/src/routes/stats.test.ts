/* eslint-disable no-restricted-syntax, @typescript-eslint/no-explicit-any -- Mongoose model mock typing */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const { cacheStore, cacheGet, cacheSet } = vi.hoisted(() => {
  const store = new Map<string, string>();
  return {
    cacheStore: store,
    cacheGet: vi.fn(async (key: string) => store.get(key) ?? null),
    cacheSet: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  };
});

vi.mock('../lib/redis', () => ({
  redis: { get: cacheGet, set: cacheSet },
}));

vi.mock('../models/Post', () => ({
  Post: { countDocuments: vi.fn() },
}));

vi.mock('../models/User', () => ({
  User: { countDocuments: vi.fn() },
}));

import statsRouter from './stats';
import { Post } from '../models/Post';
import { User } from '../models/User';

function createStatsApp() {
  const app = express();
  app.use('/api/stats', statsRouter);
  return app;
}

/** Deterministic per-filter counts so we can assert the exact payload. */
function installCounters() {
  vi.mocked(Post.countDocuments).mockImplementation(((filter: any) => {
    const postType = filter?.post_type;
    if (typeof postType === 'string' && postType === 'fact_drop') return Promise.resolve(7);
    if (postType && typeof postType === 'object') return Promise.resolve(12);
    return Promise.resolve(100);
  }) as any);
  vi.mocked(User.countDocuments).mockResolvedValue(42 as never);
}

describe('GET /api/stats/platform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheStore.clear();
    cacheGet.mockImplementation(async (key: string) => cacheStore.get(key) ?? null);
    cacheSet.mockImplementation(async (key: string, value: string) => {
      cacheStore.set(key, value);
    });
  });

  it('returns the four counters the homepage rail renders', async () => {
    installCounters();

    const res = await request(createStatsApp()).get('/api/stats/platform');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total_posts: 100,
      total_debates: 12,
      total_users: 42,
      total_facts: 7,
    });
  });

  it('counts only approved, non-deleted posts', async () => {
    installCounters();

    await request(createStatsApp()).get('/api/stats/platform');

    expect(vi.mocked(Post.countDocuments).mock.calls[0][0]).toMatchObject({
      status: 'approved',
      deleted: { $ne: true },
    });
    expect(vi.mocked(Post.countDocuments).mock.calls[1][0]).toMatchObject({
      post_type: { $in: ['this_vs_that', 'counter_list'] },
    });
    expect(vi.mocked(Post.countDocuments).mock.calls[2][0]).toMatchObject({
      post_type: 'fact_drop',
    });
  });

  it('serves the second request from the Redis cache', async () => {
    installCounters();

    const app = createStatsApp();
    const first = await request(app).get('/api/stats/platform');
    const second = await request(app).get('/api/stats/platform');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(vi.mocked(Post.countDocuments)).toHaveBeenCalledTimes(3);
    expect(cacheSet).toHaveBeenCalledTimes(1);
  });

  it('recomputes when refresh=1 is supplied', async () => {
    installCounters();

    const app = createStatsApp();
    await request(app).get('/api/stats/platform');
    await request(app).get('/api/stats/platform?refresh=1');

    expect(vi.mocked(Post.countDocuments)).toHaveBeenCalledTimes(6);
  });

  it('rejects an invalid refresh value with 400', async () => {
    installCounters();

    const res = await request(createStatsApp()).get('/api/stats/platform?refresh=yes');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION');
    expect(vi.mocked(Post.countDocuments)).not.toHaveBeenCalled();
  });

  it('still answers 200 when Redis is unavailable', async () => {
    installCounters();
    cacheGet.mockRejectedValue(new Error('redis down'));
    cacheSet.mockRejectedValue(new Error('redis down'));

    const res = await request(createStatsApp()).get('/api/stats/platform');

    expect(res.status).toBe(200);
    expect(res.body.total_posts).toBe(100);
  });

  it('returns 500 when the database query fails', async () => {
    vi.mocked(Post.countDocuments).mockRejectedValue(new Error('db down') as never);
    vi.mocked(User.countDocuments).mockRejectedValue(new Error('db down') as never);

    const res = await request(createStatsApp()).get('/api/stats/platform');

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('SERVER_ERROR');
  });
});
