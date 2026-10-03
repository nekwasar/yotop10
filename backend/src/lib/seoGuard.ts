export interface SeoSignals {
  comment_count: number;
  view_count: number;
  content_length: number;
  status: string;
  age_hours: number;
  min_content_length?: number;
  author_reputable?: boolean;
}

export const DEFAULT_MIN_CONTENT_LENGTH = 100;
export const ARTICLE_MIN_CONTENT_LENGTH = 200;

export function shouldNoIndex(signals: SeoSignals): boolean {
  if (signals.status !== 'approved') return true;
  if (signals.author_reputable === false) return true;
  if (signals.comment_count === 0 && signals.view_count === 0 && signals.age_hours > 48) return true;
  const minLength = signals.min_content_length ?? DEFAULT_MIN_CONTENT_LENGTH;
  if (signals.content_length < minLength && signals.age_hours > 24) return true;
  return false;
}

export function robotsFor(noindex: boolean): string {
  return noindex ? 'noindex, follow' : 'index, follow';
}

export interface ThinProfileInput {
  bio?: string | null;
  approved_posts: number;
}

export function isThinProfile(input: ThinProfileInput): boolean {
  const hasBio = typeof input.bio === 'string' && input.bio.trim().length > 0;
  return !hasBio && input.approved_posts <= 0;
}

export function profileRobots(input: ThinProfileInput): string {
  return robotsFor(isThinProfile(input));
}
