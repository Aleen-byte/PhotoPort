import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

interface OrderPayload {
  customer_name: string;
  customer_email: string;
  payment_method: 'pix' | 'card' | 'boleto';
  items: Array<{ photo_id: string; folder_id: string; price: number }>;
}

export async function POST(request: NextRequest) {
  const body = await request.json() as OrderPayload;

  if (!body.customer_email || !body.items?.length) {
    return Response.json({ error: 'E-mail e items são obrigatórios' }, { status: 400 });
  }

  const total = body.items.reduce((sum, i) => sum + i.price, 0);
  const fee = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = Math.round((total + fee) * 100) / 100;

  const orderNumber = 'A-' + Date.now().toString(36).toUpperCase();

  const svc = getServiceClient();

  const { data: order, error: orderErr } = await svc
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: body.customer_name || null,
      customer_email: body.customer_email,
      total: grandTotal,
      payment_method: body.payment_method,
      payment_status: 'pending',
    })
    .select()
    .single();

  if (orderErr || !order) {
    return Response.json({ error: 'Erro ao criar pedido: ' + orderErr?.message }, { status: 500 });
  }

  const { error: itemsErr } = await svc.from('order_items').insert(
    body.items.map((i) => ({
      order_id: order.id,
      photo_id: i.photo_id,
      folder_id: i.folder_id,
      price: i.price,
    }))
  );

  if (itemsErr) {
    return Response.json({ error: 'Erro ao salvar itens: ' + itemsErr.message }, { status: 500 });
  }

  return Response.json({ order, orderNumber }, { status: 201 });
}
