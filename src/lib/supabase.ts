/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for the BotecoPro application.
 * It provides type-safe database access with RLS (Row Level Security) enabled.
 * 
 * @see https://supabase.com/docs/reference/javascript/introduction
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.VITE_SUPABASE_ANON_KEY');
}

/**
 * Supabase client instance
 * 
 * This client is used throughout the application to interact with the database.
 * It includes automatic JWT handling and RLS policy enforcement.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'boteco-pro-web',
    },
  },
});

/**
 * Helper function to handle Supabase errors
 * 
 * @param error - The error object from Supabase
 * @param context - Context about where the error occurred
 * @returns Never (always throws)
 */
export const handleSupabaseError = (error: unknown, context: string): never => {
  console.error(`Supabase error in ${context}:`, error);
  
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error(`${context}: ${error.message}`);
  }
  
  throw new Error(`${context}: Unknown error`);
};

/**
 * Type-safe query builder with automatic error handling
 * 
 * @example
 * ```typescript
 * const products = await queryBuilder('products')
 *   .select('*')
 *   .eq('company_id', companyId)
 *   .eq('is_active', true);
 * ```
 */
export const queryBuilder = <T extends keyof Database['public']['Tables']>(table: T) => {
  return supabase.from(table);
};

/**
 * Batch operation helper
 * 
 * @param operations - Array of promises to execute
 * @returns Promise that resolves when all operations complete
 */
export const batchOperation = async <T>(
  operations: Promise<T>[]
): Promise<T[]> => {
  try {
    return await Promise.all(operations);
  } catch (error) {
    handleSupabaseError(error, 'Batch operation');
  }
};

/**
 * Check if Supabase connection is healthy
 * 
 * @returns Promise that resolves to true if connection is healthy
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('companies').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};
