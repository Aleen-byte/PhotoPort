export interface Database {
  public: {
    Tables: {
      folders: {
        Row: FolderRow;
        Insert: FolderInsert;
        Update: Partial<FolderInsert>;
      };
      photos: {
        Row: PhotoRow;
        Insert: PhotoInsert;
        Update: Partial<PhotoInsert>;
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
      };
      settings: {
        Row: SettingRow;
        Insert: SettingRow;
        Update: Partial<SettingRow>;
      };
    };
  };
}

export interface FolderRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: 'sale' | 'portfolio';
  locked: boolean;
  password_hash: string | null;
  cover_url: string | null;
  cover_path: string | null;
  date: string | null;
  location: string | null;
  price_per_photo: number | null;
  photo_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type FolderInsert = Omit<FolderRow, 'id' | 'created_at' | 'updated_at' | 'photo_count'> & {
  photo_count?: number;
};

export interface PhotoRow {
  id: string;
  folder_id: string;
  title: string | null;
  filename: string;
  original_path: string;
  watermarked_path: string;
  watermarked_url: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  price: number | null;
  sort_order: number;
  published: boolean;
  has_watermark: boolean;
  media_type: 'photo' | 'video';
  aspect_ratio: string;
  created_at: string;
}

export type PhotoInsert = Omit<PhotoRow, 'id' | 'created_at'>;

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string;
  total: number;
  payment_method: 'pix' | 'card' | 'boleto' | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
}

export type OrderInsert = Omit<OrderRow, 'id' | 'created_at'>;

export interface OrderItemRow {
  id: string;
  order_id: string;
  photo_id: string | null;
  folder_id: string | null;
  price: number;
  download_url: string | null;
  downloaded: boolean;
  created_at: string;
}

export type OrderItemInsert = Omit<OrderItemRow, 'id' | 'created_at'>;

export interface SettingRow {
  key: string;
  value: string | null;
  updated_at: string;
}
