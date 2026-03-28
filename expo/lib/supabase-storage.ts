import { Platform } from 'react-native';
import { sbFetch, getPublicUrl } from '@/lib/supabase';

export type UploadResult = { path: string; publicUrl?: string };

export async function uploadFile(
  bucket: string,
  folder: string,
  file: File | { uri: string; name: string; type: string },
  makePublic = false
): Promise<UploadResult> {
  const b = (bucket || '').trim();
  const f = (folder || '').trim().replace(/^\/+|\/+$/g, '');
  if (!b || !f) throw new Error('Invalid bucket or folder');

  const name = 'name' in file ? file.name : 'upload';
  const filename = `${f}/${Date.now()}-${name}`;

  let fileBody: Blob | File;
  let contentType = (file as any).type || 'application/octet-stream';
  if (Platform.OS === 'web') {
    fileBody = file as File;
  } else {
    const mobileFile = file as { uri: string; name: string; type: string };
    const resp = await fetch(mobileFile.uri);
    fileBody = await resp.blob();
    contentType = mobileFile.type || contentType;
  }

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase env not set');

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(b)}/${filename}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Cache-Control': 'max-age=3600',
      'Content-Type': contentType,
    },
    body: fileBody,
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try { const j = await res.json(); msg = j?.message || msg; } catch {}
    throw new Error(msg);
  }

  const result: UploadResult = { path: filename };
  if (makePublic) {
    result.publicUrl = getPublicUrl(b, filename);
  }
  return result;
}
