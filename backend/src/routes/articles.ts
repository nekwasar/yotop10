/* eslint-disable no-restricted-syntax, @typescript-eslint/no-explicit-any -- Express middleware type chains */
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { Article } from '../models/Article';
import { redis } from '../lib/redis';
import { shouldNoIndex, robotsFor, ARTICLE_MIN_CONTENT_LENGTH } from '../lib/seoGuard';
import { fetchAuthorReputations } from '../lib/reputation';
import { logAudit } from '../lib/auditWriter';
import { getClientIp, getFingerprintIdentity } from '../middleware/fingerprint';
import { shouldCountView } from '../lib/viewCounting';
import { isAcceptedImageUrl } from '../lib/uploadUrl';
import { parseAiAssistedCreate } from '../schemas/content';

const router: Router = Router();

const generateArticleSlug = (title: string, id: string): string => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-+$/, '');
  }

  const idSuffix = id.substring(id.length - 6);
  return `${slug}-${idSuffix}`;
};

// Validation middleware
const validateArticleSubmission = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body is required')
    .isLength({ min: 100 })
    .withMessage('Body must be at least 100 characters'),
  body('category_slug')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('cover_image')
    .optional()
    .custom(isAcceptedImageUrl)
    .withMessage('Invalid cover image URL'),
  body('sources')
    .optional()
    .isArray()
    .withMessage('Sources must be an array'),
  body('sources.*.url')
    .optional()
    .isURL()
    .withMessage('Invalid source URL'),
  body('sources.*.title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Source title is required when source URL is provided'),
];

// GET /api/articles — All approved articles (paginated)
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = { status: 'approved' };

    if (category) {
      query.category_slug = category;
    }

    let sortOption: Record<string, 1 | -1> = { created_at: -1 };
    if (sort === 'oldest') {
      sortOption = { created_at: 1 };
    } else if (sort === 'most_viewed') {
      sortOption = { view_count: -1 };
    }

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Article.countDocuments(query),
    ]);

    const formattedArticles = articles.map((article) => ({
      id: article._id,
      slug: article.slug,
      title: article.title,
      body: (article.body || '').substring(0, 300),
      reading_time: article.reading_time,
      cover_image: article.cover_image || null,
      author_username: article.author_username,
      author_display_name: article.author_display_name,
      view_count: article.view_count,
      comment_count: article.comment_count,
      bookmark_count: article.bookmark_count,
      category_slug: article.category_slug,
      created_at: article.created_at,
    }));

    res.json({
      articles: formattedArticles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/sitemap', async (_req, res) => {
  try {
    const articles = await Article.find({ status: 'approved' })
      .select('slug created_at updated_at comment_count view_count body author_id')
      .sort({ created_at: -1 })
      .limit(5000)
      .lean();

    const reputations = await fetchAuthorReputations(
      articles.map((article) => (article as { author_id?: string }).author_id),
    );

    const items = articles.map((article) => {
      const record = article as Record<string, unknown>;
      const createdAt = new Date(String(record.created_at));
      const ageHours = (Date.now() - createdAt.getTime()) / 3600000;
      const reputation = reputations.get(String(record.author_id));
      const noindex = shouldNoIndex({
        comment_count: Number(record.comment_count) || 0,
        view_count: Number(record.view_count) || 0,
        content_length: String(record.body || '').length,
        status: 'approved',
        age_hours: ageHours,
        min_content_length: ARTICLE_MIN_CONTENT_LENGTH,
        author_reputable: reputation ? reputation.reputable : false,
      });
      const lastmod = record.updated_at || record.created_at;

      return {
        slug: String(record.slug),
        lastmod: lastmod ? new Date(String(lastmod)).toISOString() : null,
        robots: robotsFor(noindex),
      };
    });

    res.json({ articles: items });
  } catch (error) {
    console.error('Error building articles sitemap:', error);
    res.status(500).json({ error: 'Failed to build articles sitemap' });
  }
});

