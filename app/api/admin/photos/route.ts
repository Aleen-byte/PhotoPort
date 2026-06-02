import { NextRequest } from 'next/server';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const url = new URL(request.url);
  const folderId = url.searchParams.get('folder_id');
  const mediaType = url.searchParams.get('media_type');

  const svc = getServiceClient();
  let q = svc.from('photos').select('*').order('created_at', { ascending: false });
  if (folderId) q = q.eq('folder_id', folderId);
  if (mediaType) q = q.eq('media_type', mediaType);

  const { data: photos, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ photos: photos ?? [] });
}
