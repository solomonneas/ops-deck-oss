import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type MockResponseOptions = {
  ok?: boolean;
  status?: number;
  statusText?: string;
  text?: string;
};

const setHostname = (hostname: string) => {
  Object.defineProperty(window, 'location', {
    value: new URL(`http://${hostname}`),
    writable: true,
    configurable: true,
  });
};

const createResponse = <T>(data: T, options: MockResponseOptions = {}) => {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    text = typeof data === 'string' ? data : JSON.stringify(data),
  } = options;

  return {
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(text),
  } as unknown as Response;
};

const loadApiModule = async (hostname = 'localhost') => {
  vi.resetModules();
  setHostname(hostname);
  return await import('../useApi');
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useApi', () => {
  it('fetches data on mount', async () => {
    const { useApi } = await loadApiModule('localhost');
    const payload = { ok: true };
    const fetchMock = vi.fn().mockResolvedValue(createResponse(payload));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useApi<typeof payload>('/api/test'));

    await waitFor(() => expect(result.current.data).toEqual(payload));
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8005/api/test');
  });

  it('sets loading state correctly', async () => {
    const { useApi } = await loadApiModule('localhost');
    const fetchMock = vi.fn().mockResolvedValue(createResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useApi('/api/loading'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('handles fetch errors', async () => {
    const { useApi } = await loadApiModule('localhost');
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createResponse(null, { ok: false, status: 500, statusText: 'Boom' }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useApi('/api/error'));

    await waitFor(() => expect(result.current.error).toBe('500 Boom'));
    expect(result.current.loading).toBe(false);
  });

  it('refetch works', async () => {
    const { useApi } = await loadApiModule('localhost');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createResponse({ value: 1 }))
      .mockResolvedValueOnce(createResponse({ value: 2 }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useApi<{ value: number }>('/api/refetch'));

    await waitFor(() => expect(result.current.data).toEqual({ value: 1 }));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toEqual({ value: 2 }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('apiFetch', () => {
  it('returns parsed JSON', async () => {
    const { apiFetch } = await loadApiModule('localhost');
    const payload = { hello: 'world' };
    const fetchMock = vi.fn().mockResolvedValue(createResponse(payload));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<typeof payload>('/api/data');

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8005/api/data',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('throws on non-ok response', async () => {
    const { apiFetch } = await loadApiModule('localhost');
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createResponse(null, { ok: false, status: 404, statusText: 'Not Found' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/api/missing')).rejects.toThrow('404 Not Found');
  });
});

describe('apiText', () => {
  it('returns raw text', async () => {
    const { apiText } = await loadApiModule('localhost');
    const fetchMock = vi.fn().mockResolvedValue(createResponse('plain-text'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiText('/api/text')).resolves.toBe('plain-text');
  });
});

describe('API_BASE', () => {
  it('uses localhost base for local hostnames and host base otherwise', async () => {
    const { apiFetch } = await loadApiModule('localhost');
    const localFetch = vi.fn().mockResolvedValue(createResponse({ ok: true }));
    vi.stubGlobal('fetch', localFetch);

    await apiFetch('/api/base');
    expect(localFetch).toHaveBeenCalledWith(
      'http://localhost:8005/api/base',
      expect.any(Object)
    );

    const { apiFetch: apiFetchRemote } = await loadApiModule('example.com');
    const remoteFetch = vi.fn().mockResolvedValue(createResponse({ ok: true }));
    vi.stubGlobal('fetch', remoteFetch);

    await apiFetchRemote('/api/base');
    expect(remoteFetch).toHaveBeenCalledWith(
      'http://example.com:8005/api/base',
      expect.any(Object)
    );
  });
});
