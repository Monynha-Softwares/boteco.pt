/**
 * Supabase Database Types
 * 
 * Auto-generated types from Supabase schema.
 * 
 * To regenerate these types, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 * 
 * Or use the Supabase CLI:
 * supabase gen types typescript --linked > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          cnpj: string | null
          owner_id: string
          plan_type: 'free' | 'basic' | 'premium'
          realtime_enabled: boolean
          is_active: boolean
          contact_email: string | null
          contact_phone: string | null
          address_street: string | null
          address_number: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          cnpj?: string | null
          owner_id: string
          plan_type?: 'free' | 'basic' | 'premium'
          realtime_enabled?: boolean
          is_active?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          address_street?: string | null
          address_number?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          cnpj?: string | null
          owner_id?: string
          plan_type?: 'free' | 'basic' | 'premium'
          realtime_enabled?: boolean
          is_active?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          address_street?: string | null
          address_number?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          price: number
          cost: number | null
          stock: number
          min_stock: number
          category: 'drink' | 'food' | 'ingredient' | 'other'
          unit: 'un' | 'kg' | 'l' | 'ml' | 'g'
          barcode: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          price: number
          cost?: number | null
          stock?: number
          min_stock?: number
          category?: 'drink' | 'food' | 'ingredient' | 'other'
          unit?: 'un' | 'kg' | 'l' | 'ml' | 'g'
          barcode?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          price?: number
          cost?: number | null
          stock?: number
          min_stock?: number
          category?: 'drink' | 'food' | 'ingredient' | 'other'
          unit?: 'un' | 'kg' | 'l' | 'ml' | 'g'
          barcode?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          company_id: string
          number: number
          capacity: number
          status: 'available' | 'occupied' | 'reserved' | 'maintenance'
          current_order_id: string | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          number: number
          capacity?: number
          status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
          current_order_id?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          number?: number
          capacity?: number
          status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
          current_order_id?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          company_id: string
          table_id: string | null
          customer_name: string | null
          status: 'open' | 'in_progress' | 'ready' | 'closed' | 'cancelled'
          total: number
          subtotal: number
          discount: number
          tax: number
          payment_method: 'cash' | 'credit' | 'debit' | 'pix' | 'other' | null
          payment_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          table_id?: string | null
          customer_name?: string | null
          status?: 'open' | 'in_progress' | 'ready' | 'closed' | 'cancelled'
          total?: number
          subtotal?: number
          discount?: number
          tax?: number
          payment_method?: 'cash' | 'credit' | 'debit' | 'pix' | 'other' | null
          payment_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          table_id?: string | null
          customer_name?: string | null
          status?: 'open' | 'in_progress' | 'ready' | 'closed' | 'cancelled'
          total?: number
          subtotal?: number
          discount?: number
          tax?: number
          payment_method?: 'cash' | 'credit' | 'debit' | 'pix' | 'other' | null
          payment_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          notes: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          notes?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          notes?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          company_id: string
          order_id: string
          total: number
          subtotal: number
          discount: number
          tax: number
          payment_method: string
          sale_date: string
          cashier_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          order_id: string
          total: number
          subtotal: number
          discount?: number
          tax?: number
          payment_method: string
          sale_date?: string
          cashier_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          order_id?: string
          total?: number
          subtotal?: number
          discount?: number
          tax?: number
          payment_method?: string
          sale_date?: string
          cashier_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          company_id: string
          name: string
          contact: string | null
          phone: string | null
          email: string | null
          cnpj: string | null
          address_street: string | null
          address_number: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          contact?: string | null
          phone?: string | null
          email?: string | null
          cnpj?: string | null
          address_street?: string | null
          address_number?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          contact?: string | null
          phone?: string | null
          email?: string | null
          cnpj?: string | null
          address_street?: string | null
          address_number?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
      [key: string]: {
        Row: Record<string, Json>
        Insert: Record<string, Json>
        Update: Record<string, Json>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
