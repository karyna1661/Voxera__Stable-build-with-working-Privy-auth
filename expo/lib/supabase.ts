type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase env. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
}

export async function sbFetch<T>(path: string, method: RestMethod, body?: any): Promise<T> {
  assertEnv();
  const url = `${SUPABASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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

export function getPublicUrl(bucket: string, path: string): string {
  const b = (bucket || '').trim();
  const p = (path || '').trim().replace(/^\//, '');
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(b)}/${p}`;
}
