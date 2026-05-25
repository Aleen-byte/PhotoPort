// data.ts — Portfolio data and types

export interface Photo {
  id: string;
  title: string;
  series: string;
  year: number;
  img: string;
  ratio: string;
  price?: number;
}

export interface Video {
  id: string;
  title: string;
  series: string;
  duration: string;
  year: number;
  img: string;
  ratio: string;
}

export interface Event {
  id: string;
  title: string;
  sub: string;
  date: string;
  location: string;
  cover: string;
  kind: 'sale' | 'portfolio';
  locked: boolean;
  count: number;
  bag?: string;
  pricePerPhoto?: number;
}

export interface EventPhoto {
  id: string;
  img: string;
  price?: number;
  title: string;
}

export interface CartItem {
  id: string;
  img: string;
  price: number;
  title: string;
  eventTitle: string;
  eventId: string;
}

export interface AdminFolder {
  id: string;
  name: string;
  kind: 'sale' | 'portfolio';
  count: number;
  locked: boolean;
  thumb: string;
}

export interface AdminSale {
  id: string;
  who: string;
  event: string;
  items: number;
  total: number;
  when: string;
}

export interface AdminTopPhoto {
  id: string;
  img: string;
  views: number;
  sold: number;
  event: string;
}

export interface AdminCustomer {
  name: string;
  email: string;
  events: number;
  spent: number;
}

export interface AdminComment {
  id: number;
  who: string;
  when: string;
  on: string;
  txt: string;
}

const pic = (id: string, w = 1200, h = 1500) => `https://picsum.photos/seed/${id}/${w}/${h}`;
const picW = (id: string, w = 1800, h = 1200) => `https://picsum.photos/seed/${id}/${w}/${h}`;

export const CATEGORIES = [
  { id: 'photo', label: 'Fotos', count: 184 },
  { id: 'video', label: 'Vídeos', count: 36 },
  { id: 'event', label: 'Eventos', count: 22 },
];

export const SPECIALTIES = [
  'Ensaios & Retratos',
  'Eventos Corporativos',
  'Shows & Música',
  'Esportes',
  'Comerciais & Produto',
  'Documental',
  'Conteúdo Social',
];

export const HOME_FEATURES = [
  { id: 'noite-azul', title: 'Noite Azul', kicker: '01 — Documental', img: picW('aleen-feature-01', 1800, 1100), year: '2026', tag: 'São Paulo' },
  { id: 'maria-julia', title: 'Maria Júlia', kicker: '02 — Ensaio editorial', img: picW('aleen-feature-02', 1800, 1100), year: '2026', tag: 'Estúdio' },
  { id: 'kombi-tour', title: 'Kombi Tour', kicker: '03 — Show & Bastidores', img: picW('aleen-feature-03', 1800, 1100), year: '2025', tag: 'Documental' },
];

const orientations = [
  { ratio: '3/4', w: 1200, h: 1600 },
  { ratio: '4/3', w: 1600, h: 1200 },
  { ratio: '1/1', w: 1400, h: 1400 },
  { ratio: '3/4', w: 1200, h: 1600 },
];

export const PHOTOS: Photo[] = Array.from({ length: 24 }, (_, i) => {
  const o = orientations[i % orientations.length];
  const titles = ['Aurora', 'Silêncio', 'Pulso', 'Hora Azul', 'Travessia', 'Contraluz', 'Bastidor', 'Eco', 'Marés', 'Aresta', 'Hiato', 'Vértice'];
  return {
    id: `p-${i + 1}`,
    title: titles[i % 12] + (i >= 12 ? ' II' : ''),
    series: ['Documental', 'Editorial', 'Show', 'Retrato', 'Comercial', 'Esporte'][i % 6],
    year: 2025 + (i % 2),
    img: pic(`aleen-p-${i + 1}`, o.w, o.h),
    ratio: o.ratio,
    price: [80, 120, 180, 240][i % 4],
  };
});

