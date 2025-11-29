import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number;
  min_stock: number | null;
  category: string;
  unit: string;
  barcode: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  internal_notes: string | null;
}

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  cost?: number | null;
  stock: number;
  min_stock?: number | null;
  category: string;
  unit: string;
  barcode?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  internal_notes?: string | null;
}

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export async function getProducts(companyId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  return data as Product[];
}

export async function createProduct(companyId: string, product: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, company_id: companyId })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  return data as Product;
}

export async function updateProduct(productId: string, product: Partial<ProductInput>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...product, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  return data as Product;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}