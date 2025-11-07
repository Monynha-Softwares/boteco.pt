// Reservations API wrapper — typed against the project's Database type.
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ReservationRow = Database['public']['Tables']['reservations']['Row'];
type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];
type ReservationUpdate = Database['public']['Tables']['reservations']['Update'];

/**
 * Reservations API wrapper
 * Provides typed CRUD operations for the `reservations` table.
 */
export const getReservations = async (
  companyId: string,
  opts?: { from?: string; to?: string; status?: string; limit?: number }
): Promise<ReservationRow[]> => {
  try {
    let q = supabase
      .from('reservations')
      .select('*')
      .eq('company_id', companyId)
      .order('reservation_date', { ascending: true });

    if (opts?.from) q = q.gte('reservation_date', opts.from);
    if (opts?.to) q = q.lte('reservation_date', opts.to);
    if (opts?.status) q = q.eq('status', opts.status);
    if (opts?.limit) q = q.limit(opts.limit);

    const { data, error } = await q;
    if (error) handleSupabaseError(error, 'getReservations');
    return (data ?? []) as ReservationRow[];
  } catch (error) {
    handleSupabaseError(error, 'getReservations');
  }
};

export const getReservationById = async (id: string): Promise<ReservationRow | null> => {
  try {
    const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single();
    if (error) handleSupabaseError(error, 'getReservationById');
    return (data ?? null) as ReservationRow | null;
  } catch (error) {
    handleSupabaseError(error, 'getReservationById');
  }
};

export const createReservation = async (payload: ReservationInsert): Promise<ReservationRow> => {
  try {
    const { data, error } = await supabase.from('reservations').insert(payload).select().single();
    if (error) handleSupabaseError(error, 'createReservation');
    return data as ReservationRow;
  } catch (error) {
    handleSupabaseError(error, 'createReservation');
  }
};

export const updateReservation = async (id: string, changes: ReservationUpdate): Promise<ReservationRow> => {
  try {
    const { data, error } = await supabase.from('reservations').update(changes).eq('id', id).select().single();
    if (error) handleSupabaseError(error, 'updateReservation');
    return data as ReservationRow;
  } catch (error) {
    handleSupabaseError(error, 'updateReservation');
  }
};

export const deleteReservation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteReservation');
  } catch (error) {
    handleSupabaseError(error, 'deleteReservation');
  }
};

export default {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
};
