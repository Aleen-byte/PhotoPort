import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { getServiceClient, verifyAuthHeader } from '@/lib/supabase/client';

const WATERMARK_TEXT = process.env.WATERMARK_TEXT ?? '@aleen.code';

async function buildWatermarkedBuffer(input: Buffer, width: number, height: number): Promise<Buffer> {
  const fontSize = Math.max(22, Math.floor(Math.min(width, height) * 0.032));
  const tileW = fontSize * 9;
  const tileH = fontSize * 4;
  const text = WATERMARK_TEXT;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <pattern id="wm" x="0" y="0" width="${tileW}" height="${tileH}"
        patternUnits="userSpaceOnUse" patternTransform="rotate(-35 0 0)">
        <text x="${tileW / 2}" y="${tileH / 2}"
          text-anchor="middle" dominant-baseline="middle"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}" font-weight="700"
          fill="rgba(255,255,255,0.42)" letter-spacing="1">${text}</text>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#wm)"/>
    <text x="${width - 16}" y="${height - 14}"
      text-anchor="end" dominant-baseline="auto"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${Math.max(16, Math.floor(width * 0.022))}" font-weight="700"
      fill="rgba(255,255,255,0.65)" letter-spacing="1">${text}</text>
  </svg>`;

  return sharp(input)
    .composite([{ input: Buffer.from(svg), blend: 'over' }])
    .jpeg({ quality: 88, progressive: true })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  const user = await verifyAuthHeader(request);
  if (!user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const folderId = formData.get('folder_id') as string | null;
  const title = (formData.get('title') as string | null) ?? null;
  const priceRaw = formData.get('price') as string | null;
  const price = priceRaw ? parseFloat(priceRaw) : null;

  if (!file || !folderId) {
    return Response.json({ error: 'file e folder_id são obrigatórios' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const originalBuffer = Buffer.from(arrayBuffer);

  // Obter metadados da imagem
  const meta = await sharp(originalBuffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  // Gerar UUID para o arquivo
  const photoId = crypto.randomUUID();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const originalPath = `${folderId}/${photoId}.${ext}`;
  const watermarkedPath = `${folderId}/${photoId}.jpg`;

  // Criar versão com marca d'água
  const watermarkedBuffer = await buildWatermarkedBuffer(originalBuffer, width, height);

  const svc = getServiceClient();

  // Upload original (privado)
  const { error: origErr } = await svc.storage
    .from('originals')
    .upload(originalPath, originalBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (origErr) {
    return Response.json({ error: 'Erro ao salvar original: ' + origErr.message }, { status: 500 });
  }

  // Upload watermarked (público)
  const { error: wmErr } = await svc.storage
    .from('watermarked')
    .upload(watermarkedPath, watermarkedBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (wmErr) {
    // Limpar original se watermarked falhar
    await svc.storage.from('originals').remove([originalPath]);
    return Response.json({ error: 'Erro ao salvar watermark: ' + wmErr.message }, { status: 500 });
  }

  // Obter URL pública do watermarked
  const { data: { publicUrl } } = svc.storage
    .from('watermarked')
    .getPublicUrl(watermarkedPath);

  // Inserir registro no banco
  const { data: photo, error: dbErr } = await svc
    .from('photos')
    .insert({
      id: photoId,
      folder_id: folderId,
      title: title ?? file.name.replace(/\.[^.]+$/, ''),
      filename: file.name,
      original_path: originalPath,
      watermarked_path: watermarkedPath,
      watermarked_url: publicUrl,
      width,
      height,
      size_bytes: originalBuffer.length,
      price,
      sort_order: 0,
      published: true,
    })
    .select()
    .single();

  if (dbErr) {
    return Response.json({ error: 'Erro no banco: ' + dbErr.message }, { status: 500 });
  }

  return Response.json({ photo }, { status: 201 });
}
