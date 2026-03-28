type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE ?? '';

function assertServerEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Server Supabase env missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE');
  }
}

export async function sbAdminFetch<T>(path: string, method: RestMethod, body?: any): Promise<T> {
  assertServerEnv();
  const url = `${SUPABASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
  let fetchBody: BodyInit | undefined;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  } else if (body instanceof FormData) {
    fetchBody = body;
  }
  const res = await fetch(url, { method, headers, body: fetchBody });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export function serverPublicUrl(bucket: string, path: string): string {
  const b = (bucket || '').trim();
  const p = (path || '').trim().replace(/^\//, '');
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(b)}/${p}`;
}
