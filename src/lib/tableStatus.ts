// Canonical table status ordering used for mobile ↔ web mapping
export const TABLE_STATUS_ORDER = [
  'available',
  'occupied',
  'reserved',
  'maintenance',
] as const;

export type TableStatus = typeof TABLE_STATUS_ORDER[number];

/**
 * Return the index of a given status within the canonical order.
 * Unknown inputs return -1.
 */
export function statusIndex(status: string): number {
  return TABLE_STATUS_ORDER.indexOf(status as TableStatus);
}

/**
 * Return the status string for a given index. Unknown indices fallback to 'available'.
 */
export function statusFromIndex(index: number): TableStatus {
  return TABLE_STATUS_ORDER[index] ?? 'available';
}

/**
 * Returns a display name for a table, preferring `name` and falling back to `Mesa {number}`.
 */
export function getTableDisplayName(table: { name?: string | null; number?: number | null }): string {
  if (table?.name && table.name.trim().length > 0) return table.name;
  const n = table?.number ?? undefined;
  return typeof n === 'number' ? `Mesa ${n}` : 'Mesa';
}
