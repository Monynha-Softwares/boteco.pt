import type {
  MetaResponse,
  DownloadResponse,
  UploadRequest,
  UploadResponse,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.boteco.pt';

function authHeaders(token?: string): HeadersInit {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function handleJSON<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sync API error ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getSyncMeta(token?: string): Promise<MetaResponse> {
  const res = await fetch(`${API_BASE}/sync/meta`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJSON<MetaResponse>(res);
}

export async function downloadDelta(
  params: { companyId: string; since?: string; limit?: number },
  token?: string,
): Promise<DownloadResponse> {
  const q = new URLSearchParams();
  q.set('company_id', params.companyId);
  if (params.since) q.set('since', params.since);
  if (params.limit) q.set('limit', String(params.limit));
  const res = await fetch(`${API_BASE}/sync/download?${q.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...authHeaders(token),
    },
  });
  return handleJSON<DownloadResponse>(res);
}

export async function uploadChanges(body: UploadRequest, token?: string): Promise<UploadResponse> {
  const res = await fetch(`${API_BASE}/sync/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  });
  return handleJSON<UploadResponse>(res);
}
