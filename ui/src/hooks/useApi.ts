import { useState, useEffect, useCallback } from 'react';
import { getApiKey } from '../lib/apiKey';

const host = window.location.hostname;
const API_BASE = (host === 'localhost' || host === '127.0.0.1')
  ? 'http://localhost:8005'
  : `http://${host}:8005`;

function buildApiHeaders(headers?: HeadersInit): Headers {
  const mergedHeaders = new Headers(headers);
  const apiKey = getApiKey();

  if (apiKey) {
    mergedHeaders.set('X-API-Key', apiKey);
  }

  return mergedHeaders;
}

export async function authenticatedFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildApiHeaders(options.headers),
  });
}

export function useApi<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    authenticatedFetch(path)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);

  useEffect(() => { refetch(); }, [refetch, ...deps]);

  return { data, loading, error, refetch }; 
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = buildApiHeaders(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const r = await authenticatedFetch(path, {
    ...options,
    headers,
  });

  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiText(path: string): Promise<string> {
  const r = await authenticatedFetch(path);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.text();
}
