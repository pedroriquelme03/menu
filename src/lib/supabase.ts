import { createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

const supabaseUrl = environment.supabase.url;
const supabaseAnonKey = environment.supabase.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          created_at: string;
        };
        Insert: {
          id?: string;
          number: number;
          token: string;
          capacity: number;
          is_occupied?: boolean;
          session_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: number;
          token?: string;
          capacity?: number;
          is_occupied?: boolean;
          session_id?: string;
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
          image_url?: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url?: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
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
