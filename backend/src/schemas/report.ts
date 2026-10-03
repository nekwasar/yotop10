import { z } from 'zod';

export const REPORT_REASONS = ['spam', 'harassment', 'misinformation', 'illegal', 'other'] as const;

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid target id');

export const createReportSchema = z.object({
  target_type: z.enum(['post', 'comment', 'article']),
  target_id: objectId,
  reason: z.enum(REPORT_REASONS),
  details: z
    .string()
    .trim()
    .max(1000, 'Details must be 1000 characters or fewer')
    .optional(),
});

export const reportListQuerySchema = z.object({
  status: z.enum(['open', 'actioned', 'dismissed', 'all']).default('open'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateReportSchema = z.object({
  status: z.enum(['actioned', 'dismissed']),
});
