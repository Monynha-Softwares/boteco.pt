# Sync API Specification

**Version**: Draft v0.1
**Last Updated**: 2025-11-07

This document defines the synchronization layer between the BotecoPRO mobile client (offline-first Flutter app) and the Boteco.pt Web Admin (Supabase backend). The goal is efficient, conflict-resilient, multi-tenant synchronization.

## Design Principles

1. Incremental: Clients fetch only changes since last sync timestamp.
2. Durable Ordering: `updated_at` (server-side) is the single authoritative version clock.
3. Enum Clarity: Mobile indexes ↔ textual values via meta arrays.
4. Idempotent: Duplicate uploads are safe; upserts are deterministic.
5. Constrained Writes: RLS + CHECK enforce integrity; API performs validation before committing.
6. Multi-Tenant Isolation: All payload rows MUST include `company_id` aligned with auth context.

## Core Entities

| Entity | Table | Required Fields for Sync |
|--------|-------|--------------------------|
| Table | `tables` | id, company_id, name, number, status, capacity, updated_at |
| Product | `products` | id, company_id, name, category, price, stock, min_stock, updated_at |
| Order | `orders` | id, company_id, table_id, status, created_at, updated_at |
| OrderItem | `order_items` | id, order_id, product_id, quantity, price, updated_at |
| Sale | `sales` | id, company_id, order_id, total, payment_method, updated_at |
| StockMovement | `stock_movements` | id, company_id, product_id, movement_type, quantity, created_at |

## Endpoints

 
### 1. GET /sync/meta
Returns enumeration arrays and server capability flags.

Response (200):
```jsonc
{
  "tableStatus": ["available","occupied","reserved","maintenance"],
  "productCategory": ["drink","food","other"],
  "orderStatus": ["pending","preparing","ready","delivered","canceled"],
  "maxBatch": 500,
  "supportsDelta": true,
  "serverTime": "2025-11-07T13:00:00Z"
}
```

 


### 2. GET /sync/download?company_id={uuid}&since={timestamp}&limit={n}

Fetch changed rows for a company since `since` (exclusive). If `since` omitted, returns initial snapshot (capped by `limit`). Pagination via `nextSince`.

Response (200):

```jsonc
{
  "since": "2025-11-07T12:00:00Z",
  "nextSince": "2025-11-07T13:00:00Z",
  "tables": [{"id":"...","company_id":"...","name":"Mesa 3","number":3,"status":"occupied","capacity":4,"updated_at":"2025-11-07T12:30:00Z"}],
  "products": [],
  "orders": [],
  "order_items": [],
  "sales": [],
  "stock_movements": [],
  "checksum": "sha256:deadbeef..."
}
```


 

### 3. POST /sync/upload

Client pushes local changes. Server performs per-row validation and upserts by primary key (UUID). For each row, server compares `updated_at` values to decide acceptance.

Request:

```jsonc
{
  "company_id": "uuid",
  "clientTime": "2025-11-07T13:05:00Z",
  "tables": [{"id":"...","name":"Mesa 3","number":3,"status":"occupied","capacity":4,"updated_at":"2025-11-07T13:04:59Z"}],
  "products": [],
  "orders": [],
  "order_items": [],
  "sales": [],
  "stock_movements": []
}
```

Response (207 Multi-Status style semantics via body):

```jsonc
{
  "accepted": {
    "tables": ["uuid-table-3"]
  },
  "rejected": {
    "tables": [{"id":"uuid-table-2","reason":"stale_update","server_updated_at":"2025-11-07T13:06:00Z"}]
  },
  "errors": [{"entity":"products","id":"uuid-prod-x","message":"category invalid"}],
  "serverSince": "2025-11-07T13:07:00Z"
}
```

## Conflict Resolution

Rule Set (ordered precedence):

1. Newer `updated_at` wins (server authoritative clock; server sets its own on write).
2. Terminal states (e.g., order `delivered`) override non-terminal unless client provides newer timestamp.
3. Maintenance table status overrides all other statuses regardless of client timestamp if server maintenance state is newer.
4. Quantity adjustments: Stock movements are append-only; conflicts resolved by creating new movement entries rather than overwriting.
5. Rejections supply server authoritative record (optional future expansion):

```jsonc

{"id":"uuid","_serverRecord":{"status":"occupied","updated_at":"..."}}
```text

## Validation Matrix

| Entity | Validation | Reject Reason Codes |
|--------|------------|---------------------|
| tables | status in meta.tableStatus; capacity >= 0 | invalid_status, negative_capacity |
| products | category in meta.productCategory; stock >= 0; min_stock >=0 | invalid_category, negative_stock |
| orders | status in meta.orderStatus; table_id exists | invalid_status, missing_table |
| order_items | product_id exists; quantity > 0 | missing_product, invalid_quantity |
| sales | total >=0; payment_method whitelisted | invalid_total, invalid_payment_method |
| stock_movements | quantity <> 0; movement_type whitelisted | invalid_quantity, invalid_type |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /sync/meta | 30 req | 1 minute |
| /sync/download | 120 req | 5 minutes |
| /sync/upload | 240 req | 5 minutes |

Response headers:

```text
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 1700000000
```

## Authentication & Authorization

- Supabase JWT (Clerk integrated) in `Authorization: Bearer <token>`.
- Server derives `user_id` from JWT; retrieves allowed companies (via `company_users`).
- Rejects request if `company_id` not in membership set (`403 company_forbidden`).

## Security Considerations

- Strict RLS still applies for direct supabase-js queries; Sync API acts as controlled proxy.
- Payload size bounded by `maxBatch`; large initial sync must paginate.
- Input sanitized; unknown fields dropped; extraneous keys logged for telemetry.
- Server sets authoritative `updated_at` (ignores client-provided values except for conflict tests).

## Error Handling

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Malformed payload or invalid JSON |
| 401 | Missing/invalid auth token |
| 403 | User lacks access to company_id |
| 409 | Bulk conflict beyond acceptable threshold (e.g., >30% stale) |
| 413 | Payload exceeds size limits |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Telemetry & Observability

- Capture metrics: `sync_upload_conflicts`, `sync_download_rows`, `sync_payload_bytes`.
- Structured logs per request id; correlation id returned as `X-Request-Id` header.
- Optional future: WebSocket push channel for delta hints.

## Client Algorithm Outline

```pseudo
function sync(companyId):
  meta = GET /sync/meta
  lastSince = loadLocalSince(companyId)
  loop:
    download = GET /sync/download?company_id=companyId&since=lastSince
    apply(download.rows)
    lastSince = download.nextSince
    if download.rows.length < limit break
  changes = gatherLocalChanges(companyId, meta)
  uploadResp = POST /sync/upload(changes)
  handleConflicts(uploadResp.rejected)
  saveLocalSince(companyId, uploadResp.serverSince)
```

## Future Extensions

- Delta compression (only changed columns).
- Soft-delete support (`deleted_at` column with tombstone replication).
- Batching multiple companies for power users with cross-company roles.
- WebSocket incremental push for high-churn entities (orders, tables).

## Open Questions

1. Should sales be derived only server-side (avoid client upload)?
2. Should stock adjustments always flow through movement entries (no direct stock edits)?
3. Introduce vector clock per entity for multi-source concurrency beyond timestamp?

---
**Owner**: Monynha Softwares Dev Team
**Contact**: <mailto:integration@monynha.com>
