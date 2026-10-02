import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBaseUrl, apiFetch } from '@/lib/api/client';

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
});

