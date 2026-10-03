import { describe, it, expect } from 'vitest';
import { toPublicSlug, toShortUsername } from './username';
import { profileUrl } from './urls';

function syntheticIdentities(): string[] {
  const names: string[] = [];
  for (let i = 0; i < 6000; i++) {
    const hex = i.toString(16).padStart(8, '0');
    names.push(`a_${hex.slice(0, 4)}_${hex.slice(4, 8)}`);
  }
  for (let i = 0; i < 2500; i++) names.push(`a_user${i}`);
  for (let i = 0; i < 1500; i++) names.push(`scholar${i}`);
  return names;
}

describe('toPublicSlug', () => {
  it('keeps both halves of a default identity so two accounts never share a URL', () => {
    expect(toPublicSlug('a_dbb4_aed5')).toBe('dbb4_aed5');
    expect(toPublicSlug('a_dbb4_7f2c')).toBe('dbb4_7f2c');
    expect(toPublicSlug('a_dbb4_aed5')).not.toBe(toPublicSlug('a_dbb4_7f2c'));
  });

  it('lowercases default identities', () => {
    expect(toPublicSlug('a_DBB4_AED5')).toBe('dbb4_aed5');
    expect(toPublicSlug('a_DBB4_AED5')).toBe(toPublicSlug('a_dbb4_aed5'));
  });

  it('still resolves legacy 4-character slugs', () => {
    expect(toPublicSlug('a_dbb4')).toBe('dbb4');
    expect(toPublicSlug('dbb4')).toBe('dbb4');
  });

  it('strips the a_ prefix from custom names', () => {
    expect(toPublicSlug('a_cutie')).toBe('cutie');
    expect(toPublicSlug('a_bigboss')).toBe('bigboss');
  });

  it('leaves named accounts untouched', () => {
    expect(toPublicSlug('cyprianzube')).toBe('cyprianzube');
    expect(toPublicSlug('nekwasar')).toBe('nekwasar');
  });

  it('is idempotent', () => {
    for (const name of ['a_dbb4_aed5', 'a_cutie', 'cyprianzube', 'a_dbb4', '']) {
      expect(toPublicSlug(toPublicSlug(name))).toBe(toPublicSlug(name));
    }
  });

  it('returns the empty string for an empty username', () => {
    expect(toPublicSlug('')).toBe('');
  });

  it('treats `cutie` and `a_cutie` as one identity namespace', () => {
    expect(toPublicSlug('cutie')).toBe(toPublicSlug('a_cutie'));
  });

  it('never emits a slug that still carries the a_ prefix (redirect-loop guard)', () => {
    const samples = ['a_dbb4_aed5', 'a_a_x', 'a_x', 'a_cutie', 'a_dbb4', 'cyprianzube'];
    for (const name of samples) {
      const slug = toPublicSlug(name);
      expect(slug.startsWith('a_')).toBe(false);
      expect(toPublicSlug(slug)).toBe(slug);
    }
  });

  it('maps every name the account system can mint to a unique slug', () => {
    const names = syntheticIdentities();
    expect(names.length).toBeGreaterThanOrEqual(10000);
    const slugs = names.map((name) => toPublicSlug(name));
    expect(new Set(slugs).size).toBe(names.length);
  });

  it('keeps the short handle helper on the old 4-character form', () => {
    expect(toShortUsername('a_dbb4_aed5')).toBe('a_dbb4');
  });

  it('builds profile URLs from the unique slug', () => {
    expect(profileUrl('a_dbb4_aed5')).toBe('https://yotop10.com/a/dbb4_aed5');
    expect(profileUrl('cyprianzube')).toBe('https://yotop10.com/a/cyprianzube');
  });
});
