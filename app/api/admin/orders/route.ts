import { NextRequest } from 'next/server';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') ?? '50');
  const offset = parseInt(url.searchParams.get('offset') ?? '0');

  const svc = getServiceClient();
  const { data, error, count } = await svc
    .from('orders')
    .select('*, order_items(*, photos(title, watermarked_url, folder_id))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ orders: data, total: count });
}
