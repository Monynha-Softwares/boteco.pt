import type { Database } from '@/types/database';

// Minimal type referencing only the status field to keep this module supabase-free
export type TableStatus = Database['public']['Tables']['tables']['Row']['status'];

/**
 * Pure helper to compute occupancy metrics from an array of tables.
 * Zero side effects, safe to run in Node tests.
 */
export const computeOccupancy = (tables: Array<{ status: TableStatus }>) => {
  const maintenance = tables.filter(t => t.status === 'maintenance').length;
  const occupied = tables.filter(t => t.status === 'occupied').length;
  const effectiveTotal = tables.length - maintenance;
  const occupancyRate = effectiveTotal > 0 ? occupied / effectiveTotal : 0;
  return { occupied, total: effectiveTotal, occupancyRate };
};

export default computeOccupancy;
