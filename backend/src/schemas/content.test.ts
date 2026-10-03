import { describe, it, expect } from 'vitest';
import { parseAiAssistedCreate, parseAiAssistedPatch } from './content';

describe('ai_assisted schema', () => {
  describe('parseAiAssistedCreate', () => {
    it('defaults to false when the field is absent', () => {
      expect(parseAiAssistedCreate({ title: 'anything' })).toEqual({ ok: true, ai_assisted: false });
    });

    it('accepts an explicit true', () => {
      expect(parseAiAssistedCreate({ ai_assisted: true })).toEqual({ ok: true, ai_assisted: true });
    });

    it('accepts an explicit false', () => {
      expect(parseAiAssistedCreate({ ai_assisted: false })).toEqual({ ok: true, ai_assisted: false });
    });

    it('rejects string booleans', () => {
      const result = parseAiAssistedCreate({ ai_assisted: 'true' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain('ai_assisted');
    });

    it('rejects numbers', () => {
      const result = parseAiAssistedCreate({ ai_assisted: 1 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain('ai_assisted');
    });

    it('rejects null', () => {
      const result = parseAiAssistedCreate({ ai_assisted: null });
      expect(result.ok).toBe(false);
    });
  });

  describe('parseAiAssistedPatch', () => {
    it('accepts an explicit true', () => {
      expect(parseAiAssistedPatch({ ai_assisted: true })).toEqual({ ok: true, ai_assisted: true });
    });

    it('accepts an explicit false so the flag can be cleared', () => {
      expect(parseAiAssistedPatch({ ai_assisted: false })).toEqual({ ok: true, ai_assisted: false });
    });

    it('rejects a missing value (callers only invoke this when the key is present)', () => {
      expect(parseAiAssistedPatch({}).ok).toBe(false);
    });

    it('rejects non-boolean values', () => {
      expect(parseAiAssistedPatch({ ai_assisted: 'yes' }).ok).toBe(false);
      expect(parseAiAssistedPatch({ ai_assisted: 0 }).ok).toBe(false);
      expect(parseAiAssistedPatch({ ai_assisted: null }).ok).toBe(false);
    });
  });
});
