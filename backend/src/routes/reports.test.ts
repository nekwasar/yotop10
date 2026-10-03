import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../models/Report', () => ({
  Report: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../models/Post', () => ({
  Post: { find: vi.fn(), findById: vi.fn() },
}));

vi.mock('../models/Comment', () => ({
  Comment: { find: vi.fn(), findById: vi.fn(), updateOne: vi.fn() },
}));

vi.mock('../models/Article', () => ({
  Article: { find: vi.fn(), findById: vi.fn() },
}));

vi.mock('../lib/auditWriter', () => ({
  logAudit: vi.fn(),
  getAuditStats: vi.fn(),
}));

vi.mock('../lib/redis', () => ({
  atomicCheckRateLimit: vi.fn(),
  redis: {},
}));

vi.mock('../lib/adminAuth', () => ({
  adminAuthMiddleware: (
    req: { admin?: unknown },
    _res: unknown,
    next: () => void,
  ) => {
    req.admin = {
      id: 'admin_1',
      username: 'root',
      role: 'super_admin',
      permissions: [],
      permissions_version: 1,
      token_version: 1,
    };
    next();
  },
  generateAdminToken: vi.fn(),
  checkAccountLock: vi.fn(),
  recordFailedLogin: vi.fn(),
  resetLoginAttempts: vi.fn(),
}));

vi.mock('../lib/permissionGuard', () => ({
  autoPermissionGuard: (_req: unknown, _res: unknown, next: () => void) => next(),
  PERMISSION_CATALOG: ['comments:read', 'comments:moderate'],
  isValidPermission: () => true,
}));

import { atomicCheckRateLimit } from '../lib/redis';
import { logAudit } from '../lib/auditWriter';
import { Report } from '../models/Report';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Article } from '../models/Article';
import reportsRouter from './reports';
import adminRouter from './admin';

const asMock = (fn: unknown): ReturnType<typeof vi.fn> => fn as ReturnType<typeof vi.fn>;

const chain = <T>(value: T): Record<string, unknown> => {
  const c: Record<string, unknown> = {};
  c.select = () => c;
  c.sort = () => c;
  c.skip = () => c;
  c.limit = () => c;
  c.lean = () => Promise.resolve(value);
  c.then = (onOk: (v: T) => unknown, onErr?: (e: unknown) => unknown) =>
    Promise.resolve(value).then(onOk, onErr);
  return c;
};

type TestUser = NonNullable<Express.Request['user']>;

let currentUser: TestUser | null = null;

const makeUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  user_id: 'u_reporter',
  username: 'reporter',
  device_fingerprint: 'fp_reporter',
  trust_score: 1,
  trust_locked: false,
  is_admin: false,
  ...overrides,
});

function createReportsApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (currentUser) {
      req.user = currentUser;
    }
    next();
  });
  app.use('/api/reports', reportsRouter);
  return app;
}

function createAdminApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRouter);
  return app;
}

const validPostId = '64b000000000000000000001';
const validCommentId = '64b000000000000000000002';
const validArticleId = '64b000000000000000000003';

describe('POST /api/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = makeUser();
    asMock(atomicCheckRateLimit).mockResolvedValue({ allowed: true, remaining: 9 });
    asMock(Report.findOne).mockReturnValue(chain(null));
    asMock(Report.create).mockResolvedValue({ _id: '64b0000000000000000000ff' });
    asMock(Comment.updateOne).mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    asMock(Post.findById).mockReturnValue(
      chain({ _id: validPostId, author_id: 'u_author', deleted: false }),
    );
    asMock(Comment.findById).mockReturnValue(
      chain({ _id: validCommentId, post_id: validPostId, author_id: 'u_author', deleted: false }),
    );
    asMock(Article.findById).mockReturnValue(
      chain({ _id: validArticleId, author_id: 'u_author' }),
    );
  });

  it('rejects unauthenticated requests', async () => {
    currentUser = null;

    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'post', target_id: validPostId, reason: 'spam' });

    expect(res.status).toBe(401);
    expect(Report.create).not.toHaveBeenCalled();
  });

  it('rejects invalid payloads with a validation error', async () => {
    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'planet', target_id: 'not-an-id', reason: 'because' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION');
    expect(Report.create).not.toHaveBeenCalled();
  });

  it('rejects reports from restricted accounts', async () => {
    currentUser = makeUser({ restricted_until: new Date(Date.now() + 86400000) });

    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'post', target_id: validPostId, reason: 'spam' });

    expect(res.status).toBe(403);
    expect(Report.create).not.toHaveBeenCalled();
  });

  it('rate limits repeated reports', async () => {
    asMock(atomicCheckRateLimit).mockResolvedValue({ allowed: false, remaining: 0 });

    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'post', target_id: validPostId, reason: 'spam' });

    expect(res.status).toBe(429);
    expect(Report.create).not.toHaveBeenCalled();
  });

  it('404s when the reported post does not exist', async () => {
    asMock(Post.findById).mockReturnValue(chain(null));

    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'post', target_id: validPostId, reason: 'spam' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Post not found');
  });

  it('refuses self-reports', async () => {
    asMock(Post.findById).mockReturnValue(
      chain({ _id: validPostId, author_id: 'u_reporter', deleted: false }),
    );

    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'post', target_id: validPostId, reason: 'spam' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('You cannot report your own content.');
    expect(Report.create).not.toHaveBeenCalled();
  });

  it('stores a post report and writes an audit entry', async () => {
    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'post', target_id: validPostId, reason: 'misinformation', details: 'Fabricated source' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true, report_id: '64b0000000000000000000ff' });
    expect(Report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        target_type: 'post',
        target_id: validPostId,
        post_id: validPostId,
        reporter_user_id: 'u_reporter',
        reporter_username: 'reporter',
        reason: 'misinformation',
        details: 'Fabricated source',
        status: 'open',
      }),
    );
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        admin_id: 'u_reporter',
        action: 'report_content',
        metadata: expect.objectContaining({ target_type: 'post', target_id: validPostId, reason: 'misinformation' }),
      }),
    );
  });

  it('returns an idempotent response for a duplicate open report', async () => {
    asMock(Report.findOne).mockReturnValue(chain({ _id: '64b0000000000000000000ee' }));

    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'post', target_id: validPostId, reason: 'spam' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, duplicate: true });
    expect(Report.create).not.toHaveBeenCalled();
  });

  it('mirrors a comment report onto the existing admin flag queue', async () => {
    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'comment', target_id: validCommentId, reason: 'harassment' });

    expect(res.status).toBe(201);
    expect(Comment.updateOne).toHaveBeenCalledWith(
      { _id: validCommentId, flag_type: null },
      expect.objectContaining({
        $set: expect.objectContaining({
          flag_type: 'user_report',
          flag_evidence: expect.objectContaining({
            source: 'user_report',
            reason: 'harassment',
          }),
        }),
      }),
    );
  });

  it('does not overwrite an existing comment flag', async () => {
    asMock(Comment.updateOne).mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });

    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'comment', target_id: validCommentId, reason: 'spam' });

    expect(res.status).toBe(201);
    expect(Comment.updateOne).toHaveBeenCalledWith(
      { _id: validCommentId, flag_type: null },
      expect.anything(),
    );
  });

  it('accepts article reports', async () => {
    const res = await request(createReportsApp())
      .post('/api/reports')
      .send({ target_type: 'article', target_id: validArticleId, reason: 'other' });

    expect(res.status).toBe(201);
    expect(Report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        target_type: 'article',
        target_id: validArticleId,
        post_id: null,
        reason: 'other',
      }),
    );
  });
});

