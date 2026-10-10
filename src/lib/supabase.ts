import { createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || environment.supabase.url || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || environment.supabase.anonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
}

// Evita crash de tela branca se as envs estiverem ausentes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Tipos para as tabelas do Supabase
export interface Database {
  public: {
    Tables: {
      tables: {
        Row: {
          id: string;
          number: number;
          token: string;
          capacity: number;
          is_occupied: boolean;
          session_id?: string;
          praca?: string;
          pos_x?: number | null;
          pos_y?: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          number: number;
          token: string;
          capacity: number;
          is_occupied?: boolean;
          session_id?: string;
          praca?: string;
          pos_x?: number | null;
          pos_y?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: number;
          token?: string;
          capacity?: number;
          is_occupied?: boolean;
          session_id?: string;
          praca?: string;
          pos_x?: number | null;
          pos_y?: number | null;
          created_at?: string;
        };
      };
      seats: {
        Row: {
          id: string;
          table_id: string;
          seat_number?: number;
          guest_name?: string;
          device_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          seat_number?: number;
          guest_name?: string;
          device_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          table_id?: string;
          seat_number?: number;
          guest_name?: string;
          device_id?: string;
          joined_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          station?: 'kitchen' | 'cambuza';
          image_url?: string;
          video_url?: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          category: string;
          station?: 'kitchen' | 'cambuza';
          image_url?: string;
          video_url?: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          station?: 'kitchen' | 'cambuza';
          image_url?: string;
          video_url?: string;
          is_available?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          table_id: string;
          seat_id: string;
          items: any; // JSON
          subtotal: number;
          status: string;
          created_at: string;
          updated_at: string;
          notes?: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          seat_id: string;
          items: any; // JSON
          subtotal: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string;
        };
        Update: {
          id?: string;
          table_id?: string;
          seat_id?: string;
          items?: any; // JSON
          subtotal?: number;
          status?: string;
          updated_at?: string;
          notes?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          table_id: string;
          seat_id?: string;
          amount: number;
          method: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          seat_id?: string;
          amount: number;
          method: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_id?: string;
          seat_id?: string;
          amount?: number;
          method?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}
