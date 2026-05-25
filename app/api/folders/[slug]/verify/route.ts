import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest, ctx: RouteContext<'/api/folders/[slug]/verify'>) {
  const { slug } = await ctx.params;
  const { password } = await request.json() as { password?: string };

  if (!password) return Response.json({ error: 'Senha obrigatória' }, { status: 400 });

  const svc = getServiceClient();
  const { data: folder, error } = await svc
    .from('folders')
    .select('id, password_hash, locked')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !folder) return Response.json({ error: 'Pasta não encontrada' }, { status: 404 });
  if (!folder.locked) return Response.json({ ok: true }); // não precisa de senha

  if (!folder.password_hash) return Response.json({ error: 'Pasta sem senha configurada' }, { status: 500 });

  const match = await bcrypt.compare(password, folder.password_hash);
  if (!match) return Response.json({ error: 'Senha incorreta' }, { status: 401 });

  // Buscar fotos após autenticação
  const { data: photos } = await svc
    .from('photos')
    .select('id, title, watermarked_url, width, height, price, sort_order')
    .eq('folder_id', folder.id)
    .eq('published', true)
    .order('sort_order');

  return Response.json({ ok: true, photos: photos ?? [] });
}