// GET /api/articles/:slug — Single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug, status: 'approved' }).lean();

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Unique view counting: same fingerprint + same article = 1 view per 30 min.
    // Only real human opens count — metadata/OG/prefetch/bot fetches and the
    // author's own opens are served the stored count without incrementing.
    const viewerFp =
      req.user?.device_fingerprint ||
      (req.headers['x-device-fingerprint'] as string) ||
      req.ip ||
      'unknown';
    const viewerIdentity = getFingerprintIdentity(req);
    const isAuthorView = !!viewerIdentity?.user_id && article.author_id === viewerIdentity.user_id;
    const viewKey = `article_view:${article._id}:${viewerFp}`;
    const alreadyViewed = await redis.get(viewKey);
    let liveViewCount = article.view_count as number;
    if (!alreadyViewed && shouldCountView(req) && !isAuthorView) {
      const updated = await Article.findByIdAndUpdate(article._id, { $inc: { view_count: 1 } }, { new: true }).select('view_count').lean();
      if (updated) liveViewCount = updated.view_count as number;
      await redis.set(viewKey, '1', { EX: 1800 });
    }

    const ageHours = (Date.now() - new Date(article.created_at).getTime()) / 3600000;
    const reputations = await fetchAuthorReputations([article.author_id]);
    const reputation = reputations.get(String(article.author_id));
    const robots = robotsFor(shouldNoIndex({
      comment_count: article.comment_count || 0,
      view_count: article.view_count || 0,
      content_length: (article.body || '').length,
      status: article.status,
      age_hours: ageHours,
      min_content_length: ARTICLE_MIN_CONTENT_LENGTH,
      author_reputable: reputation ? reputation.reputable : false,
    }));

    res.json({
      article: {
        id: article._id,
        slug: article.slug,
        title: article.title,
        body: article.body,
        reading_time: article.reading_time,
        cover_image: article.cover_image || null,
        sources: article.sources || [],
        fact_check_status: article.fact_check_status,
        author_id: article.author_id,
        author_username: article.author_username,
        author_display_name: article.author_display_name,
        view_count: liveViewCount,
        comment_count: article.comment_count,
        bookmark_count: article.bookmark_count,
        category_slug: article.category_slug,
        status: article.status,
        created_at: article.created_at,
        updated_at: article.updated_at,
        robots,
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles — Submit article (fingerprint auth)
router.post('/', ...validateArticleSubmission as any[], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const aiParsed = parseAiAssistedCreate(req.body);
    if (!aiParsed.ok) {
      return res.status(400).json({ error: aiParsed.error });
    }

    const { title, body: articleBody, category_slug, cover_image, sources } = req.body;

    // Fingerprint auth required
    const user = req.user;
    if (!user || !user.device_fingerprint || user.device_fingerprint === 'unknown') {
      return res.status(401).json({ error: 'Device identity required for submission' });
    }

    if (user.restricted_until && new Date() < new Date(user.restricted_until)) {
      const remaining = Math.ceil(
        (new Date(user.restricted_until).getTime() - Date.now()) / 60000
      );
      return res.status(429).json({
        error: `Account restricted. Resumes in ${remaining} minutes.`,
        resetTime: user.restricted_until,
      });
    }

    const readingTime = Math.ceil(articleBody.split(/\s+/).length / 200);

    const mappedSources = sources && Array.isArray(sources)
      ? sources.map((s: { url: string; title: string }) => ({
          url: s.url,
          title: s.title,
          accessed_at: new Date(),
        }))
      : [];

    const article = await Article.create({
      author_id: user.user_id,
      author_username: user.username,
      author_display_name: user.custom_display_name || user.username,
      title,
      body: articleBody,
      reading_time: readingTime,
      cover_image: cover_image || undefined,
      sources: mappedSources,
      category_slug,
      status: 'pending_review',
      ai_assisted: aiParsed.ai_assisted,
      view_count: 0,
      comment_count: 0,
      bookmark_count: 0,
      slug: `temp-${crypto.randomBytes(8).toString('hex')}`,
    });

    const finalSlug = generateArticleSlug(title, article._id.toString());
    await Article.findByIdAndUpdate(article._id, { slug: finalSlug });
    const updatedArticle = await Article.findById(article._id);
    if (!updatedArticle) {
      await Article.findByIdAndDelete(article._id);
      throw new Error('Article lost during creation');
    }

    logAudit({
      admin_id: user.user_id,
      action: 'submit_article',
      ip: getClientIp(req),
      metadata: {
        article_id: updatedArticle._id.toString(),
        title,
        category_slug,
      },
      user_agent: req.headers['user-agent'] || '',
    });

    res.status(201).json({
      message: 'Article submitted successfully. It will be reviewed by an admin.',
      article: {
        id: updatedArticle._id,
        title: updatedArticle.title,
        slug: updatedArticle.slug,
        status: updatedArticle.status,
        created_at: updatedArticle.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

export default router;
