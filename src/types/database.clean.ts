// This file was a temporary compatibility shim while the canonical
// `src/types/database.ts` was being generated. Keep a small re-export so
// older imports continue to work until callers are fully migrated.
import type { Database, Json } from './database';

export type { Json };

export type ReservationRow = Database['public']['Tables']['reservations']['Row'];
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update'];
