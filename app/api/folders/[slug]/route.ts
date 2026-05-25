import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/folders/[slug]'>) {
  const { slug } = await ctx.params;
  const svc = getServiceClient();

  const { data: folder, error } = await svc
    .from('folders')
    .select('id, slug, name, description, kind, locked, cover_url, date, location, price_per_photo, photo_count, published')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !folder) return Response.json({ error: 'Pasta não encontrada' }, { status: 404 });

  // Se a pasta está bloqueada, retorna só os metadados (sem fotos)
  if (folder.locked) {
    return Response.json({ folder, photos: null, locked: true });
  }

  const { data: photos } = await svc
    .from('photos')
    .select('id, title, watermarked_url, width, height, price, sort_order')
    .eq('folder_id', folder.id)
    .eq('published', true)
    .order('sort_order');

  return Response.json({ folder, photos: photos ?? [], locked: false });
}
