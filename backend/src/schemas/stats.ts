import { z } from 'zod';

/**
 * GET /api/stats/platform
 *
 * The endpoint is public and read-only; the only accepted input is an
 * optional cache-control flag. Everything else is ignored.
 */
export const platformStatsQuerySchema = z.object({
  /** `1` bypasses the Redis cache and recomputes the counts. */
  refresh: z.enum(['0', '1']).optional(),
});

export type PlatformStatsQuery = z.infer<typeof platformStatsQuerySchema>;
