import { NextRequest } from 'next/server';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/admin/photos/[id]'>) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json() as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  for (const k of ['title', 'price', 'sort_order', 'published']) {
    if (body[k] !== undefined) updates[k] = body[k];
  }

  const svc = getServiceClient();
  const { data, error } = await svc.from('photos').update(updates).eq('id', id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ photo: data });
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/admin/photos/[id]'>) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const svc = getServiceClient();

  const { data: photo } = await svc.from('photos').select('original_path, watermarked_path').eq('id', id).single();
  if (photo) {
    await svc.storage.from('originals').remove([photo.original_path]);
    await svc.storage.from('watermarked').remove([photo.watermarked_path]);
  }

  const { error } = await svc.from('photos').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
