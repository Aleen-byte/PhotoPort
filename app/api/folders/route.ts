import { getServiceClient } from '@/lib/supabase/client';

export async function GET() {
  const svc = getServiceClient();
  const { data, error } = await svc
    .from('folders')
    .select('id, slug, name, description, kind, locked, cover_url, date, location, price_per_photo, photo_count, published')
    .eq('published', true)
    .order('date', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ folders: data });
}
