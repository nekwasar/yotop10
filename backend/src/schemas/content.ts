import { z } from 'zod';

export const aiAssistedCreateSchema = z.object({
  ai_assisted: z.boolean().optional().default(false),
});

export const aiAssistedPatchSchema = z.object({
  ai_assisted: z.boolean(),
});

export type AiAssistedParse = { ok: true; ai_assisted: boolean } | { ok: false; error: string };

export function parseAiAssistedCreate(body: unknown): AiAssistedParse {
  const result = aiAssistedCreateSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'invalid value';
    return { ok: false, error: `ai_assisted: ${message}` };
  }
  return { ok: true, ai_assisted: result.data.ai_assisted };
}

export function parseAiAssistedPatch(body: unknown): AiAssistedParse {
  const result = aiAssistedPatchSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'invalid value';
    return { ok: false, error: `ai_assisted: ${message}` };
  }
  return { ok: true, ai_assisted: result.data.ai_assisted };
}
