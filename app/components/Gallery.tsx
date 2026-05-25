'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { FolderRow, PhotoRow } from '@/lib/supabase/types';
import type { Screen } from './Header';

// ─── Tipos locais compatíveis com a API do Lightbox ─────────────────────────
export interface GalleryPhoto {
  id: string;
  title: string | null;
  img: string;
  ratio: string;
  series?: string;
  year?: number;
  price?: number | null;
}

// ─── Fotos ───────────────────────────────────────────────────────────────────

interface PhotosGalleryProps {
  onOpenLightbox: (items: GalleryPhoto[], index: number) => void;
}

export function PhotosGallery({ onOpenLightbox }: PhotosGalleryProps) {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');

  const series = ['Todas', 'Documental', 'Editorial', 'Show', 'Retrato', 'Comercial', 'Esporte'];

  useEffect(() => {
    const sb = getSupabaseClient();
    sb.from('photos')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => {
        setPhotos(data ?? []);
        setLoading(false);
      });
  }, []);

  const asGalleryPhoto = (p: PhotoRow): GalleryPhoto => ({
    id: p.id,
    title: p.title,
    img: p.watermarked_url ?? '',
    ratio: p.width && p.height ? `${p.width}/${p.height}` : '4/5',
    price: p.price,
  });

  const filtered = photos.filter(() => filter === 'Todas');

  return (
    <section className="section fade-in">
      <div className="section-head">
        <span className="section-num">Galeria · 01</span>
        <h2 className="section-title"><i>Fotos</i></h2>
        <div className="section-meta">
          {photos.length} OBRAS<br />
          {loading ? '...' : '2025 — 2026'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div className="gal-tabs">
          {series.map((s) => (
            <button key={s} data-active={(filter === s).toString()} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>
          {filtered.length} resultados
        </span>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="loading-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
          Nenhuma foto publicada ainda.
        </div>
      ) : (
        <div className="gal-grid" style={{ ['--cols' as string]: 3 }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="gal-card" onClick={() => onOpenLightbox(filtered.map(asGalleryPhoto), i)}>
              <div className="pic" style={{ ['--ratio' as string]: p.width && p.height ? `${p.width}/${p.height}` : '4/5' }}>
                <img src={p.watermarked_url ?? ''} alt={p.title ?? ''} loading="lazy" />
              </div>
              <div className="cap">
                <span className="t">{p.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Vídeos (sem backend por enquanto — estrutura pronta) ─────────────────────

interface VideosGalleryProps {
  onOpenLightbox: (items: GalleryPhoto[], index: number) => void;
}

export function VideosGallery({ onOpenLightbox: _ }: VideosGalleryProps) {
  return (
    <section className="section fade-in">
      <div className="section-head">
        <span className="section-num">Galeria · 02</span>
        <h2 className="section-title"><i>Vídeos</i> & filmes</h2>
        <div className="section-meta">
          EM BREVE<br />
          DOCS · BRAND · MUSIC
        </div>
      </div>
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
        Galeria de vídeos em construção.
      </div>
    </section>
  );
}

// ─── Eventos ─────────────────────────────────────────────────────────────────

interface EventsGalleryProps {
  onOpenEvent: (id: string) => void;
}

export function EventsGallery({ onOpenEvent }: EventsGalleryProps) {
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/folders')
      .then((r) => r.json())
      .then(({ folders }) => {
        setFolders(folders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (d: string | null) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <section className="section fade-in">
      <div className="section-head">
        <span className="section-num">Galeria · 03</span>
        <h2 className="section-title">
          <i>Eventos</i> & coberturas
        </h2>
        <div className="section-meta">
          {loading ? '...' : `${folders.length} GALERIAS`}<br />
          PORTFOLIO · À VENDA
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Carregando...</div>
      ) : folders.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
          Nenhum evento publicado ainda.
        </div>
      ) : (
        <div className="evt-list">
          {folders.map((f, i) => (
            <div key={f.id} className="evt-row" onClick={() => onOpenEvent(f.id)}>
              <span className="evt-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="evt-title">
                  {f.name}
                  <small>{f.description ?? ''}</small>
                </div>
              </div>
              <span className="evt-meta">
                {formatDate(f.date)}<br />
                {f.location} · {f.photo_count} imagens
              </span>
              <span className="evt-tag" data-kind={f.locked ? 'locked' : f.kind}>
                {f.locked ? '🔒 Privado' : f.kind === 'sale' ? 'À venda' : 'Portfólio'}
              </span>
              <span className="evt-arrow">→</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
