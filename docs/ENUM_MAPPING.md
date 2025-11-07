# Enum & Status Mapping (Mobile ↔ Web)

**Last Updated**: 2025-11-07

This document defines the canonical mapping between BotecoPRO mobile (Flutter) enum indices and the Supabase Web Admin textual values. Mobile currently stores enum variants by **index**; the web platform uses **TEXT + CHECK** constraints (no PostgreSQL enum types).

## Table Status

| Mobile Index | Mobile Enum (historical) | Web/Text Value | Notes |
|--------------|--------------------------|----------------|-------|
| 0            | free                     | available      | Migrated during `cleanup_legacy_tables` (`free` → `available`) |
| 1            | occupied                 | occupied       | Unchanged |
| 2            | reserved (new)           | reserved       | Added in web; mobile app to add variant |
| 3            | maintenance (new)        | maintenance    | Added in web; mobile app to add variant |

```ts
// src/lib/tableStatus.ts
export const TABLE_STATUS_ORDER = [
  'available',
  'occupied',
  'reserved',
  'maintenance',
] as const;
```

Conversion Helpers:

```ts
statusIndex('reserved')        // => 2
statusFromIndex(3)             // => 'maintenance'
```

## Product Category

| Mobile Index | Mobile Enum (historical) | Web/Text Value |
|--------------|--------------------------|----------------|
| 0            | drink                    | drink          |
| 1            | food                     | food           |
| 2            | other                    | other          |

> Web uses TEXT with a CHECK constraint (to be added) enforcing values in ('drink','food','other').

## Order Status

| Mobile Index | Mobile Enum | Web/Text Value | Planned Web Usage |
|--------------|-------------|----------------|-------------------|
| 0            | pending     | pending        | Initial state |
| 1            | preparing   | preparing      | Kitchen workflow |
| 2            | ready       | ready          | Ready for delivery |
| 3            | delivered   | delivered      | Completed table service |
| 4            | canceled    | canceled       | Terminal state |

Future Additions (Reserved Indices):

| Index | Value      | Purpose                        |
|-------|------------|--------------------------------|
| 5     | billed     | Post-payment separation (maybe)|
| 6     | refunded   | After-sale adjustments         |

## Mapping Strategy (Sync Layer)

1. Mobile → Web Upload:
   - Convert each enum index to textual form using arrays defined in web (`TABLE_STATUS_ORDER`, etc.).
   - Validate value against accepted set; reject or quarantine unknown indices.
2. Web → Mobile Download:
   - Provide arrays in response payload meta (so mobile can future-proof if new values appear).
   - For unknown textual values, mobile stores a placeholder and logs.
3. Conflict Resolution:
   - Prefer newer `updated_at` timestamp.
   - If status transitions conflict (e.g., mobile says `occupied`, web says `maintenance`), apply server rule set:
     - `maintenance` overrides all.
     - `reserved` overrides `available`.
     - Timestamp tie → keep non-terminal state (avoid premature `maintenance`).
4. Validation Guards (Server):
   - Use CHECK constraints or row-level triggers for newly introduced states.
   - Enforce presence of `company_id` during inserts.

## Mobile Refactor Checklist

- [ ] Add new enum variants: `reserved`, `maintenance` (table status)
- [ ] Replace `stockQuantity` with `stock` for product sync (include migration routine)
- [ ] Introduce `companyId` field to all synced entities
- [ ] Centralize enum ↔ index conversion utilities
- [ ] Handle unknown server textual value fallback (`index = -1` sentinel)

## Web Implementation Status

- Status mapping helpers added in `src/lib/tableStatus.ts`
- API Changelog updated to include legacy cleanup & status normalization
- Pending: Add CHECK constraints for product_category & order_status (migration)

## Example Payload (Sync API Draft)

```jsonc
{
  "meta": {
    "tableStatus": ["available", "occupied", "reserved", "maintenance"],
    "productCategory": ["drink", "food", "other"],
    "orderStatus": ["pending", "preparing", "ready", "delivered", "canceled"]
  },
  "tables": [
    {"id":"uuid","company_id":"uuid","name":"Mesa 3","number":3,"status":"occupied","capacity":4,"updated_at":"2025-11-07T12:00:00Z"}
  ],
  "products": [
    {"id":"uuid","company_id":"uuid","name":"Cerveja IPA","category":"drink","price":3.5,"stock":24,"updated_at":"2025-11-07T12:00:00Z"}
  ],
  "orders": [
    {"id":"uuid","company_id":"uuid","table_id":"uuid","status":"pending","created_at":"2025-11-07T12:00:00Z","updated_at":"2025-11-07T12:00:00Z"}
  ]
}
```

## Rationale

Using TEXT values instead of PostgreSQL enums:

- Faster iterative development (no type drops needed)
- Easier cross-platform mapping (Flutter indices ↔ strings)
- Compatible with JSON meta broadcasting (future WebSocket sync)

## Next Steps

1. Implement CHECK constraints for categories & statuses
2. Finish Sync API endpoint spec (`/sync/upload`, `/sync/download`)
3. Add migration for order status textual validation
4. Implement conflict resolver service

---
**Owner**: Monynha Softwares Dev Team
**Contact**: <mailto:integration@monynha.com>
