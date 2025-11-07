/**
 * Supabase API - Tables
 *
 * Provides functions to interact with the tables (restaurant floor tables) data.
 */
import { supabase, handleSupabaseError } from '../supabase';
import type { Database } from '../../types/database';
import { computeOccupancy } from './tables.utils';

// Table row type
export type Table = Database['public']['Tables']['tables']['Row'];
export type TableInsert = Database['public']['Tables']['tables']['Insert'];
export type TableUpdate = Database['public']['Tables']['tables']['Update'];

/**
 * Pure helper to compute occupancy metrics from an array of tables.
 * Exported for unit testing.
 */
export { computeOccupancy };

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
    return computeOccupancy(data || []);
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

/** Create a new table */
export const createTable = async (payload: TableInsert): Promise<Table> => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'createTable');
  }
};

/** Update arbitrary table fields (excluding status convenience) */
export const updateTable = async (
  tableId: string,
  companyId: string,
  patch: Partial<TableUpdate>
): Promise<Table> => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', tableId)
      .eq('company_id', companyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'updateTable');
  }
};

/** Get single table */
export const getTableById = async (
  tableId: string,
  companyId: string
): Promise<Table | null> => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .eq('company_id', companyId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getTableById');
  }
};

/** Check if a table number is available for the company */
export const checkTableNumberAvailable = async (
  companyId: string,
  number: number,
  excludeId?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('tables')
      .select('id')
      .eq('company_id', companyId)
      .eq('number', number);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length === 0;
  } catch (error) {
    handleSupabaseError(error, 'checkTableNumberAvailable');
  }
};

/** Delete table (hard delete). Caller should have ensured no active order linkage. */
export const deleteTable = async (
  tableId: string,
  companyId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', tableId)
      .eq('company_id', companyId);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'deleteTable');
  }
};
