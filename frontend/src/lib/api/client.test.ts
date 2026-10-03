import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBaseUrl, apiFetch, ApiError, isNotFound } from '@/lib/api/client';

describe('API Client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.INTERNAL_API_URL;
  });

  describe('getBaseUrl', () => {
    it('returns relative /api on client-side', () => {
      expect(getBaseUrl()).toBe('/api');
    });

    it('returns configured URL when INTERNAL_API_URL is set', () => {
      process.env.INTERNAL_API_URL = 'http://backend:8000/api';
      vi.stubGlobal('window', undefined);
      expect(getBaseUrl()).toBe('http://backend:8000/api');
    });
  });

  describe('internal request marker', () => {
    const json = () =>
      new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } });

    it('marks server-side requests so the grace counter can skip them', async () => {
      process.env.INTERNAL_API_SECRET = 'server-side-secret';
      const fetchMock = vi.fn().mockResolvedValue(json());
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('window', undefined);

      await apiFetch('/ping');

      const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
      expect(headers['X-Internal-Request']).toBe('server-side-secret');
    });

    it('never marks browser requests', async () => {
      process.env.INTERNAL_API_SECRET = 'server-side-secret';
      const fetchMock = vi.fn().mockResolvedValue(json());
      vi.stubGlobal('fetch', fetchMock);

      await apiFetch('/ping');

      const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
      expect(headers['X-Internal-Request']).toBeUndefined();
    });

    it('omits the marker when no secret is configured', async () => {
      const fetchMock = vi.fn().mockResolvedValue(json());
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('window', undefined);

      await apiFetch('/ping');

      const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
      expect(headers['X-Internal-Request']).toBeUndefined();
    });
  });

  describe('ApiError', () => {
    it('tags an explicit 404 as not-found', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        new Response('{"code":"NOT_FOUND"}', { status: 404, statusText: 'Not Found' })
      ));

      const error = await apiFetch('/categories/nope').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
      expect(isNotFound(error)).toBe(true);
      // Screens parse the status out of the message — keep the format stable.
      expect((error as Error).message).toMatch(/^API Error: 404 /);
    });

    it('does not treat a network failure as not-found', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

      const error = await apiFetch('/categories/whatever').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(isNotFound(error)).toBe(false);
      expect((error as ApiError).status).toBeUndefined();
    });

    it('does not treat a server error as not-found', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        new Response('boom', { status: 503, statusText: 'Service Unavailable' })
      ));

      const error = await apiFetch('/posts').catch((e: unknown) => e);

      expect((error as ApiError).status).toBe(503);
      expect(isNotFound(error)).toBe(false);
    });
  });
});

