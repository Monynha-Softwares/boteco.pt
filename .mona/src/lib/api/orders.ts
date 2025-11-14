/**
 * Supabase API - Orders
 * 
 * This module provides functions to interact with the orders table.
 */

import { supabase, handleSupabaseError } from '../supabase';
import type { Database } from '../../types/database';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

/**
 * Get all orders for a company
 * 
 * @param companyId - The company ID to filter by
 * @param status - Optional status filter
 * @returns Promise resolving to array of orders
 */
export const getOrders = async (
  companyId: string,
  status?: Order['status']
): Promise<Order[]> => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getOrders');
  }
};

/**
 * Get active orders (open or in_progress)
 * 
 * @param companyId - The company ID to filter by
 * @returns Promise resolving to array of active orders
 */
export const getActiveOrders = async (
  companyId: string
): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('company_id', companyId)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getActiveOrders');
  }
};

/**
 * Get a single order by ID
 * 
 * @param orderId - The order ID
 * @param companyId - The company ID to verify ownership
 * @returns Promise resolving to the order or null
 */
export const getOrder = async (
  orderId: string,
  companyId: string
): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('company_id', companyId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getOrder');
  }
};

/**
 * Create a new order
 * 
 * @param order - The order data to insert
 * @returns Promise resolving to the created order
 */
export const createOrder = async (
  order: OrderInsert
): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'createOrder');
  }
};

/**
 * Update an order
 * 
 * @param orderId - The order ID to update
 * @param companyId - The company ID to verify ownership
 * @param updates - The order data to update
 * @returns Promise resolving to the updated order
 */
export const updateOrder = async (
  orderId: string,
  companyId: string,
  updates: OrderUpdate
): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'updateOrder');
  }
};

/**
 * Get orders count by status
 * 
 * @param companyId - The company ID to filter by
 * @returns Promise resolving to counts by status
 */
export const getOrdersCountByStatus = async (
  companyId: string
): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('company_id', companyId);

    if (error) throw error;

    const counts: Record<string, number> = {};
    data?.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts;
  } catch (error) {
    handleSupabaseError(error, 'getOrdersCountByStatus');
  }
};
