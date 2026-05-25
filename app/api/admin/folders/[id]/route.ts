import { NextRequest } from 'next/server';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, ctx: RouteContext<'/api/admin/folders/[id]'>) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const svc = getServiceClient();
  const { data, error } = await svc.from('folders').select('*, photos(*)').eq('id', id).single();
  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json({ folder: data });
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/admin/folders/[id]'>) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json() as Record<string, unknown> & { password?: string };

  const updates: Partial<{
    name: string; slug: string; description: string | null; kind: 'sale' | 'portfolio';
    locked: boolean; password_hash: string | null; cover_url: string | null;
    cover_path: string | null; date: string | null; location: string | null;
    price_per_photo: number | null; published: boolean;
  }> = {};

  if (body['name'] !== undefined) updates.name = body['name'] as string;
  if (body['slug'] !== undefined) updates.slug = body['slug'] as string;
  if (body['description'] !== undefined) updates.description = body['description'] as string | null;
  if (body['kind'] !== undefined) updates.kind = body['kind'] as 'sale' | 'portfolio';
  if (body['locked'] !== undefined) updates.locked = body['locked'] as boolean;
  if (body['cover_url'] !== undefined) updates.cover_url = body['cover_url'] as string | null;
  if (body['cover_path'] !== undefined) updates.cover_path = body['cover_path'] as string | null;
  if (body['date'] !== undefined) updates.date = body['date'] as string | null;
  if (body['location'] !== undefined) updates.location = body['location'] as string | null;
  if (body['price_per_photo'] !== undefined) updates.price_per_photo = body['price_per_photo'] as number | null;
  if (body['published'] !== undefined) updates.published = body['published'] as boolean;

  if (body.password !== undefined) {
    updates.password_hash = body.password ? await bcrypt.hash(body.password, 10) : null;
    updates.locked = !!body.password;
  }

  const svc = getServiceClient();
  const { data, error } = await svc
    .from('folders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ folder: data });
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/admin/folders/[id]'>) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const svc = getServiceClient();

  // Buscar fotos para remover dos buckets
  const { data: photos } = await svc.from('photos').select('original_path, watermarked_path').eq('folder_id', id);
  if (photos?.length) {
    await svc.storage.from('originals').remove(photos.map((p) => p.original_path));
    await svc.storage.from('watermarked').remove(photos.map((p) => p.watermarked_path));
  }

  const { error } = await svc.from('folders').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
