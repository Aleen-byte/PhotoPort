import { NextRequest } from 'next/server';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';

export interface HeroItem {
  photo_id: string;
  order: number;
  img?: string;       // enriched at GET time
  aspect_ratio?: string; // enriched
}

export interface FeaturedItem {
  slot: number;
  folder_id: string;
  title: string;
  kicker: string;
  tag: string;
  img?: string;  // enriched
  slug?: string; // enriched
}

export async function GET() {
  const svc = getServiceClient();

  // Fetch both settings in parallel
  const [heroRes, featuredRes] = await Promise.all([
    svc.from('settings').select('value').eq('key', 'home_hero').single(),
    svc.from('settings').select('value').eq('key', 'home_featured').single(),
  ]);

  let heroRaw: Omit<HeroItem, 'img' | 'aspect_ratio'>[] = [];
  let featuredRaw: Omit<FeaturedItem, 'img' | 'slug'>[] = [];

  try { heroRaw = heroRes.data?.value ? JSON.parse(heroRes.data.value) : []; } catch { /* */ }
  try { featuredRaw = featuredRes.data?.value ? JSON.parse(featuredRes.data.value) : []; } catch { /* */ }

  // Enrich hero with photo data
  const hero = (await Promise.all(
    heroRaw.map(async (h) => {
      const { data: photo } = await svc.from('photos').select('watermarked_url, aspect_ratio').eq('id', h.photo_id).single();
      return { ...h, img: photo?.watermarked_url ?? '', aspect_ratio: photo?.aspect_ratio ?? 'auto' };
    })
  )).filter((h) => h.img);

  // Enrich featured with folder data
  const featured = (await Promise.all(
    featuredRaw.map(async (f) => {
      const { data: folder } = await svc.from('folders').select('cover_url, slug').eq('id', f.folder_id).single();
      return { ...f, img: folder?.cover_url ?? '', slug: folder?.slug ?? '' };
    })
  )).filter((f) => f.img);

  return Response.json({ hero, featured });
}

export async function PUT(request: NextRequest) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { hero, featured } = await request.json() as { hero: HeroItem[]; featured: FeaturedItem[] };
  const svc = getServiceClient();

  // Strip derived fields before saving
  const heroToSave = hero.map(({ img: _, aspect_ratio: __, ...core }) => core);
  const featuredToSave = featured.map(({ img: _, slug: __, ...core }) => core);

  await Promise.all([
    svc.from('settings').upsert({ key: 'home_hero', value: JSON.stringify(heroToSave), updated_at: new Date().toISOString() }),
    svc.from('settings').upsert({ key: 'home_featured', value: JSON.stringify(featuredToSave), updated_at: new Date().toISOString() }),
  ]);

  return Response.json({ ok: true });
}
