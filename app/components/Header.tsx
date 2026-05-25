'use client';

export type Screen = 'home' | 'photos' | 'videos' | 'events' | 'event' | 'about' | 'contact' | 'checkout' | 'login' | 'admin';

interface HeaderProps {
  screen: string;
  headerStyle: string;
  overHero: boolean;
  onNavigate: (to: Screen) => void;
  cartCount: number;
  onOpenCart: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Index' },
  { id: 'photos', label: 'Fotos' },
  { id: 'videos', label: 'Vídeos' },
  { id: 'events', label: 'Eventos' },
  { id: 'about', label: 'Sobre' },
  { id: 'contact', label: 'Contato' },
];

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Header({ screen, headerStyle, overHero, onNavigate, cartCount, onOpenCart, dark, onToggleDark }: HeaderProps) {
  return (
    <header className="hdr" data-style={headerStyle} data-over-hero={overHero.toString()}>
      <button className="hdr-brand" onClick={() => onNavigate('home')} style={{ background: 'transparent', border: 0 }}>
        Aleen<i>.</i>Code
      </button>
      <nav className="hdr-nav">
        {NAV_ITEMS.map((n) => (
          <a
            key={n.id}
            data-active={(screen === n.id).toString()}
            onClick={() => onNavigate(n.id as Screen)}
            style={{ cursor: 'pointer' }}
          >
            {n.label}
          </a>
        ))}
      </nav>
      <div className="hdr-right">
        <button
          className="hdr-theme-toggle"
          onClick={onToggleDark}
          title={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button className="hdr-cart" onClick={onOpenCart}>
          Carrinho{' '}
          {cartCount > 0 && <span className="hdr-cart-dot">{cartCount}</span>}
        </button>
        <button className="hdr-cta" onClick={() => onNavigate('login')}>Admin</button>
      </div>
    </header>
  );
}

interface FooterProps {
  onNavigate: (to: Screen) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="ftr">
      <h2 className="ftr-big">
        Vamos criar<br />algo <i>real</i>.
      </h2>
      <div className="ftr-meta">
        <a onClick={() => onNavigate('contact')} style={{ cursor: 'pointer' }}>hello@aleen.code</a>
        <a>@aleen.code</a>
        <a>+55 11 9·••••·••··</a>
        <span style={{ marginTop: 18 }}>São Paulo / Brasil</span>
      </div>
      <div className="ftr-credit">
        <span>© 2026 Aleen.Code — Fotografia & Vídeo</span>
        <span>v.2026.05 — Editorial silencioso</span>
      </div>
    </footer>
  );
}
