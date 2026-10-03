import { Router, RequestHandler } from 'express';
import { Report, ReportTargetType } from '../models/Report';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Article } from '../models/Article';
import { createReportSchema } from '../schemas/report';
import { logAudit } from '../lib/auditWriter';
import { getClientIp } from '../middleware/fingerprint';
import { atomicCheckRateLimit } from '../lib/redis';

const router: Router = Router();

const REPORT_RATE_LIMIT = { windowMs: 3600000, max: 10 };

const requireUser: RequestHandler = (req, res, next): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

function validate(schema: { parse: (data: unknown) => unknown }): RequestHandler {
  return (req, res, next): void => {
    try {
      req.validated = schema.parse(req.body);
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

interface ResolvedTarget {
  found: boolean;
  authorId: string | null;
  postId: string | null;
}

async function resolveTarget(
  targetType: ReportTargetType,
  targetId: string,
): Promise<ResolvedTarget> {
  if (targetType === 'comment') {
    const comment = await Comment.findById(targetId)
      .select('post_id author_id deleted')
      .lean();
    if (!comment || comment.deleted) return { found: false, authorId: null, postId: null };
    return {
      found: true,
      authorId: comment.author_id,
      postId: comment.post_id ? String(comment.post_id) : null,
    };
  }

  if (targetType === 'post') {
    const post = await Post.findById(targetId).select('author_id deleted').lean();
    if (!post || post.deleted) return { found: false, authorId: null, postId: null };
    return { found: true, authorId: post.author_id, postId: String(post._id) };
  }

  const article = await Article.findById(targetId).select('author_id').lean();
  if (!article) return { found: false, authorId: null, postId: null };
  return { found: true, authorId: article.author_id, postId: null };
}

router.post('/', requireUser, validate(createReportSchema), async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    if (user.restricted_until && new Date(user.restricted_until) > new Date()) {
      return res.status(403).json({ error: 'Your account is restricted.' });
    }

    const { target_type, target_id, reason, details } = req.validated as {
      target_type: ReportTargetType;
      target_id: string;
      reason: string;
      details?: string;
    };

    const rateLimit = await atomicCheckRateLimit(
      `rl:report:${user.user_id}`,
      REPORT_RATE_LIMIT.windowMs,
      REPORT_RATE_LIMIT.max,
    );
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many reports. Try again later.' });
    }

    const target = await resolveTarget(target_type, target_id);
    if (!target.found) {
      const label =
        target_type === 'comment' ? 'Comment' : target_type === 'post' ? 'Post' : 'Article';
      return res.status(404).json({ error: `${label} not found` });
    }
    if (target.authorId === user.user_id) {
      return res.status(400).json({ error: 'You cannot report your own content.' });
    }

    const existing = await Report.findOne({
      reporter_user_id: user.user_id,
      target_type,
      target_id,
      status: 'open',
    })
      .select('_id')
      .lean();
    if (existing) {
      return res.json({ ok: true, duplicate: true });
    }

    const report = await Report.create({
      target_type,
      target_id,
      post_id: target.postId,
      reporter_user_id: user.user_id,
      reporter_username: user.username,
      reason,
      details: details || null,
      status: 'open',
    });
    const reportId = report._id.toString();

    if (target_type === 'comment') {
      await Comment.updateOne(
        { _id: target_id, flag_type: null },
        {
          $set: {
            flag_type: 'user_report',
            flag_evidence: {
              source: 'user_report',
              report_id: reportId,
              reporter_user_id: user.user_id,
              reason,
              details: details || null,
              reported_at: new Date(),
            },
          },
        },
      );
    }

    logAudit({
      admin_id: user.user_id,
      action: 'report_content',
      ip: getClientIp(req),
      metadata: {
        report_id: reportId,
        target_type,
        target_id,
        reason,
      },
      user_agent: req.headers['user-agent'] || '',
    });

    return res.status(201).json({ ok: true, report_id: reportId });
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Failed to create report' });
  }
});

export default router;
