import { Post } from '../models/Post';
import { User } from '../models/User';

export const REPUTATION_MIN_APPROVED_POSTS = 1;
export const REPUTATION_MIN_ACCOUNT_AGE_DAYS = 7;
export const REPUTATION_MIN_TRUST_SCORE = 1.0;

const MS_PER_DAY = 86400000;

export interface AuthorReputation {
  approved_posts: number;
  account_age_days: number;
  reputable: boolean;
}

export interface AuthorReputationInput {
  approved_posts: number;
  created_at?: string | number | Date | null;
  trust_score?: number | null;
  now?: Date;
}

export function evaluateAuthorReputation(input: AuthorReputationInput): AuthorReputation {
  const now = (input.now ?? new Date()).getTime();
  const created = input.created_at ? new Date(input.created_at).getTime() : Number.NaN;
  const account_age_days = Number.isFinite(created) && created <= now
    ? Math.floor((now - created) / MS_PER_DAY)
    : 0;
  const trust = typeof input.trust_score === 'number' ? input.trust_score : 0;
  const reputable =
    input.approved_posts >= REPUTATION_MIN_APPROVED_POSTS &&
    account_age_days >= REPUTATION_MIN_ACCOUNT_AGE_DAYS &&
    trust >= REPUTATION_MIN_TRUST_SCORE;

  return {
    approved_posts: input.approved_posts,
    account_age_days,
    reputable,
  };
}

function normalizeId(id: unknown): string | null {
  if (typeof id === 'string' && id.length > 0) return id;
  if (id && typeof id === 'object' && 'toString' in id) {
    const value = (id as { toString(): string }).toString();
    return value.length > 0 ? value : null;
  }
  return null;
}

export async function fetchAuthorReputations(
  authorIds: Array<unknown>,
): Promise<Map<string, AuthorReputation>> {
  const ids = [...new Set(authorIds.map(normalizeId).filter((id): id is string => id !== null))];
  const map = new Map<string, AuthorReputation>();
  if (ids.length === 0) return map;

  const [approvedCounts, users] = await Promise.all([
    Post.aggregate([
      { $match: { author_id: { $in: ids }, status: 'approved', deleted: { $ne: true } } },
      { $group: { _id: '$author_id', count: { $sum: 1 } } },
    ]),
    User.find({ user_id: { $in: ids } }).select('user_id created_at trust_score').lean(),
  ]);

  const countByAuthor = new Map<string, number>();
  for (const row of approvedCounts as Array<{ _id?: unknown; count?: number }>) {
    const id = normalizeId(row._id);
    if (id) countByAuthor.set(id, Number(row.count) || 0);
  }

  for (const raw of users as Array<Record<string, unknown>>) {
    const id = normalizeId(raw.user_id);
    if (!id) continue;
    map.set(id, evaluateAuthorReputation({
      approved_posts: countByAuthor.get(id) ?? 0,
      created_at: raw.created_at as string | undefined,
      trust_score: raw.trust_score as number | undefined,
    }));
  }

  for (const id of ids) {
    if (!map.has(id)) {
      map.set(id, evaluateAuthorReputation({
        approved_posts: countByAuthor.get(id) ?? 0,
        created_at: null,
        trust_score: null,
      }));
    }
  }

  return map;
}