describe('GET /api/admin/reports + PATCH /api/admin/reports/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asMock(Report.find).mockReturnValue(
      chain([
        {
          _id: '64b0000000000000000000aa',
          target_type: 'comment',
          target_id: validCommentId,
          post_id: validPostId,
          reporter_user_id: 'u_other',
          reporter_username: 'otheruser',
          reason: 'harassment',
          details: null,
          status: 'open',
          created_at: new Date('2026-10-03T10:00:00.000Z'),
        },
      ]),
    );
    asMock(Report.countDocuments).mockResolvedValue(1);
    asMock(Comment.find).mockReturnValue(
      chain([
        { _id: validCommentId, content: 'Buy followers now', post_id: validPostId, deleted: false },
      ]),
    );
    asMock(Post.find).mockReturnValue(
      chain([{ _id: validPostId, slug: 'best-pizzas', title: 'Best Pizzas', deleted: false }]),
    );
    asMock(Article.find).mockReturnValue(chain([]));
  });

  it('lists open reports with a target preview', async () => {
    const res = await request(createAdminApp()).get('/api/admin/reports');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    expect(res.body.reports).toHaveLength(1);
    expect(res.body.reports[0]).toEqual(
      expect.objectContaining({
        target_type: 'comment',
        reason: 'harassment',
        reporter_username: 'otheruser',
        target: {
          exists: true,
          title: 'Best Pizzas',
          excerpt: 'Buy followers now',
          href: '/best-pizzas',
        },
      }),
    );
  });

  it('rejects an invalid status filter', async () => {
    const res = await request(createAdminApp()).get('/api/admin/reports?status=everything');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION');
  });

  it('dismisses a report, clears the mirrored comment flag and audits it', async () => {
    const report = {
      _id: '64b0000000000000000000aa',
      target_type: 'comment',
      target_id: validCommentId,
      reporter_user_id: 'u_other',
      status: 'open',
      resolved_at: null,
      save: vi.fn().mockResolvedValue(undefined),
    };
    asMock(Report.findById).mockResolvedValue(report);
    asMock(Comment.updateOne).mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    const res = await request(createAdminApp())
      .patch('/api/admin/reports/64b0000000000000000000aa')
      .send({ status: 'dismissed' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, id: '64b0000000000000000000aa', status: 'dismissed' });
    expect(report.save).toHaveBeenCalled();
    expect(Comment.updateOne).toHaveBeenCalledWith(
      { _id: validCommentId, flag_type: 'user_report' },
      { $set: { flag_type: null, flag_evidence: null } },
    );
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'dismiss_report', admin_id: 'admin_1' }),
    );
  });

  it('keeps the comment flag when a report is actioned', async () => {
    const report = {
      _id: '64b0000000000000000000aa',
      target_type: 'comment',
      target_id: validCommentId,
      reporter_user_id: 'u_other',
      status: 'open',
      resolved_at: null,
      save: vi.fn().mockResolvedValue(undefined),
    };
    asMock(Report.findById).mockResolvedValue(report);

    const res = await request(createAdminApp())
      .patch('/api/admin/reports/64b0000000000000000000aa')
      .send({ status: 'actioned' });

    expect(res.status).toBe(200);
    expect(Comment.updateOne).not.toHaveBeenCalled();
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'action_report' }),
    );
  });

  it('404s for an unknown report', async () => {
    asMock(Report.findById).mockResolvedValue(null);

    const res = await request(createAdminApp())
      .patch('/api/admin/reports/64b0000000000000000000bb')
      .send({ status: 'dismissed' });

    expect(res.status).toBe(404);
  });

  it('rejects an invalid status payload', async () => {
    const res = await request(createAdminApp())
      .patch('/api/admin/reports/64b0000000000000000000aa')
      .send({ status: 'archived' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION');
  });
});
