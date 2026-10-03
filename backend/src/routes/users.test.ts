import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const chain = <T>(value: T): Record<string, unknown> => {
  const c: Record<string, unknown> = {};
  c.sort = () => c;
  c.select = () => c;
  c.limit = () => c;
  c.lean = () => Promise.resolve(value);
  c.then = (onOk: (v: T) => unknown, onErr?: (e: unknown) => unknown) => Promise.resolve(value).then(onOk, onErr);
  return c;
};

const accounts: Array<Record<string, unknown>> = [
  { user_id: 'u1', username: 'a_dbb4_aed5', custom_display_name: undefined, short_username: 'a_dbb4', trust_level: 'neutral', created_at: new Date('2026-10-01T00:00:00Z') },
  { user_id: 'u2', username: 'a_dbb4_7f2c', custom_display_name: undefined, short_username: 'a_dbb4', trust_level: 'neutral', created_at: new Date('2026-10-01T00:00:00Z') },
  { user_id: 'u3', username: 'cyprianzube', custom_display_name: undefined, trust_level: 'scholar', created_at: new Date('2026-10-01T00:00:00Z') },
];

vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(async (query: Record<string, unknown>) => {
      const clauses = (query.$or || [query]) as Array<Record<string, unknown>>;
      return (
        accounts.find((account) =>
          clauses.some((clause) =>
            Object.entries(clause).every(([key, cond]) => {
              if (typeof cond === 'string') return account[key] === cond;
              if (cond !== null && typeof cond === 'object') {
                const c = cond as { $in?: unknown[]; $regex?: string; $options?: string };
                if (c.$in) return c.$in.includes(account[key]);
                if (c.$regex) return new RegExp(c.$regex, c.$options || '').test(String(account[key] ?? ''));
              }
              return false;
            }),
          ),
        ) || null
      );
    }),
    find: vi.fn(() => chain([])),
    findOneAndUpdate: vi.fn(async () => null),
    updateOne: vi.fn(async () => ({})),
  },
}));

vi.mock('../models/Post', () => ({
  Post: { find: vi.fn(() => chain([])), aggregate: vi.fn(async () => []), updateMany: vi.fn(async () => ({})) },
}));

vi.mock('../models/Article', () => ({
  Article: { aggregate: vi.fn(async () => []), updateMany: vi.fn(async () => ({})) },
}));

vi.mock('../models/Comment', () => ({
  Comment: { find: vi.fn(() => chain([])), updateMany: vi.fn(async () => ({})) },
}));

vi.mock('../models/Notification', () => ({ Notification: { create: vi.fn(async () => ({})) } }));
vi.mock('../models/AdminMessage', () => ({ AdminMessage: { find: vi.fn(() => chain([])) } }));

vi.mock('../lib/rateLimit', () => ({
  calculateEffectivePostLimit: vi.fn(() => 10),
  calculateEffectiveCommentLimit: vi.fn(() => 10),
  RateLimitStatus: { OK: 'ok' },
  getRateLimitKey: vi.fn(() => 'key'),
}));

vi.mock('../lib/categoryCache', () => ({
  getCategoryNameMap: vi.fn(async () => new Map<string, string>()),
}));

vi.mock('../lib/trustScore', () => ({ checkAndPromoteUser: vi.fn(async () => {}) }));

vi.mock('../lib/redis', () => ({
  redis: { get: vi.fn(async () => null), set: vi.fn(async () => 'OK'), setEx: vi.fn(async () => 'OK') },
  atomicCheckRateLimit: vi.fn(async () => true),
}));

vi.mock('../middleware/fingerprint', () => ({
  findUserByFingerprint: vi.fn(async () => null),
  createUserForFingerprint: vi.fn(async () => null),
  getClientIp: vi.fn(() => '127.0.0.1'),
  isLowEntropyFingerprint: vi.fn(() => false),
  isCookieBound: vi.fn(() => false),
  isDeniedFingerprint: vi.fn(() => false),
}));

vi.mock('../lib/proofOfWork', () => ({
  issuePowChallenge: vi.fn(async () => ({ challenge: 'x' })),
  verifyPowChallenge: vi.fn(async () => true),
}));

vi.mock('../lib/identityMaturity', () => ({ isIdentityMature: vi.fn(() => true) }));

import usersRouter from '../routes/users';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/users', usersRouter);
  return app;
}

describe('GET /users/:username profile resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const app = createApp();

  it('serves the unique canonical slug of a device identity', async () => {
    const res = await request(app).get('/users/dbb4_aed5');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('a_dbb4_aed5');
    expect(res.body.canonical_url).toBe('/a/dbb4_aed5');
    expect(res.body.stats.total_posts).toBe(0);
  });

  it('resolves the legacy 4-character alias to the same canonical URL', async () => {
    const res = await request(app).get('/users/dbb4');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('a_dbb4_aed5');
    expect(res.body.canonical_url).toBe('/a/dbb4_aed5');
  });

  it('resolves the prefixed and unprefixed canonical spellings identically', async () => {
    const prefixed = await request(app).get('/users/a_dbb4_aed5');
    expect(prefixed.status).toBe(200);
    expect(prefixed.body.canonical_url).toBe('/a/dbb4_aed5');
  });

  it('keeps the named account canonical URL unchanged', async () => {
    const res = await request(app).get('/users/cyprianzube');
    expect(res.status).toBe(200);
    expect(res.body.canonical_url).toBe('/a/cyprianzube');
  });

  it('does not let one account claim another account canonical slug', async () => {
    const res = await request(app).get('/users/dbb4_7f2c');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('a_dbb4_7f2c');
    expect(res.body.canonical_url).toBe('/a/dbb4_7f2c');
  });

  it('404s for an unknown slug', async () => {
    const res = await request(app).get('/users/nope_not_here');
    expect(res.status).toBe(404);
  });
});
