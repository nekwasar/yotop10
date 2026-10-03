import { Router, type RequestHandler } from 'express';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { redis } from '../lib/redis';
import { platformStatsQuerySchema, type PlatformStatsQuery } from '../schemas/stats';

const router: Router = Router();

const CACHE_KEY = 'stats:platform:v1';
const CACHE_TTL_SECONDS = 60;

/**
 * `total_debates` mirrors what the debates feature itself queries
 * (`routes/arguments.ts`), so the rail and /arguments agree.
 */
const DEBATE_POST_TYPES = ['this_vs_that', 'counter_list'];

const VISIBLE_POST = { status: 'approved', deleted: { $ne: true } } as const;

function validate(schema: { parse: (data: unknown) => unknown }): RequestHandler {
  return (req, res, next): void => {
    try {
      req.validated = schema.parse(req.query);
      next();
    } catch (err) {
      const issues = (err as { issues?: Array<{ message: string }> }).issues;
      res.status(400).json({
        code: 'VALIDATION',
        error: issues ? issues.map((i) => i.message).join('; ') : 'Invalid input',
      });
    }
  };
}

async function readCache(): Promise<Record<string, number> | null> {
  try {
    const raw = await redis.get(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, number>;
  } catch {
    // Cache is best-effort: a Redis hiccup must not fail a public read.
    return null;
  }
}

async function writeCache(payload: Record<string, number>): Promise<void> {
  try {
    await redis.set(CACHE_KEY, JSON.stringify(payload), { EX: CACHE_TTL_SECONDS });
  } catch {
    // Best-effort — the next request just recomputes.
  }
}

// GET /api/stats/platform — Public: platform-wide counters for the
// homepage rail. Zod-validated (schemas/stats.ts), Redis-cached ~60s.
router.get('/platform', validate(platformStatsQuerySchema), async (req, res) => {
  try {
    const query = req.validated as PlatformStatsQuery | undefined;

    if (query?.refresh !== '1') {
      const cached = await readCache();
      if (cached) {
        res.json(cached);
        return;
      }
    }

    const [totalPosts, totalDebates, totalFacts, totalUsers] = await Promise.all([
      Post.countDocuments(VISIBLE_POST),
      Post.countDocuments({ ...VISIBLE_POST, post_type: { $in: DEBATE_POST_TYPES } }),
      Post.countDocuments({ ...VISIBLE_POST, post_type: 'fact_drop' }),
      User.countDocuments({}),
    ]);

    const payload: Record<string, number> = {
      total_posts: totalPosts,
      total_debates: totalDebates,
      total_users: totalUsers,
      total_facts: totalFacts,
    };

    await writeCache(payload);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to fetch platform stats' });
  }
});

export default router;
