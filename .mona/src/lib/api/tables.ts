/**
 * Supabase API - Tables
 *
 * Provides functions to interact with the tables (restaurant floor tables) data.
 */
import { supabase, handleSupabaseError } from '../supabase';
import type { Database } from '../../types/database';

// Table row type
export type Table = Database['public']['Tables']['tables']['Row'];
export type TableInsert = Database['public']['Tables']['tables']['Insert'];
export type TableUpdate = Database['public']['Tables']['tables']['Update'];

/**
 * Get all tables for a company (optionally filter by active status)
 */
export const getTables = async (
  companyId: string,
  includeMaintenance = false
): Promise<Table[]> => {
  try {
    let query = supabase
      .from('tables')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (!includeMaintenance) {
      query = query.not('status', 'eq', 'maintenance');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getTables');
  }
};

/**
 * Compute occupancy metrics for a company's tables.
 * Occupancy rate = occupied / (total - maintenance)
 */
export const getTableOccupancyMetrics = async (
  companyId: string
): Promise<{ occupied: number; total: number; occupancyRate: number }> => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .select('status')
      .eq('company_id', companyId);
    if (error) throw error;

    const all = data || [];
    const maintenance = all.filter(t => t.status === 'maintenance').length;
    const occupied = all.filter(t => t.status === 'occupied').length;
    const effectiveTotal = all.length - maintenance;
    const occupancyRate = effectiveTotal > 0 ? occupied / effectiveTotal : 0;

    return { occupied, total: effectiveTotal, occupancyRate };
  } catch (error) {
    handleSupabaseError(error, 'getTableOccupancyMetrics');
  }
};

/**
 * Update a table's status
 */
export const updateTableStatus = async (
  tableId: string,
  companyId: string,
  status: Table['status']
): Promise<Table> => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', tableId)
      .eq('company_id', companyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'updateTableStatus');
  }
};