export const VIDEOS: Video[] = Array.from({ length: 9 }, (_, i) => ({
  id: `v-${i + 1}`,
  title: ['Travessia', 'Kombi Tour', 'Ritmo', 'Mar', 'Faísca', 'Noturno', 'Loop', 'Ofício', 'Em Trânsito'][i],
  series: ['Documental', 'Music Video', 'Brand Film', 'Trailer', 'Reel'][i % 5],
  duration: ['01:24', '03:42', '00:58', '02:18', '04:30', '01:12', '02:46', '03:08', '01:50'][i],
  year: 2025 + (i % 2),
  img: picW(`aleen-v-${i + 1}`, 1600, 900),
  ratio: '16/9',
}));

export const EVENTS: Event[] = [
  {
    id: 'casamento-helena-rafael',
    title: 'Helena & Rafael',
    sub: 'Casamento — Fazenda Capivari',
    date: '14 Mai 2026',
    location: 'Itu, SP',
    cover: picW('event-helena', 2000, 1200),
    kind: 'sale',
    locked: true,
    count: 482,
    bag: 'R$ 80 / foto',
    pricePerPhoto: 80,
  },
  {
    id: 'show-mahmundi',
    title: 'Mahmundi ao vivo',
    sub: 'Show — Casa Natura',
    date: '02 Mai 2026',
    location: 'São Paulo, SP',
    cover: picW('event-mahmundi', 2000, 1200),
    kind: 'sale',
    locked: false,
    count: 214,
    pricePerPhoto: 60,
  },
  {
    id: 'corrida-anhangabau',
    title: 'Meia do Anhangabaú',
    sub: 'Esporte — Corrida 21km',
    date: '20 Abr 2026',
    location: 'São Paulo, SP',
    cover: picW('event-corrida', 2000, 1200),
    kind: 'sale',
    locked: false,
    count: 1840,
    pricePerPhoto: 25,
  },
  {
    id: 'ensaio-camila',
    title: 'Camila Verão',
    sub: 'Ensaio editorial',
    date: '12 Abr 2026',
    location: 'Estúdio Aleen',
    cover: picW('event-camila', 2000, 1200),
    kind: 'portfolio',
    locked: false,
    count: 38,
  },
  {
    id: 'nubank-offsite',
    title: 'Nubank Offsite',
    sub: 'Corporativo — Documentação interna',
    date: '28 Mar 2026',
    location: 'Campos do Jordão, SP',
    cover: picW('event-nubank', 2000, 1200),
    kind: 'portfolio',
    locked: true,
    count: 312,
  },
  {
    id: 'lab-coracao',
    title: 'Lab Coração',
    sub: 'Comercial — Linha de inverno',
    date: '15 Mar 2026',
    location: 'São Paulo, SP',
    cover: picW('event-lab', 2000, 1200),
    kind: 'portfolio',
    locked: false,
    count: 64,
  },
];

export const EVENT_PHOTOS: Record<string, EventPhoto[]> = {
  'casamento-helena-rafael': Array.from({ length: 16 }, (_, i) => ({
    id: `helena-${i + 1}`,
    img: pic(`helena-${i + 1}`, 1200, 1500),
    price: 80,
    title: `HR-${String(i + 1).padStart(3, '0')}`,
  })),
  'show-mahmundi': Array.from({ length: 12 }, (_, i) => ({
    id: `mahmundi-${i + 1}`,
    img: pic(`mahmundi-${i + 1}`, 1200, 1500),
    price: 60,
    title: `MM-${String(i + 1).padStart(3, '0')}`,
  })),
  'corrida-anhangabau': Array.from({ length: 12 }, (_, i) => ({
    id: `corrida-${i + 1}`,
    img: pic(`corrida-${i + 1}`, 1200, 1500),
    price: 25,
    title: `MA-${String(i + 1).padStart(3, '0')}`,
  })),
  'ensaio-camila': Array.from({ length: 8 }, (_, i) => ({
    id: `camila-${i + 1}`,
    img: pic(`camila-${i + 1}`, 1200, 1500),
    title: `CA-${String(i + 1).padStart(3, '0')}`,
  })),
};

