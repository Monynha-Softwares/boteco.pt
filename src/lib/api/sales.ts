/**
 * Supabase API - Sales
 * 
 * This module provides functions to interact with the sales table.
 */

import { supabase, handleSupabaseError } from '../supabase';
import type { Database } from '../../types/database';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleInsert = Database['public']['Tables']['sales']['Insert'];

/**
 * Get sales for a company within a date range
 * 
 * @param companyId - The company ID to filter by
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Promise resolving to array of sales
 */
export const getSales = async (
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<Sale[]> => {
  try {
    let query = supabase
      .from('sales')
      .select('*')
      .eq('company_id', companyId)
      .order('sale_date', { ascending: false });

    if (startDate) {
      query = query.gte('sale_date', startDate);
    }

    if (endDate) {
      query = query.lte('sale_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getSales');
  }
};

/**
 * Get today's sales total
 * 
 * @param companyId - The company ID to filter by
 * @returns Promise resolving to today's total sales
 */
export const getTodaysSalesTotal = async (
  companyId: string
): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.toISOString();

    const { data, error } = await supabase
      .from('sales')
      .select('total')
      .eq('company_id', companyId)
      .gte('sale_date', startOfToday);

    if (error) throw error;

    const total = data?.reduce((sum, sale) => sum + sale.total, 0) || 0;
    return total;
  } catch (error) {
    handleSupabaseError(error, 'getTodaysSalesTotal');
  }
};

/**
 * Get sales total for a period
 * 
 * @param companyId - The company ID to filter by
 * @param days - Number of days to go back (default: 30)
 * @returns Promise resolving to period's total sales
 */
export const getPeriodSalesTotal = async (
  companyId: string,
  days = 30
): Promise<number> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('sales')
      .select('total')
      .eq('company_id', companyId)
      .gte('sale_date', startDate.toISOString());

    if (error) throw error;

    const total = data?.reduce((sum, sale) => sum + sale.total, 0) || 0;
    return total;
  } catch (error) {
    handleSupabaseError(error, 'getPeriodSalesTotal');
  }
};

/**
 * Create a new sale
 * 
 * @param sale - The sale data to insert
 * @returns Promise resolving to the created sale
 */
export const createSale = async (
  sale: SaleInsert
): Promise<Sale> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .insert(sale)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'createSale');
  }
};

/**
 * Get sales by payment method
 * 
 * @param companyId - The company ID to filter by
 * @param startDate - Optional start date
 * @param endDate - Optional end date
 * @returns Promise resolving to sales grouped by payment method
 */
export const getSalesByPaymentMethod = async (
  companyId: string,
  startDate?: string,
  endDate?: string
): Promise<Record<string, number>> => {
  try {
    let query = supabase
      .from('sales')
      .select('payment_method, total')
      .eq('company_id', companyId);

    if (startDate) {
      query = query.gte('sale_date', startDate);
    }

    if (endDate) {
      query = query.lte('sale_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const byMethod: Record<string, number> = {};
    data?.forEach((sale) => {
      const method = sale.payment_method;
      byMethod[method] = (byMethod[method] || 0) + sale.total;
    });

    return byMethod;
  } catch (error) {
    handleSupabaseError(error, 'getSalesByPaymentMethod');
  }
};
