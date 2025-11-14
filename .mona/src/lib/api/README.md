# Supabase API Layer

This directory contains modular API helpers that communicate with Supabase using the singleton client in `../supabase.ts`.

## Modules

- `products.ts` – Product CRUD + low stock filtering
- `orders.ts` – Order CRUD + active orders helpers
- `sales.ts` – Sales aggregation helpers (period totals, payment methods, recent daily sales)
- `tables.ts` – Floor table queries + occupancy metrics

Each module:

- Exports typed functions returning domain-specific data
- Handles errors via `handleSupabaseError`
- Scopes queries by `company_id` for multi-tenancy

## Conventions

- Function names follow `get*`, `create*`, `update*`, `delete*`, `calculate*` patterns
- Always pass `companyId` explicitly to avoid accidental cross-tenant leakage
- Aggregation helpers return normalized shapes ready for UI consumption

## Occupancy Metrics

`getTableOccupancyMetrics(companyId)` returns:

```ts
{
  occupied: number;      // tables with status === 'occupied'
  total: number;         // total tables excluding maintenance
  occupancyRate: number; // occupied / total (0 if total === 0)
}
```

Use this for dashboard KPIs and trend charts.

## Extending

Add a new file (e.g. `reservations.ts`) then export it from `index.ts`.
Keep heavy transforms client-side unless a single RPC clearly reduces bandwidth.
