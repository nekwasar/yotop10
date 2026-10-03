export function isDefaultFormat(full: string): boolean {
  return /^a_[a-z0-9]{4}_[a-z0-9]{4}$/i.test(full);
}
export function toDefaultShort(full: string): string {
  const m = full.match(/^a_([a-z0-9]{4})_[a-z0-9]{4}$/i);
  return m ? `a_${m[1].toLowerCase()}` : full.toLowerCase();
}
export function toCustomShort(full: string): string {
  return full.toLowerCase();
}
export function toShortUsername(full: string): string {
  if (!full) return full;
  if (isDefaultFormat(full)) return toDefaultShort(full);
  if (full.startsWith('a_')) return toCustomShort(full);
  return full;
}
export function getDisplayHandle(post: { author_display_name?: string; author_username: string }): string {
  const display = post.author_display_name || post.author_username;
  return display.replace(/^a_/, '');
}

export function toPublicUsername(full: string): string {
  return toShortUsername(full);
}

export function toPublicSlug(full: string): string {
  if (!full) return full;
  const def = full.match(/^a_([a-z0-9]{4})_([a-z0-9]{4})$/i);
  if (def) return `${def[1].toLowerCase()}_${def[2].toLowerCase()}`;
  return toPublicUsername(full).replace(/^(?:a_)+/, '');
}

export function isShortSlug(slug: string): boolean {
  const clean = slug.replace(/^a_/, '');
  return clean.length >= 4 && clean.length <= 8;
}
