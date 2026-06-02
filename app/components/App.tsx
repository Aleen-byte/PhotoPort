'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { Header, Footer, type Screen } from './Header';
import { Home } from './Home';
import { PhotosGallery, VideosGallery, EventsGallery } from './Gallery';
import { EventDetail, Lightbox } from './EventDetail';
import { CartDrawer, Checkout } from './Cart';
import { About, Contact } from './AboutContact';
import { Login, Admin } from './Admin';
import { TweaksPanel, TWEAK_DEFAULTS, type TweakValues } from './TweaksPanel';
import type { CartItem } from './data';
import type { GalleryPhoto } from './Gallery';

interface LightboxState {
  items: GalleryPhoto[];
  index: number;
}

function applyTheme(t: TweakValues) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t.dark ? 'dark' : 'light');
  root.setAttribute('data-density', t.density);
  root.setAttribute('data-type', t.type);

  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--accent-soft', `color-mix(in oklab, ${t.accent} 22%, transparent)`);
  root.style.setProperty('--accent-faint', `color-mix(in oklab, ${t.accent} 10%, transparent)`);
  const r = parseInt(t.accent.slice(1, 3), 16);
  const g = parseInt(t.accent.slice(3, 5), 16);
  const b = parseInt(t.accent.slice(5, 7), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  root.style.setProperty('--accent-fg', lum > 140 ? '#08130d' : '#f4fbf6');

  const bg = t.dark ? t.darkBg : t.lightBg;
  root.style.setProperty('--bg', bg);
  if (t.dark) {
    root.style.setProperty('--bg-elev', `color-mix(in oklab, ${bg} 92%, white)`);
    root.style.setProperty('--bg-soft', `color-mix(in oklab, ${bg} 86%, white)`);
    root.style.setProperty('--fg', `color-mix(in oklab, ${bg} 4%, #f6f3ec)`);
    root.style.setProperty('--fg-soft', `color-mix(in oklab, ${bg} 28%, #f6f3ec)`);
    root.style.setProperty('--fg-mute', `color-mix(in oklab, ${bg} 52%, #f6f3ec)`);
    root.style.setProperty('--fg-faint', `color-mix(in oklab, ${bg} 76%, #f6f3ec)`);
    root.style.setProperty('--line', `color-mix(in oklab, ${bg} 82%, white)`);
    root.style.setProperty('--line-strong', `color-mix(in oklab, ${bg} 68%, white)`);
  } else {
    root.style.setProperty('--bg-elev', `color-mix(in oklab, ${bg} 60%, white)`);
    root.style.setProperty('--bg-soft', `color-mix(in oklab, ${bg} 92%, black)`);
    root.style.setProperty('--fg', `color-mix(in oklab, ${bg} 6%, #0e0c08)`);
    root.style.setProperty('--fg-soft', `color-mix(in oklab, ${bg} 28%, #0e0c08)`);
    root.style.setProperty('--fg-mute', `color-mix(in oklab, ${bg} 50%, #0e0c08)`);
    root.style.setProperty('--fg-faint', `color-mix(in oklab, ${bg} 76%, #0e0c08)`);
    root.style.setProperty('--line', `color-mix(in oklab, ${bg} 86%, black)`);
    root.style.setProperty('--line-strong', `color-mix(in oklab, ${bg} 74%, black)`);
  }
}

export function App() {
  const [t, setTweakState] = useState<TweakValues>(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState<Screen>('home');
  const [eventId, setEventId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [lightboxState, setLightboxState] = useState<LightboxState | null>(null);

  const setTweak = (key: keyof TweakValues, value: TweakValues[keyof TweakValues]) => {
    setTweakState((prev) => ({ ...prev, [key]: value }));
  };

  // Supabase auth state
  useEffect(() => {
    const sb = getSupabaseClient();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_IN') setScreen('admin');
      if (event === 'SIGNED_OUT') setScreen('home');
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { applyTheme(t); }, [t]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen, eventId]);

  const navigate = (to: Screen) => {
    if (to === 'login') { setScreen('login'); return; }
    if (to === 'admin' && !session) { setScreen('login'); return; }
    setScreen(to);
  };

  const openEvent = (id: string) => { setEventId(id); setScreen('event'); };
  const addToCart = (item: CartItem) => {
    setCart((c) => c.some((x) => x.id === item.id) ? c : [...c, item]);
    setCartOpen(true);
  };
  const removeFromCart = (id: string) => setCart((c) => c.filter((x) => x.id !== id));

  if (screen === 'login') {
    return (
      <>
        <Login onNavigate={navigate} onLogin={() => setScreen('admin')} />
        <TweaksPanel t={t} setTweak={setTweak} />
      </>
    );
  }

  if (screen === 'admin' && session) {
    return (
      <>
        <Admin
          onNavigate={navigate}
          onLogout={() => setSession(null)}
          userEmail={session.user.email}
        />
        <TweaksPanel t={t} setTweak={setTweak} />
      </>
    );
  }

  const overHero = screen === 'home';
  const headerScreen = (
    { photos: 'photos', videos: 'videos', events: 'events', about: 'about', contact: 'contact', home: 'home', event: 'events', checkout: 'events' } as Record<string, string>
  )[screen] || screen;

  let body;
  switch (screen) {
    case 'home':
      body = <Home onNavigate={navigate} onOpenEvent={openEvent} />;
      break;
    case 'photos':
      body = <PhotosGallery onOpenLightbox={(items, i) => setLightboxState({ items, index: i })} />;
      break;
    case 'videos':
      body = <VideosGallery onOpenLightbox={(items, i) => setLightboxState({ items, index: i })} />;
      break;
    case 'events':
      body = <EventsGallery onOpenEvent={openEvent} />;
      break;
    case 'event':
      body = <EventDetail eventId={eventId!} onNavigate={navigate} onAddToCart={addToCart} cart={cart} />;
      break;
    case 'about':
      body = <About onNavigate={navigate} />;
      break;
    case 'contact':
      body = <Contact />;
      break;
    case 'checkout':
      body = <Checkout cart={cart} onNavigate={navigate} onComplete={() => setCart([])} />;
      break;
    default:
      body = <Home onNavigate={navigate} onOpenEvent={openEvent} />;
  }

  return (
    <>
      <div className="app">
        <Header
          screen={headerScreen}
          headerStyle={t.headerStyle}
          overHero={overHero && t.headerStyle === 'transparent'}
          onNavigate={navigate}
          cartCount={cart.length}
          onOpenCart={() => setCartOpen(true)}
          dark={t.dark}
          onToggleDark={() => setTweak('dark', !t.dark)}
        />
        {body}
        {screen !== 'checkout' && <Footer onNavigate={navigate} />}
      </div>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onCheckout={() => { setCartOpen(false); setScreen('checkout'); }}
      />

      {lightboxState && (
        <Lightbox
          items={lightboxState.items.map((p) => ({
            id: p.id,
            title: p.title,
            watermarked_url: p.img,
            price: p.price ?? null,
          }))}
          index={lightboxState.index}
          isSale={false}
          eventTitle="Portfolio"
          inCart={() => false}
          onAddToCart={() => {}}
          onClose={() => setLightboxState(null)}
          onPrev={() => setLightboxState((s) => s ? ({ ...s, index: (s.index - 1 + s.items.length) % s.items.length }) : null)}
          onNext={() => setLightboxState((s) => s ? ({ ...s, index: (s.index + 1) % s.items.length }) : null)}
        />
      )}

      <TweaksPanel t={t} setTweak={setTweak} />
    </>
  );
}
