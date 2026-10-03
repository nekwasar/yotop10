export interface QualitySignals {
  status?: string | null;
  created_at?: string | number | Date | null;
  comment_count?: number | null;
  view_count?: number | null;
  content_length?: number;
  min_content_length?: number;
}

export interface RobotsDirectives {
  index: boolean;
  follow: boolean;
}

export interface ProfileIndexInput {
  robots?: string | null;
  bio?: string | null;
  approved_posts?: number | null;
}

export const DEFAULT_MIN_CONTENT_LENGTH = 100;
export const ARTICLE_MIN_CONTENT_LENGTH = 200;

export function parseRobots(robots?: string | null): RobotsDirectives {
  const value = (robots || '').toLowerCase();
  return {
    index: !value.includes('noindex'),
    follow: !value.includes('nofollow'),
  };
}

export function shouldNoindex(signals: QualitySignals): boolean {
  if ((signals.status ?? '') !== 'approved') return true;
  const created = signals.created_at ? new Date(signals.created_at).getTime() : Number.NaN;
  const ageHours = Number.isFinite(created) ? (Date.now() - created) / 3600000 : 0;
  if ((signals.comment_count || 0) === 0 && (signals.view_count || 0) === 0 && ageHours > 48) return true;
  const minLength = signals.min_content_length ?? DEFAULT_MIN_CONTENT_LENGTH;
  if ((signals.content_length || 0) < minLength && ageHours > 24) return true;
  return false;
}

export function resolveRobots(preferred?: string | null, fallback?: QualitySignals): RobotsDirectives {
  if (preferred && preferred.trim().length > 0) return parseRobots(preferred);
  if (fallback) {
    return shouldNoindex(fallback) ? { index: false, follow: true } : { index: true, follow: true };
  }
  return { index: true, follow: true };
}

export function isIndexable(preferred?: string | null, fallback?: QualitySignals): boolean {
  return resolveRobots(preferred, fallback).index;
}

export function resolveProfileRobots(input: ProfileIndexInput): RobotsDirectives {
  if (input.robots && input.robots.trim().length > 0) return parseRobots(input.robots);
  const hasBio = typeof input.bio === 'string' && input.bio.trim().length > 0;
  const thin = !hasBio && (input.approved_posts ?? 0) <= 0;
  return thin ? { index: false, follow: true } : { index: true, follow: true };
}
