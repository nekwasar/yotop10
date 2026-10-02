import { describe, it, expect, vi } from 'vitest';
import { ssrLoad } from './ssr';

describe('ssrLoad', () => {
  it('returns the loaded data and marks nothing as failed', async () => {
    const result = await ssrLoad(async () => ['a', 'b']);
    expect(result).toEqual({ data: ['a', 'b'], failed: false });
  });

  it('retries a transient failure and still returns data', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error('425 Too Early'))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce({ items: 1 });

    const result = await ssrLoad(load, 3);

    expect(result.failed).toBe(false);
    expect(result.data).toEqual({ items: 1 });
    expect(load).toHaveBeenCalledTimes(3);
  });

  it('reports failure once every attempt is exhausted', async () => {
    const load = vi.fn().mockRejectedValue(new Error('down'));

    const result = await ssrLoad(load, 2);

    expect(result).toEqual({ data: null, failed: true });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('never claims the list is empty when the load itself failed', async () => {
    const result = await ssrLoad<never[]>(async () => {
      throw new Error('backend unreachable');
    }, 1);

    expect(result.data).toBeNull();
    expect(result.failed).toBe(true);
  });

  it('treats an empty-but-successful response as data, not failure', async () => {
    const result = await ssrLoad(async () => []);

    expect(result).toEqual({ data: [], failed: false });
  });
});
