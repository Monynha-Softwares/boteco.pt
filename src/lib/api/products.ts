/**
 * Supabase API - Products
 * 
 * This module provides functions to interact with the products table.
 */

import { supabase, handleSupabaseError } from '../supabase';
import type { Database } from '../../types/database';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

/**
 * Get all products for a company
 * 
 * @param companyId - The company ID to filter by
 * @param activeOnly - Whether to return only active products (default: true)
 * @returns Promise resolving to array of products
 */
export const getProducts = async (
  companyId: string,
  activeOnly = true
): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .order('name');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getProducts');
  }
};

/**
 * Get a single product by ID
 * 
 * @param productId - The product ID
 * @param companyId - The company ID to verify ownership
 * @returns Promise resolving to the product or null
 */
export const getProduct = async (
  productId: string,
  companyId: string
): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('company_id', companyId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getProduct');
  }
};

/**
 * Get low stock products for a company
 * 
 * @param companyId - The company ID to filter by
 * @returns Promise resolving to array of low stock products
 */
export const getLowStockProducts = async (
  companyId: string
): Promise<Product[]> => {
  try {
    // First get all active products
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (error) throw error;
    
    // Filter where stock < min_stock
    const lowStockProducts = (allProducts || [])
      .filter(product => product.stock < product.min_stock)
      .sort((a, b) => a.stock - b.stock);
    
    return lowStockProducts;
  } catch (error) {
    handleSupabaseError(error, 'getLowStockProducts');
  }
};

/**
 * Create a new product
 * 
 * @param product - The product data to insert
 * @returns Promise resolving to the created product
 */
export const createProduct = async (
  product: ProductInsert
): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'createProduct');
  }
};

/**
 * Update a product
 * 
 * @param productId - The product ID to update
 * @param companyId - The company ID to verify ownership
 * @param updates - The product data to update
 * @returns Promise resolving to the updated product
 */
export const updateProduct = async (
  productId: string,
  companyId: string,
  updates: ProductUpdate
): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'updateProduct');
  }
};

/**
 * Delete a product (soft delete by setting is_active to false)
 * 
 * @param productId - The product ID to delete
 * @param companyId - The company ID to verify ownership
 * @returns Promise resolving to the deleted product
 */
export const deleteProduct = async (
  productId: string,
  companyId: string
): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'deleteProduct');
  }
};

/**
 * Get products by category
 * 
 * @param companyId - The company ID to filter by
 * @param category - The category to filter by
 * @returns Promise resolving to array of products
 */
export const getProductsByCategory = async (
  companyId: string,
  category: Product['category']
): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getProductsByCategory');
  }
};
