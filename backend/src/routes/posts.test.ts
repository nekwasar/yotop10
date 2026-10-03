import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../models/Post', () => ({
  Post: { find: vi.fn(), findOne: vi.fn(), findById: vi.fn(), findByIdAndUpdate: vi.fn(), create: vi.fn(), aggregate: vi.fn() },
  generateUniqueSlug: vi.fn(() => 'test-slug-abc123'),
}));

vi.mock('../models/User', () => ({
  User: { find: vi.fn(), findOne: vi.fn() },
}));

vi.mock('../models/ListItem', () => ({
  ListItem: { create: vi.fn() },
}));

vi.mock('../models/Category', () => ({
  Category: { findById: vi.fn(), findByIdAndUpdate: vi.fn(), findOne: vi.fn(() => ({ _id: 'cat123', slug: 'tech' })) },
}));

vi.mock('../models/Comment', () => ({}));

vi.mock('../lib/redis', () => ({
  atomicCheckRateLimit: vi.fn(),
}));

vi.mock('../lib/ladderSystem', () => ({
  getActiveBoost: vi.fn(() => null),
}));

vi.mock('../lib/titleSimilarityV2', () => ({
  findSimilarTitles: vi.fn(() => Promise.resolve([])),
}));

import { atomicCheckRateLimit } from '../lib/redis';
import { Post } from '../models/Post';
import { User } from '../models/User';
import postsRouter from '../routes/posts';

const asMock = (fn: unknown): ReturnType<typeof vi.fn> => fn as ReturnType<typeof vi.fn>;

const chain = <T>(value: T): Record<string, unknown> => {
  const c: Record<string, unknown> = {};
  c.sort = () => c;
  c.select = () => c;
  c.limit = () => c;
  c.lean = () => Promise.resolve(value);
  c.then = (onOk: (v: T) => unknown, onErr?: (e: unknown) => unknown) => Promise.resolve(value).then(onOk, onErr);
  return c;
};

function createApp() {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    if (!req.user && !req.fingerprint) {
      next();
    } else {
      next();
    }
  });

  app.use('/api/posts', postsRouter);
  return app;
}

describe('POST /api/posts — rate limit integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(atomicCheckRateLimit).mockResolvedValue({ allowed: true, remaining: 10 });
  });

  it('returns 401 when fingerprint is missing', async () => {
    const res = await request(createApp())
      .post('/api/posts')
      .send({
        title: 'Top 10 Test Post Title',
        post_type: 'top_list',
        intro: 'Test intro',
        category_slug: 'tech',
        items: [
          { rank: 1, title: 'Item 1', justification: 'Justification' },
          { rank: 2, title: 'Item 2', justification: 'Justification 2' },
          { rank: 3, title: 'Item 3', justification: 'Justification 3' },
        ],
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Device identity');
  });

  it('rejects when rate limit exceeded', async () => {
    vi.mocked(atomicCheckRateLimit).mockResolvedValue({ allowed: false, remaining: 0 });

    const res = await request(createApp())
      .post('/api/posts')
      .set('x-device-fingerprint', 'test-fp-123')
      .send({
        title: 'Top 10 Test Post Title',
        post_type: 'top_list',
        intro: 'Test intro',
        category_slug: 'tech',
        items: [
          { rank: 1, title: 'Item 1', justification: 'Justification' },
          { rank: 2, title: 'Item 2', justification: 'Justification 2' },
          { rank: 3, title: 'Item 3', justification: 'Justification 3' },
        ],
        device_fingerprint: 'test-fp-123',
      });

    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Rate limit exceeded');
    expect(res.body.error).not.toContain('NaN');
  });
});

describe('GET /api/posts/sitemap — index hygiene (M32.2, D4)', () => {
  const app = createApp();
  const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);

  const healthyPost = {
    slug: 'healthy-post-abc123',
    created_at: daysAgo(30),
    updated_at: daysAgo(29),
    bumped_at: null,
    comment_count: 5,
    view_count: 120,
    intro: 'A long enough intro that clears the thin-content threshold without any trouble. It keeps going with a few extra words for safety.',
    author_id: 'u1',
    meta_robots: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    asMock(Post.aggregate).mockResolvedValue([{ _id: 'u1', count: 3 }]);
    asMock(User.find).mockReturnValue(chain([
      { user_id: 'u1', created_at: daysAgo(60), trust_score: 1.5 },
    ]));
  });

  it('emits index, follow for an approved post by a reputable author', async () => {
    asMock(Post.find).mockReturnValue(chain([healthyPost]));

    const res = await request(app).get('/api/posts/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].slug).toBe('healthy-post-abc123');
    expect(res.body.posts[0].robots).toBe('index, follow');
    expect(typeof res.body.posts[0].lastmod).toBe('string');
  });

  it('noindexes an otherwise healthy post when the author has no reputation', async () => {
    asMock(Post.find).mockReturnValue(chain([healthyPost]));
    asMock(User.find).mockReturnValue(chain([]));

    const res = await request(app).get('/api/posts/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.posts[0].robots).toBe('noindex, follow');
  });

  it('noindexes a stale post even when the author is reputable', async () => {
    asMock(Post.find).mockReturnValue(chain([
      { ...healthyPost, slug: 'stale-post-def456', comment_count: 0, view_count: 0, created_at: daysAgo(10) },
    ]));

    const res = await request(app).get('/api/posts/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.posts[0].robots).toBe('noindex, follow');
  });

  it('keeps an explicit meta_robots override', async () => {
    asMock(Post.find).mockReturnValue(chain([
      { ...healthyPost, slug: 'manual-noindex-ghi789', meta_robots: 'noindex, follow' },
    ]));

    const res = await request(app).get('/api/posts/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.posts[0].robots).toBe('noindex, follow');
  });
});
