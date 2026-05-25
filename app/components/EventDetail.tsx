'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { CartItem } from './data';
import type { Screen } from './Header';
import type { FolderRow, PhotoRow } from '@/lib/supabase/types';

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxPhoto {
  id: string;
  title: string | null;
  watermarked_url: string | null;
  price: number | null;
}

interface LightboxProps {
  items: LightboxPhoto[];
  index: number;
  isSale: boolean;
  eventTitle: string;
  eventId?: string;
  inCart: (id: string) => boolean;
  onAddToCart: (item: CartItem) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ items, index, isSale, eventTitle, eventId, inCart, onAddToCart, onClose, onPrev, onNext }: LightboxProps) {
  const it = items[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  if (!it) return null;

  return (
    <div className="lightbox">
      <div className="lightbox-bar">
        <div className="meta">
          <span>{eventTitle || 'Portfolio'}</span>
          <span>·</span>
          <span>{it.title ?? 'Foto'}</span>
          <span>·</span>
          <span>{index + 1} / {items.length}</span>
        </div>
        <div className="actions">
          {isSale && it.price != null && (
            <button
              className={inCart(it.id) ? 'primary' : ''}
              onClick={() => onAddToCart({
                id: it.id,
                img: it.watermarked_url ?? '',
                price: it.price!,
                title: it.title ?? 'Foto',
                eventTitle,
                eventId: eventId ?? '',
              })}
            >
              {inCart(it.id) ? '✓ No carrinho' : `＋ Adicionar · R$ ${it.price}`}
            </button>
          )}
          <button onClick={onClose}>×</button>
        </div>
      </div>
      <div className="lightbox-stage">
        <button className="nav" onClick={onPrev}>←</button>
        <img src={it.watermarked_url ?? ''} alt={it.title ?? ''} />
        <button className="nav" onClick={onNext}>→</button>
      </div>
    </div>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────

interface PasswordGateProps {
  folder: Pick<FolderRow, 'name' | 'description' | 'cover_url' | 'slug'>;
  pw: string;
  setPw: (v: string) => void;
  pwErr: boolean;
  loading: boolean;
  onSubmit: () => void;
  onNavigate: (to: Screen) => void;
}

function PasswordGate({ folder, pw, setPw, pwErr, loading, onSubmit, onNavigate }: PasswordGateProps) {
  return (
    <div className="fade-in" style={{ minHeight: 'calc(100vh - 73px)', display: 'grid', placeItems: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {folder.cover_url && (
        <img src={folder.cover_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) blur(4px)', zIndex: 0 }} alt="" />
      )}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, width: '100%', padding: 40, background: 'var(--bg)', border: '1px solid var(--line)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 12 }}>
          ● Galeria privada
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 48, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {folder.name}
        </h2>
        {folder.description && (
          <p style={{ color: 'var(--fg-mute)', fontSize: 14, margin: '0 0 32px' }}>{folder.description}</p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="co-fld" style={{ textAlign: 'left' }}>
            <label>Senha do convite</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{ background: 'var(--bg-elev)' }}
            />
          </div>
          {pwErr && <div style={{ color: 'oklch(0.6 0.18 25)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Senha incorreta.</div>}
          <button type="submit" className="btn-solid" style={{ width: '100%', padding: 14, justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar na galeria'}
          </button>
        </form>
        <a onClick={() => onNavigate('events')} style={{ cursor: 'pointer', marginTop: 24, display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-soft)' }}>← Voltar para eventos</a>
      </div>
    </div>
  );
}

// ─── EventDetail ──────────────────────────────────────────────────────────────

interface EventDetailProps {
  eventId: string;
  onNavigate: (to: Screen) => void;
  onAddToCart: (item: CartItem) => void;
  cart: CartItem[];
}

export function EventDetail({ eventId, onNavigate, onAddToCart, cart }: EventDetailProps) {
  const [folder, setFolder] = useState<FolderRow | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loadingFolder, setLoadingFolder] = useState(true);

  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Carregar pasta pelo ID (usando a rota pública, que aceita id ou slug)
  useEffect(() => {
    setLoadingFolder(true);
    setUnlocked(false);

    const sb = getSupabaseClient();
    sb.from('folders')
      .select('*')
      .eq('id', eventId)
      .eq('published', true)
      .single()
      .then(({ data }: { data: FolderRow | null }) => {
        setFolder(data);
        if (data && !data.locked) {
          // Pasta aberta: carregar fotos
          sb.from('photos')
            .select('*')
            .eq('folder_id', eventId)
            .eq('published', true)
            .order('sort_order')
            .then(({ data: pics }: { data: PhotoRow[] | null }) => {
              setPhotos(pics ?? []);
              setUnlocked(true);
            });
        }
        setLoadingFolder(false);
      });
  }, [eventId]);

  const handlePasswordSubmit = async () => {
    if (!folder) return;
    setPwLoading(true);
    setPwErr(false);
    try {
      const res = await fetch(`/api/folders/${folder.slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPhotos(json.photos ?? []);
        setUnlocked(true);
      } else {
        setPwErr(true);
      }
    } catch {
      setPwErr(true);
    } finally {
      setPwLoading(false);
    }
  };

  if (loadingFolder) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        Carregando galeria...
      </div>
    );
  }

  if (!folder) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}>Galeria não encontrada.</p>
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => onNavigate('events')}>← Eventos</button>
      </div>
    );
  }

  if (!unlocked && folder.locked) {
    return (
      <PasswordGate
        folder={folder}
        pw={pw}
        setPw={setPw}
        pwErr={pwErr}
        loading={pwLoading}
        onSubmit={handlePasswordSubmit}
        onNavigate={onNavigate}
      />
    );
  }

  const inCart = (id: string) => cart.some((c) => c.id === id);
  const isSale = folder.kind === 'sale';
  const words = folder.name.split(' ');

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="evt-hero">
        {folder.cover_url && <img src={folder.cover_url} alt={folder.name} />}
        <div className="hero-grain" />
        <div className="hero-vignette" />
        <div className="inner">
          <div className="crumb">
            <a onClick={() => onNavigate('events')} style={{ cursor: 'pointer' }}>← Eventos</a>
            <span className="sep">/</span>
            <span>{folder.description ?? ''}</span>
          </div>
          <h1>
            {words.map((w, i) =>
              i === words.length - 1 ? <i key={i}>{w}</i> : <span key={i}>{w} </span>
            )}
          </h1>
          <div className="bar">
            {folder.date && <div><b>Data</b>{formatDate(folder.date)}</div>}
            {folder.location && <div><b>Local</b>{folder.location}</div>}
            <div><b>Imagens</b>{photos.length} de {folder.photo_count}</div>
            <div><b>Modo</b>{isSale ? 'Venda por foto' : 'Portfólio'}</div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>↗ Compartilhar</button>
            </div>
          </div>
        </div>
      </section>

      {/* Mode bar */}
      <div className="evt-mode">
        <div className="left">
          {isSale ? (
            <>
              <span className="evt-mode-pill"><span className="dot" /> Galeria à venda</span>
              <span>Clique em qualquer foto · adicione ao carrinho{folder.price_per_photo ? ` · R$ ${folder.price_per_photo} por imagem` : ''}</span>
            </>
          ) : (
            <>
              <span className="evt-mode-pill" style={{ background: 'var(--bg-soft)', color: 'var(--fg-soft)' }}>
                <span className="dot" style={{ background: 'var(--fg-mute)' }} /> Portfólio
              </span>
              <span>Galeria pública — uso editorial. Para licenciamento, fale comigo.</span>
            </>
          )}
        </div>
        <div className="right">
          <span>{photos.length} imagens</span>
          {isSale && cart.length > 0 && (
            <button className="btn-solid">
              {cart.length} no carrinho · R$ {cart.reduce((s, c) => s + c.price, 0)}
            </button>
          )}
        </div>
      </div>

      {/* Grid de fotos */}
      <section className="section" style={{ paddingTop: 40 }}>
        {photos.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            Nenhuma foto publicada nesta galeria.
          </div>
        ) : (
          <div className="gal-grid" style={{ ['--cols' as string]: 4 }}>
            {photos.map((p, i) => {
              const photoPrice = p.price ?? folder.price_per_photo ?? 0;
              return (
                <div
                  key={p.id}
                  className={`gal-card ${isSale ? 'sale-card' : ''}`}
                  data-in-cart={inCart(p.id).toString()}
                  onClick={() => setLightboxIdx(i)}
                >
                  <div className="pic" style={{ ['--ratio' as string]: '4/5' }}>
                    <img src={p.watermarked_url ?? ''} alt={p.title ?? ''} loading="lazy" />
                    {isSale && <div className="wm">@aleen.code</div>}
                    {isSale ? (
                      <div className="overlay">
                        <button
                          className="add"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onAddToCart({
                              id: p.id,
                              img: p.watermarked_url ?? '',
                              price: photoPrice,
                              title: p.title ?? 'Foto',
                              eventTitle: folder.name,
                              eventId: folder.id,
                            });
                          }}
                        >
                          {inCart(p.id) ? '✓ No carrinho' : '＋ Adicionar'}
                        </button>
                        <span className="price">R$ {photoPrice}</span>
                      </div>
                    ) : (
                      <span className="pic-tag"><span className="dot" />{p.title}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {lightboxIdx !== null && (
        <Lightbox
          items={photos}
          index={lightboxIdx}
          isSale={isSale}
          eventTitle={folder.name}
          eventId={folder.id}
          inCart={inCart}
          onAddToCart={onAddToCart}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((i) => ((i ?? 0) - 1 + photos.length) % photos.length)}
          onNext={() => setLightboxIdx((i) => ((i ?? 0) + 1) % photos.length)}
        />
      )}
    </div>
  );
}
