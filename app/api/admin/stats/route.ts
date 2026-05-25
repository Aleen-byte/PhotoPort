import { NextRequest } from 'next/server';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const svc = getServiceClient();

  const [foldersRes, photosRes, ordersRes, revenueRes] = await Promise.all([
    svc.from('folders').select('id', { count: 'exact', head: true }),
    svc.from('photos').select('id', { count: 'exact', head: true }),
    svc.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
    svc.from('orders').select('total').eq('payment_status', 'paid'),
  ]);

  const totalRevenue = revenueRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;

  return Response.json({
    folders: foldersRes.count ?? 0,
    photos: photosRes.count ?? 0,
    orders: ordersRes.count ?? 0,
    revenue: totalRevenue,
  });
}
