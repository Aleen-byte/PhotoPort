'use client';

import { useState, useEffect } from 'react';
import { HOME_FEATURES, SPECIALTIES, EVENTS, PHOTOS } from './data';
import type { Screen } from './Header';

interface HomeProps {
  onNavigate: (to: Screen) => void;
  onOpenEvent: (id: string) => void;
}

export function Home({ onNavigate, onOpenEvent }: HomeProps) {
  const [heroIdx, setHeroIdx] = useState(0);
  const hero = HOME_FEATURES[heroIdx];

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HOME_FEATURES.length), 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fade-in">
      {/* HERO */}
      <section className="hero">
        <img className="hero-img" src={hero.img} alt={hero.title} key={hero.id} />
        <div className="hero-grain" />
        <div className="hero-vignette" />
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="dot" />
            EM EXIBIÇÃO · {hero.kicker} · {hero.year}
          </div>
          <h1 className="hero-name">
            Aleen<i>.</i>Code
          </h1>
          <div className="hero-meta">
            <div><b>Direção</b>Fotografia & Vídeo<br />Documental, Editorial, Comercial</div>
            <div><b>Base</b>São Paulo<br />Brasil — disponível para viagens</div>
            <div>
              <b>Em destaque</b>
              <i style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18 }}>{hero.title}</i>
              <br />{hero.tag}
            </div>
            <div style={{ textAlign: 'right' }}>
              <b>Index</b>
              {HOME_FEATURES.map((f, i) => (
                <span
                  key={f.id}
                  onClick={() => setHeroIdx(i)}
                  style={{ display: 'inline-block', marginLeft: 6, cursor: 'pointer', color: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              ))}
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

      {/* Featured Works */}
      <section className="section">
        <div className="section-head">
          <span className="section-num">01 — Selecionado</span>
          <h2 className="section-title">
            Trabalhos <i>em destaque</i>
          </h2>
          <div className="section-meta">
            2026<br />
            <a onClick={() => onNavigate('events')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Ver todos →</a>
          </div>
        </div>

        {HOME_FEATURES.map((f, i) => (
          <div
            className={`feature-row ${i % 2 ? 'alt' : ''}`}
            key={f.id}
            onClick={() => onOpenEvent(f.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="kicker">{f.kicker}<br />{f.year} · {f.tag}</div>
            <div className="feature-img">
              <img src={f.img} alt={f.title} />
              <div className="feature-cap" style={{ position: 'absolute', left: 16, right: 16, bottom: 16, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: 12 }}>
                <span className="title" style={{ color: '#fff' }}>{f.title}</span>
                <span>VER PROJETO ↗</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Recent events */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="section-num">02 — Eventos recentes</span>
          <h2 className="section-title">
            Coberturas <i>& galerias</i>
          </h2>
          <div className="section-meta">
            ÚLTIMOS 60 DIAS<br />
            <a onClick={() => onNavigate('events')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Galeria completa →</a>
          </div>
        </div>

        <div className="evt-list">
          {EVENTS.slice(0, 4).map((e, i) => (
            <div key={e.id} className="evt-row" onClick={() => onOpenEvent(e.id)}>
              <span className="evt-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="evt-title">{e.title}<small>{e.sub}</small></div>
              </div>
              <span className="evt-meta">{e.date}<br />{e.location}</span>
              <span className="evt-tag" data-kind={e.kind}>
                {e.kind === 'sale' ? 'À venda' : 'Portfólio'}
              </span>
              <span className="evt-arrow">→</span>
            </div>
          ))}
        </div>
      </section>

      {/* Photo grid teaser */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="section-num">03 — Stills selecionados</span>
          <h2 className="section-title">
            Quadros <i>recentes</i>
          </h2>
          <div className="section-meta">
            <a onClick={() => onNavigate('photos')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>Galeria de fotos →</a>
          </div>
        </div>
        <div className="gal-grid" style={{ ['--cols' as string]: 4 }}>
          {PHOTOS.slice(0, 8).map((p) => (
            <div key={p.id} className="gal-card" onClick={() => onNavigate('photos')}>
              <div className="pic" style={{ ['--ratio' as string]: p.ratio }}>
                <img src={p.img} alt={p.title} loading="lazy" />
                <span className="pic-tag"><span className="dot" />{p.series}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
