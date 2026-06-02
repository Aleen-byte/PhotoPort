import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';

const WATERMARK_TEXT = process.env.WATERMARK_TEXT ?? '@aleen.code';

async function buildWatermarkedBuffer(input: Buffer, width: number, height: number): Promise<Buffer> {
  const fontSize = Math.max(22, Math.floor(Math.min(width, height) * 0.032));
  const tileW = fontSize * 9;
  const tileH = fontSize * 4;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <pattern id="wm" x="0" y="0" width="${tileW}" height="${tileH}"
        patternUnits="userSpaceOnUse" patternTransform="rotate(-35 0 0)">
        <text x="${tileW / 2}" y="${tileH / 2}"
          text-anchor="middle" dominant-baseline="middle"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}" font-weight="700"
          fill="rgba(255,255,255,0.42)" letter-spacing="1">${WATERMARK_TEXT}</text>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#wm)"/>
    <text x="${width - 16}" y="${height - 14}"
      text-anchor="end" dominant-baseline="auto"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${Math.max(16, Math.floor(width * 0.022))}" font-weight="700"
      fill="rgba(255,255,255,0.65)" letter-spacing="1">${WATERMARK_TEXT}</text>
  </svg>`;

  return sharp(input)
    .composite([{ input: Buffer.from(svg), blend: 'over' }])
    .jpeg({ quality: 88, progressive: true })
    .toBuffer();
}

export async function POST(request: NextRequest, ctx: RouteContext<'/api/admin/photos/[id]/reprocess'>) {
  const user = await verifyAuthHeader(request);
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const { has_watermark } = await request.json() as { has_watermark: boolean };

  const svc = getServiceClient();

  // Buscar dados da foto
  const { data: photo, error: fetchErr } = await svc
    .from('photos')
    .select('original_path, watermarked_path, width, height')
    .eq('id', id)
    .single();

  if (fetchErr || !photo) {
    return Response.json({ error: 'Foto não encontrada' }, { status: 404 });
  }

  // Baixar original do storage
  const { data: origData, error: dlErr } = await svc.storage
    .from('originals')
    .download(photo.original_path);

  if (dlErr || !origData) {
    return Response.json({ error: 'Erro ao baixar original: ' + (dlErr?.message ?? 'arquivo não encontrado') }, { status: 500 });
  }

  const originalBuffer = Buffer.from(await origData.arrayBuffer());
  const width = photo.width ?? 0;
  const height = photo.height ?? 0;

  // Processar com ou sem marca d'água
  const outputBuffer = has_watermark
    ? await buildWatermarkedBuffer(originalBuffer, width, height)
    : await sharp(originalBuffer).jpeg({ quality: 88, progressive: true }).toBuffer();

  // Sobrescrever no bucket watermarked
  const { error: upErr } = await svc.storage
    .from('watermarked')
    .upload(photo.watermarked_path, outputBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (upErr) {
    return Response.json({ error: 'Erro ao salvar: ' + upErr.message }, { status: 500 });
  }

  // Atualizar has_watermark no banco
  const { error: dbErr } = await svc
    .from('photos')
    .update({ has_watermark })
    .eq('id', id);

  if (dbErr) {
    return Response.json({ error: 'Erro no banco: ' + dbErr.message }, { status: 500 });
  }

  return Response.json({ ok: true, has_watermark });
}