export const ADMIN_FOLDERS: AdminFolder[] = [
  { id: 'casamento-helena-rafael', name: 'Helena & Rafael', kind: 'sale', count: 482, locked: true, thumb: picW('event-helena', 800, 600) },
  { id: 'show-mahmundi', name: 'Mahmundi', kind: 'sale', count: 214, locked: false, thumb: picW('event-mahmundi', 800, 600) },
  { id: 'corrida-anhangabau', name: 'Meia do Anhangabaú', kind: 'sale', count: 1840, locked: false, thumb: picW('event-corrida', 800, 600) },
  { id: 'ensaio-camila', name: 'Camila Verão', kind: 'portfolio', count: 38, locked: false, thumb: picW('event-camila', 800, 600) },
  { id: 'nubank-offsite', name: 'Nubank Offsite', kind: 'portfolio', count: 312, locked: true, thumb: picW('event-nubank', 800, 600) },
  { id: 'lab-coracao', name: 'Lab Coração', kind: 'portfolio', count: 64, locked: false, thumb: picW('event-lab', 800, 600) },
  { id: 'noite-azul', name: 'Noite Azul', kind: 'portfolio', count: 88, locked: false, thumb: picW('aleen-feature-01', 800, 600) },
  { id: 'kombi-tour', name: 'Kombi Tour', kind: 'portfolio', count: 124, locked: false, thumb: picW('aleen-feature-03', 800, 600) },
];

export const ADMIN_RECENT_SALES: AdminSale[] = [
  { id: '#A-2241', who: 'mariana.s@gmail.com', event: 'Helena & Rafael', items: 6, total: 480, when: 'há 12 min' },
  { id: '#A-2240', who: 'pedro.lima@outlook.com', event: 'Meia do Anhangabaú', items: 2, total: 50, when: 'há 38 min' },
  { id: '#A-2239', who: 'ana@studiofilo.com', event: 'Mahmundi ao vivo', items: 9, total: 540, when: 'há 1h' },
  { id: '#A-2238', who: 'lucas.viana@gmail.com', event: 'Helena & Rafael', items: 14, total: 1120, when: 'há 3h' },
  { id: '#A-2237', who: 'gabriela.r@gmail.com', event: 'Meia do Anhangabaú', items: 4, total: 100, when: 'ontem' },
];

export const ADMIN_TOP_PHOTOS: AdminTopPhoto[] = [
  { id: 'helena-12', img: pic('helena-12', 200, 250), views: 1284, sold: 14, event: 'Helena & Rafael' },
  { id: 'corrida-3', img: pic('corrida-3', 200, 250), views: 1102, sold: 8, event: 'Meia do Anhangabaú' },
  { id: 'mahmundi-4', img: pic('mahmundi-4', 200, 250), views: 968, sold: 11, event: 'Mahmundi' },
  { id: 'helena-7', img: pic('helena-7', 200, 250), views: 842, sold: 6, event: 'Helena & Rafael' },
];

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  { name: 'Mariana Souza', email: 'mariana.s@gmail.com', events: 2, spent: 1280 },
  { name: 'Pedro Lima', email: 'pedro.lima@outlook.com', events: 1, spent: 230 },
  { name: 'Ana Filó', email: 'ana@studiofilo.com', events: 4, spent: 3420 },
  { name: 'Lucas Viana', email: 'lucas.viana@gmail.com', events: 1, spent: 1120 },
  { name: 'Gabriela R.', email: 'gabriela.r@gmail.com', events: 3, spent: 720 },
];

export const ADMIN_COMMENTS: AdminComment[] = [
  { id: 1, who: 'Mariana Souza', when: 'há 8 min', on: 'Helena & Rafael', txt: 'As cores da hora dourada ficaram absurdas. Já estou guardando algumas pra moldurar.' },
  { id: 2, who: 'Pedro Lima', when: 'há 1h', on: 'Meia do Anhangabaú', txt: 'Achei minha foto chegando! Comprei. Você captou exatamente o instante.' },
  { id: 3, who: 'Studio Filó', when: 'ontem', on: 'Mahmundi ao vivo', txt: 'Trabalho impecável. Vamos te chamar para o próximo lançamento, com certeza.' },
];
