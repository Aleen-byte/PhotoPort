'use client';

import { useState } from 'react';
import { SPECIALTIES } from './data';
import type { Screen } from './Header';

interface AboutProps {
  onNavigate: (to: Screen) => void;
}

export function About({ onNavigate }: AboutProps) {
  return (
    <div className="fade-in">
      <section className="about">
        <div className="about-portrait">
          <img src="https://picsum.photos/seed/aleen-portrait/900/1100" alt="Retrato Aleen" />
        </div>
        <div className="about-text">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 24 }}>
            Sobre · Aleen.Code · est. 2025
          </div>
          <h1>
            Documento o <i>instante</i>.<br />
            Edito o <i>silêncio</i>.
          </h1>
          <p>
            Sou fotógrafa e videomaker com base em São Paulo. Trabalho no encontro entre <strong>documental</strong> e <strong>editorial</strong> — buscando a fotografia que aconteceria mesmo sem a câmera por perto.
          </p>
          <p>
            Cubro casamentos, shows, esportes, ensaios autorais e projetos comerciais. Acredito em pouca direção, muito tempo, e olhar para o que está acontecendo entre as poses.
          </p>
          <p style={{ marginTop: 32 }}>
            <button className="btn-solid" onClick={() => onNavigate('contact')}>Trabalhar comigo →</button>
          </p>
        </div>
      </section>

      <div className="specs">
        <div className="spec">
          <b>Especialidades</b>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.3 }}>
            {SPECIALTIES.slice(0, 4).join(', ')}.
          </span>
        </div>
        <div className="spec">
          <b>Equipamento</b>
          <span>Sony A7IV<br />Sony FX3<br />DJI Mini 4 Pro</span>
        </div>
        <div className="spec">
          <b>Clientes</b>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Nubank, Lab Coração, Casa Natura, Mahmundi, ALMA Studio
          </span>
        </div>
        <div className="spec">
          <b>Disponibilidade</b>
          <span>Jun · Jul 2026<br /><span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>3 datas abertas</span></span>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="contact fade-in">
      <div className="contact-left">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 24 }}>
          Contato · Resposta em até 48h
        </div>
        <h1>Vamos <i>conversar</i>.</h1>
        <p>
          Conte sobre o projeto: tipo, data aproximada, lugar e referências. Respondo com proposta e disponibilidade em até dois dias úteis.
        </p>

        <div className="contact-links">
          <a className="contact-link" style={{ cursor: 'pointer' }}>
            <b>Email</b>
            <span>hello@aleen.code</span>
            <span className="arr">↗</span>
          </a>
          <a className="contact-link" style={{ cursor: 'pointer' }}>
            <b>Instagram</b>
            <span>@aleen.code</span>
            <span className="arr">↗</span>
          </a>
          <a className="contact-link" style={{ cursor: 'pointer' }}>
            <b>Vimeo</b>
            <span>vimeo.com/aleencode</span>
            <span className="arr">↗</span>
          </a>
          <a className="contact-link" style={{ cursor: 'pointer' }}>
            <b>Studio</b>
            <span>Vila Buarque, São Paulo</span>
            <span className="arr">↗</span>
          </a>
        </div>
      </div>

      <div>
        <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div className="co-fld">
            <label>Você é</label>
            <select>
              <option>Cliente / Marca</option>
              <option>Noivos / Casal</option>
              <option>Artista / Banda</option>
              <option>Atleta / Time</option>
              <option>Imprensa / Editorial</option>
            </select>
          </div>
          <div className="co-grid2">
            <div className="co-fld">
              <label>Nome</label>
              <input placeholder="Seu nome" required />
            </div>
            <div className="co-fld">
              <label>Email</label>
              <input type="email" placeholder="email@dominio.com" required />
            </div>
          </div>
          <div className="co-grid2">
            <div className="co-fld">
              <label>Tipo de trabalho</label>
              <select>
                <option>Foto + Vídeo</option>
                <option>Somente foto</option>
                <option>Somente vídeo</option>
                <option>Reel / conteúdo social</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="co-fld">
              <label>Data aproximada</label>
              <input placeholder="ex. 12/08/2026" />
            </div>
          </div>
          <div className="co-fld">
            <label>Sobre o projeto</label>
            <textarea rows={6} placeholder="Conte um pouco sobre o que você imagina, referências, lugar..." />
          </div>
          <button type="submit" className="btn-solid" style={{ padding: 16, justifyContent: 'center', fontSize: 12 }}>
            {sent ? '✓ Mensagem enviada' : 'Enviar mensagem →'}
          </button>
          {sent && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.06em', textAlign: 'center' }}>
              Obrigada! Te respondo em até 48 horas.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
