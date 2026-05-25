import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

/** Gera URLs de download assinadas para os itens de um pedido pago. */
export async function GET(request: NextRequest, ctx: RouteContext<'/api/download/[orderId]'>) {
  const { orderId } = await ctx.params;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) return Response.json({ error: 'Token obrigatório' }, { status: 400 });

  const svc = getServiceClient();

  // Verifica pedido (token = customer_email codificado em base64)
  const email = Buffer.from(token, 'base64').toString('utf-8');

  const { data: order, error } = await svc
    .from('orders')
    .select('id, order_number, customer_email, payment_status, order_items(id, photo_id, photos(original_path, title))')
    .eq('id', orderId)
    .eq('customer_email', email)
    .single();

  if (error || !order) return Response.json({ error: 'Pedido não encontrado' }, { status: 404 });
  if (order.payment_status !== 'paid') return Response.json({ error: 'Pagamento não confirmado' }, { status: 403 });

  // Gerar signed URLs (válidas por 24h)
  const urls: Array<{ title: string; url: string }> = [];
  for (const item of order.order_items as any[]) {
    if (!item.photos?.original_path) continue;
    const { data } = await svc.storage
      .from('originals')
      .createSignedUrl(item.photos.original_path, 86400);
    if (data?.signedUrl) {
      urls.push({ title: item.photos.title ?? 'foto', url: data.signedUrl });
    }
  }

  return Response.json({ orderNumber: order.order_number, downloads: urls });
}
