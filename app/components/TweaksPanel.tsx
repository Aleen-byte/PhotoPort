'use client';

import { useState } from 'react';

export interface TweakValues {
  dark: boolean;
  accent: string;
  density: string;
  headerStyle: string;
  type: string;
  darkBg: string;
  lightBg: string;
}

export const TWEAK_DEFAULTS: TweakValues = {
  dark: false,
  accent: '#2f9e63',
  density: 'regular',
  headerStyle: 'sticky',
  type: 'editorial',
  darkBg: '#1a1814',
  lightBg: '#f1f0eb',
};

const DARK_BG_OPTIONS = ['#0a0a0a', '#1c1612', '#1a1814', '#171411', '#0d1411'];
const LIGHT_BG_OPTIONS = ['#fafaf7', '#f4ecd9', '#ede3cc', '#efe7d6', '#f1f0eb'];
const ACCENT_OPTIONS = ['#3ddc84', '#2f9e63', '#7fb069', '#a3e635', '#1a5f3f'];

function TweakToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button
        type="button"
        className="twk-toggle"
        data-on={value ? '1' : '0'}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const n = options.length;
  const idx = Math.max(0, options.indexOf(value));
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div className="twk-seg" role="radiogroup">
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={o === value} onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function TweakColor({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div className="twk-chips" role="radiogroup">
        {options.map((o) => {
          const on = o.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={o}
              type="button"
              className="twk-chip"
              data-on={on ? '1' : '0'}
              style={{ background: o }}
              onClick={() => onChange(o)}
              title={o}
            >
              {on && (
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="M3 7.2 5.8 10 11 4.2"
                    fill="none"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="rgba(255,255,255,0.9)"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TweaksPanelProps {
  t: TweakValues;
  setTweak: (key: keyof TweakValues, value: TweakValues[keyof TweakValues]) => void;
}

export function TweaksPanel({ t, setTweak }: TweaksPanelProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className="twk-open-btn" onClick={() => setOpen(true)}>
        Tweaks
      </button>
    );
  }

  return (
    <div className="twk-panel">
      <div className="twk-hd">
        <b>Tweaks</b>
        <button className="twk-x" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">Tema</div>
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakColor label="Verde acento" value={t.accent} options={ACCENT_OPTIONS} onChange={(v) => setTweak('accent', v)} />
        <TweakColor label="Fundo · escuro" value={t.darkBg} options={DARK_BG_OPTIONS} onChange={(v) => setTweak('darkBg', v)} />
        <TweakColor label="Fundo · claro" value={t.lightBg} options={LIGHT_BG_OPTIONS} onChange={(v) => setTweak('lightBg', v)} />

        <div className="twk-sect">Layout</div>
        <TweakRadio label="Densidade" value={t.density} options={['compact', 'regular', 'spacious']} onChange={(v) => setTweak('density', v)} />
        <TweakRadio label="Header" value={t.headerStyle} options={['sticky', 'minimal', 'transparent']} onChange={(v) => setTweak('headerStyle', v)} />

        <div className="twk-sect">Tipografia</div>
        <TweakRadio label="Pareamento" value={t.type} options={['editorial', 'sans', 'serif', 'mono']} onChange={(v) => setTweak('type', v)} />
      </div>
    </div>
  );
}
