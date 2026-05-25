import { NextRequest } from 'next/server';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';
import type { FolderInsert } from '@/lib/supabase/types';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const svc = getServiceClient();
  const { data, error } = await svc
    .from('folders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ folders: data });
}

export async function POST(request: NextRequest) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json() as Partial<FolderInsert> & { password?: string };

  if (!body.name || !body.slug) {
    return Response.json({ error: 'name e slug são obrigatórios' }, { status: 400 });
  }

  let passwordHash: string | null = null;
  if (body.password) {
    passwordHash = await bcrypt.hash(body.password, 10);
  }

  const svc = getServiceClient();
  const { data, error } = await svc
    .from('folders')
    .insert({
      slug: body.slug,
      name: body.name,
      description: body.description ?? null,
      kind: body.kind ?? 'portfolio',
      locked: body.locked ?? false,
      password_hash: passwordHash,
      cover_url: body.cover_url ?? null,
      cover_path: body.cover_path ?? null,
      date: body.date ?? null,
      location: body.location ?? null,
      price_per_photo: body.price_per_photo ?? null,
      published: body.published ?? false,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ folder: data }, { status: 201 });
}
