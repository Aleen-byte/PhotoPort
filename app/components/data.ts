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

export const CATEGORIES = [
  { id: 'photo', label: 'Fotos', count: 0 },
  { id: 'video', label: 'Vídeos', count: 0 },
  { id: 'event', label: 'Eventos', count: 0 },
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

export const HOME_FEATURES: { id: string; title: string; kicker: string; img: string; year: string; tag: string }[] = [];

export const PHOTOS: Photo[] = [];

export const VIDEOS: Video[] = [];

export const EVENTS: Event[] = [];

export const EVENT_PHOTOS: Record<string, EventPhoto[]> = {};

export const ADMIN_FOLDERS: AdminFolder[] = [];

export const ADMIN_RECENT_SALES: AdminSale[] = [];

export const ADMIN_TOP_PHOTOS: AdminTopPhoto[] = [];

export const ADMIN_CUSTOMERS: AdminCustomer[] = [];

export const ADMIN_COMMENTS: AdminComment[] = [];
