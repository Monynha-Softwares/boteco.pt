/**
 * Reservation-specific TypeScript types.
 * Kept small and explicit to avoid coupling to the full generated `database.ts` shape.
 */
export interface ReservationRow {
  id: string;
  company_id: string;
  table_id?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  party_size: number;
  reservation_date: string; // ISO timestamptz
  status: 'pending' | 'confirmed' | 'arrived' | 'cancelled' | 'no_show' | string;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ReservationInsert = Omit<ReservationRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ReservationUpdate = Partial<ReservationInsert>;

export default ReservationRow;
