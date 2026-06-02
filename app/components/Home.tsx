'use client';
import { useState, useEffect } from 'react';
import { SPECIALTIES } from './data';
import type { FolderRow } from '@/lib/supabase/types';
import type { Screen } from './Header';
import type { HeroItem, FeaturedItem } from '@/app/api/highlights/route';

interface HomeProps {
  onNavigate: (to: Screen) => void;
  onOpenEvent: (id: string) => void;
}

export function Home({ onNavigate, onOpenEvent }: HomeProps) {
  const [hero, setHero] = useState<HeroItem[]>([]);
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [recentFolders, setRecentFolders] = useState<FolderRow[]>([]);

  useEffect(() => {
    fetch('/api/highlights').then((r) => r.json()).then((d) => {
      setHero((d.hero ?? []).sort((a: HeroItem, b: HeroItem) => a.order - b.order));
      setFeatured(d.featured ?? []);
    }).catch(() => {});
    fetch('/api/folders').then((r) => r.json()).then(({ folders }) => {
      setRecentFolders((folders ?? []).slice(0, 4));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (hero.length <= 1) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % hero.length), 8000);
    return () => clearInterval(t);
  }, [hero.length]);

  const currentHero = hero[heroIdx];

  return (
    <div className="fade-in">
      {/* HERO — only photos */}
      <section className="hero">
        {currentHero?.img ? (
          <img className="hero-img" src={currentHero.img} alt="" key={currentHero.photo_id} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, var(--bg-soft) 0%, var(--bg) 100%)' }} />
        )}
        <div className="hero-grain" />
        <div className="hero-vignette" />
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="dot" />
            FOTOGRAFIA & VÍDEO · SÃO PAULO
          </div>
          <h1 className="hero-name">Aleen<i>.</i>Code</h1>
          <div className="hero-meta">
            <div><b>Direção</b>Fotografia & Vídeo<br />Documental, Editorial, Comercial</div>
            <div><b>Base</b>São Paulo<br />Brasil — disponível para viagens</div>
            <div><b>Especialidades</b>Ensaios, eventos<br />e coberturas editoriais</div>
            <div style={{ textAlign: 'right' }}>
              {hero.length > 1 && (
                <>
                  <b>Index</b>
                  {hero.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      style={{ display: 'inline-block', marginLeft: 6, cursor: 'pointer', color: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="hero-scroll">Role para baixo</div>
      </section>

      {/* Specialties marquee */}
      <div className="index-strip">
        <div className="track">
          {[...SPECIALTIES, ...SPECIALTIES].map((s, i) => (
            <span key={i}>
              {String((i % SPECIALTIES.length) + 1).padStart(2, '0')} <i>·</i> {s}
            </span>
          ))}
        </div>
      </div>

      {/* Trabalhos em Destaque — only folders */}
      {featured.length > 0 && (
        <section className="section">
          <div className="section-head">
            <span className="section-num">01 — Selecionado</span>
            <h2 className="section-title">Trabalhos <i>em destaque</i></h2>
            <div className="section-meta">
              {new Date().getFullYear()}<br />
              <a onClick={() => onNavigate('events')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Ver todos →</a>
            </div>
          </div>
          {featured.map((f, i) => (
            <div
              className={`feature-row ${i % 2 ? 'alt' : ''}`}
              key={f.folder_id}
              onClick={() => f.slug && onOpenEvent(f.slug)}
              style={{ cursor: 'pointer' }}
            >
              <div className="kicker">{f.kicker}<br />{new Date().getFullYear()} · {f.tag}</div>
              <div className="feature-img">
                <img src={f.img!} alt={f.title} />
                <div className="feature-cap" style={{ position: 'absolute', left: 16, right: 16, bottom: 16, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: 12 }}>
                  <span className="title" style={{ color: '#fff' }}>{f.title}</span>
                  <span>VER PROJETO ↗</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Recent events */}
      <section className="section" style={{ paddingTop: featured.length > 0 ? 0 : undefined }}>
        <div className="section-head">
          <span className="section-num">{featured.length > 0 ? '02' : '01'} — Eventos recentes</span>
          <h2 className="section-title">Coberturas <i>& galerias</i></h2>
          <div className="section-meta">
            RECENTES<br />
            <a onClick={() => onNavigate('events')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Galeria completa →</a>
          </div>
        </div>
        <div className="evt-list">
          {recentFolders.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
              Nenhum evento publicado ainda.
            </div>
          ) : recentFolders.map((f, i) => (
            <div key={f.id} className="evt-row" onClick={() => onOpenEvent(f.slug)}>
              <span className="evt-num">{String(i + 1).padStart(2, '0')}</span>
              <div><div className="evt-title">{f.name}<small>{f.description ?? ''}</small></div></div>
              <span className="evt-meta">{f.date ?? ''}<br />{f.location ?? ''}</span>
              <span className="evt-tag" data-kind={f.kind}>{f.kind === 'sale' ? 'À venda' : 'Portfólio'}</span>
              <span className="evt-arrow">→</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fotos teaser */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="section-num">{featured.length > 0 ? '03' : '02'} — Galeria</span>
          <h2 className="section-title">Stills <i>selecionados</i></h2>
          <div className="section-meta">
            <a onClick={() => onNavigate('photos')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Galeria de fotos →</a>
          </div>
        </div>
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
          Fotos publicadas aparecerão aqui.
        </div>
      </section>
    </div>
  );
}
