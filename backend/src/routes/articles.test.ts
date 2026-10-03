import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../models/Article', () => ({
  Article: { find: vi.fn(), findOne: vi.fn(), findByIdAndUpdate: vi.fn(), countDocuments: vi.fn() },
}));

vi.mock('../models/Post', () => ({
  Post: { aggregate: vi.fn(async () => [{ _id: 'u1', count: 3 }]) },
}));

vi.mock('../models/User', () => ({
  User: {
    find: vi.fn(() => ({
      select: () => ({
        lean: () => Promise.resolve([
          { user_id: 'u1', created_at: new Date(Date.now() - 60 * 86400000), trust_score: 1.5 },
        ]),
      }),
    })),
  },
}));

vi.mock('../lib/redis', () => ({
  redis: { get: vi.fn(async () => null), set: vi.fn(async () => 'OK') },
}));

vi.mock('../lib/auditWriter', () => ({ logAudit: vi.fn(async () => undefined) }));

vi.mock('../middleware/fingerprint', () => ({
  getFingerprintIdentity: vi.fn(() => null),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

vi.mock('../lib/viewCounting', () => ({ shouldCountView: vi.fn(() => false) }));

vi.mock('../lib/uploadUrl', () => ({ isAcceptedImageUrl: vi.fn(() => true) }));

import { Article } from '../models/Article';
import { User } from '../models/User';
import articlesRouter from '../routes/articles';

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
  app.use('/api/articles', articlesRouter);
  return app;
}

describe('GET /api/articles/sitemap — index hygiene (M32.2)', () => {
  const app = createApp();
  const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);
  const longBody = 'x'.repeat(500);

  beforeEach(() => {
    vi.clearAllMocks();
    asMock(User.find).mockReturnValue(chain([
      { user_id: 'u1', created_at: daysAgo(60), trust_score: 1.5 },
    ]));
  });

  it('emits index, follow for a substantial approved article', async () => {
    asMock(Article.find).mockReturnValue(chain([{
      slug: 'solid-article-abc123',
      created_at: daysAgo(30),
      updated_at: daysAgo(20),
      comment_count: 2,
      view_count: 40,
      body: longBody,
      author_id: 'u1',
    }]));

    const res = await request(app).get('/api/articles/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.articles).toHaveLength(1);
    expect(res.body.articles[0].slug).toBe('solid-article-abc123');
    expect(res.body.articles[0].robots).toBe('index, follow');
    expect(typeof res.body.articles[0].lastmod).toBe('string');
  });

  it('noindexes a stale article under the 200-character article threshold', async () => {
    asMock(Article.find).mockReturnValue(chain([{
      slug: 'thin-article-def456',
      created_at: daysAgo(10),
      updated_at: daysAgo(10),
      comment_count: 0,
      view_count: 0,
      body: 'short body',
      author_id: 'u1',
    }]));

    const res = await request(app).get('/api/articles/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.articles[0].robots).toBe('noindex, follow');
  });

  it('keeps a thin article indexable while it is still under 24h old', async () => {
    asMock(Article.find).mockReturnValue(chain([{
      slug: 'fresh-thin-ghi789',
      created_at: new Date(Date.now() - 2 * 3600000),
      updated_at: new Date(Date.now() - 2 * 3600000),
      comment_count: 0,
      view_count: 0,
      body: 'short body',
      author_id: 'u1',
    }]));

    const res = await request(app).get('/api/articles/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.articles[0].robots).toBe('index, follow');
  });

  it('noindexes a substantial article whose author has no reputation (D4)', async () => {
    asMock(Article.find).mockReturnValue(chain([{
      slug: 'untrusted-article-jkl012',
      created_at: daysAgo(30),
      updated_at: daysAgo(20),
      comment_count: 9,
      view_count: 500,
      body: longBody,
      author_id: 'uUnknown',
    }]));
    asMock(User.find).mockReturnValue(chain([]));

    const res = await request(app).get('/api/articles/sitemap');
    expect(res.status).toBe(200);
    expect(res.body.articles[0].robots).toBe('noindex, follow');
  });
});

describe('GET /api/articles/:slug robots (M32.2)', () => {
  const app = createApp();
  const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);

  const article = (overrides: Record<string, unknown>) => ({
    _id: 'art1',
    slug: 'solid-article-abc123',
    title: 'Solid Article',
    body: 'x'.repeat(500),
    reading_time: 3,
    cover_image: null,
    sources: [],
    fact_check_status: 'unverified',
    author_id: 'u1',
    author_username: 'a_dbb4_aed5',
    author_display_name: 'a_dbb4_aed5',
    view_count: 40,
    comment_count: 2,
    bookmark_count: 0,
    category_slug: 'tech',
    status: 'approved',
    created_at: daysAgo(30),
    updated_at: daysAgo(20),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    asMock(User.find).mockReturnValue(chain([
      { user_id: 'u1', created_at: daysAgo(60), trust_score: 1.5 },
    ]));
  });

  it('returns index, follow for an approved substantial article', async () => {
    asMock(Article.findOne).mockReturnValue(chain(article({})));

    const res = await request(app).get('/api/articles/solid-article-abc123');
    expect(res.status).toBe(200);
    expect(res.body.article.robots).toBe('index, follow');
  });

  it('returns noindex, follow for a stale thin article', async () => {
    asMock(Article.findOne).mockReturnValue(chain(article({
      slug: 'thin-article-def456',
      body: 'too short',
      comment_count: 0,
      view_count: 0,
      created_at: daysAgo(10),
    })));

    const res = await request(app).get('/api/articles/thin-article-def456');
    expect(res.status).toBe(200);
    expect(res.body.article.robots).toBe('noindex, follow');
  });

  it('returns noindex, follow when the author fails the reputation gate (D4)', async () => {
    asMock(Article.findOne).mockReturnValue(chain(article({
      slug: 'untrusted-article-jkl012',
      comment_count: 12,
      view_count: 900,
      author_id: 'uUnknown',
    })));
    asMock(User.find).mockReturnValue(chain([]));

    const res = await request(app).get('/api/articles/untrusted-article-jkl012');
    expect(res.status).toBe(200);
    expect(res.body.article.robots).toBe('noindex, follow');
  });

  it('404s for an unknown slug', async () => {
    asMock(Article.findOne).mockReturnValue(chain(null));

    const res = await request(app).get('/api/articles/missing-slug');
    expect(res.status).toBe(404);
  });
});
