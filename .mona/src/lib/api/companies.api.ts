/** Supabase Companies API (clean) */
import { supabase, handleSupabaseError } from '../supabase';
import type { Database } from '../../types/database';

type Company = Database['public']['Tables']['companies']['Row'];
export type { Company };

export const getUserCompanies = async (userId: string): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select('companies(*)')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) throw error;
    return (data as unknown as Array<{ companies: Company | null }> )
      .map(c => c.companies)
      .filter((c): c is Company => !!c);
  } catch (error) {
    handleSupabaseError(error, 'getUserCompanies');
  }
};
