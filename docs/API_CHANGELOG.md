# API Changelog

<!-- markdownlint-disable MD005 MD007 MD024 -->

**Project**: Boteco.pt Web Admin Panel  
**Last Updated**: November 7, 2025

---

## [Unreleased] - 2025-11-07

### Added

- **Schema Migration**: `add_tables_name_column`
  - Added `name` column to `tables` table (TEXT, NOT NULL)
  - Populated default values as `'Mesa ' || number`
  - Added unique constraint `tables_company_name_unique` on `(company_id, name)`
  - Column comments added for documentation
  - Resolves mismatch between API (expected `name`) and DB (had only `number`)
- **Schema Migration**: `cleanup_legacy_tables`
  - Migrated rows from `bar_tables` into `tables` with robust name/number parsing
  - Mapped legacy status `free` -> current `available`
  - Dropped legacy `bar_tables` table
  - Dropped obsolete `table_status` enum type (replaced by TEXT values)
  - Added unique constraints `(company_id, number)` and `(company_id, name)` hardening multi-tenant data integrity
  - Added index on `company_users.invited_by` (FK performance)
  - Hardened function search paths (`ALTER FUNCTION ... SET search_path TO public`)
  - Moved `unaccent` extension out of `public` schema into dedicated `extensions` schema
  - Ensured no duplicate `company_settings` row creation during migration (idempotent guard)

### Changed

- **TypeScript Types** (`src/types/database.ts`)
  - Updated `tables.Row` interface to include `name: string`
  - Updated `tables.Insert` interface to require `name: string`
  - Updated `tables.Update` interface to allow `name?: string`
  - Regenerated from Supabase schema
  - Removed legacy references to `bar_tables`, `table_status` enum and other `_legacy` tables from local type declarations

### Fixed

- **Tables API** (`src/lib/api/tables.ts`)
  - API already used `table.name` field - now compatible with database schema
  - `getTables()` sorts by `name` column (now exists in DB)
- Eliminated potential mismatches by removing any stale type imports relying on legacy enum

### Documentation

- Created comprehensive **Integration Plan** (`docs/INTEGRATION_PLAN.md`)
  - Analyzed current Supabase schema (26 tables)
  - Identified 16 legacy tables for removal
  - Analyzed BotecoPRO mobile app architecture (Flutter + localStorage)
  - Defined integration strategy options
  - Recommended: Sync API Layer (Option B)
  - Detailed migration roadmap (6 phases over 10 weeks)
  - Conflict resolution strategy
  - Security considerations and RLS policies
- Added enum/status mapping spec (`docs/ENUM_MAPPING.md`) describing index↔text conversion for mobile → web sync (table status, product category, order status)

### Documentation

- Added OpenAPI 3.0 draft for Sync API: `docs/sync.openapi.yaml`
  - Defines `/sync/meta`, `/sync/download`, `/sync/upload`
  - JWT bearer auth, delta params (`since`, `limit`), and structured upload responses
  - Schemas for tables, products, orders, order_items, sales, stock_movements

---

## [2025-11-06] - Phase 3.1: Tables Floor View

### Added

- **Tables Floor View** (`src/pages/admin/TablesFloor.tsx`)
  - Interactive floor plan with table status visualization
  - Realtime status updates via Supabase subscriptions
  - Status summary cards (available/occupied/reserved/maintenance)
  - Dropdown status change with optimistic UI updates
  - Empty state when no tables exist
  - Full i18n support (pt/en/es/fr)

- **Translation Files**:
  - `src/content/{pt,en,es,fr}/tables-floor.json`
  - Status labels, page title, empty state messages

- **Routing**:
  - Added `/painel/mesas/salao` route in `src/App.tsx`
  - Registered `tables-floor` namespace in `src/i18n.ts`

---

## [2025-11-05] - Phase 2.1: Dashboard Complete

### Added

- **Table Occupancy Metric**:
  - New API function `getTableOccupancyMetrics()` in `src/lib/api/tables.ts`
  - Calculates: occupied tables, total active tables, occupancy rate
  - Excludes tables in maintenance from total count
  - Returns percentage for occupancy gauge

- **Empty State UX**:
  - Added conditional rendering in `src/pages/Painel.tsx`
  - Displays friendly message when no company is selected
  - Shows "Select Company" CTA with icon
  - Prevents unnecessary API calls when `companyId` is null

- **Translation Files**:
  - Updated `src/content/{pt,en,es,fr}/painel.json`
  - Added `emptyState` section with `title`, `description`, `selectCompany`

### Changed

- **Dashboard Metrics** (`src/pages/Painel.tsx`):
  - Added 6th metric card: "Ocupação de Mesas" (Table Occupancy)
  - Uses `useQuery` with realtime subscription
  - Displays percentage with trend indicator
  - Disabled state when `companyId` is null

---

## [2025-11-04] - Phase 2.1: Dashboard with Realtime

### Added

- **Dashboard Metrics**:
  - Total revenue (today)
  - Active orders count
  - Low stock products count
  - Active tables count
  - Today's sales count
  - Table occupancy percentage (added 2025-11-05)

- **Dashboard Charts**:
  - Revenue chart (last 7 days)
  - Top products chart (by revenue)

- **Realtime Subscriptions**:
  - `orders` table changes
  - `sales` table changes
  - Auto-refetch queries on Supabase events

- **API Layer**:
  - `src/lib/api/sales.ts` - Sales aggregation functions
  - `src/lib/api/orders.ts` - Order management
  - `src/lib/api/tables.ts` - Table operations
  - `src/lib/api/products.ts` - Product inventory

---

## [2025-11-03] - Phase 1.2: Company Context

### Added

- **Company Context** (`src/contexts/CompanyContext.tsx`):
  - Multi-tenant company selection
  - Company switcher in header
  - Persisted selection in localStorage
  - Auto-fetch user's companies from Supabase

- **Company Users API** (`src/lib/api/company-users.ts`):
  - `getUserCompanies()` - Fetch companies for authenticated user
  - Uses Clerk `userId` to query `company_users` table

---

## [2025-11-02] - Phase 1.1: Supabase Client Setup

### Added

- **Supabase Client** (`src/lib/supabase.ts`):
  - Initialized Supabase client with environment variables
  - Error handling utility `handleSupabaseError()`
  - TypeScript types from `@supabase/supabase-js`

- **Database Types** (`src/types/database.ts`):
  - Generated TypeScript interfaces from Supabase schema
  - Covers all 26 public tables
  - Type-safe row/insert/update operations

- **Environment Variables**:
  - `VITE_SUPABASE_URL` - Project URL
  - `VITE_SUPABASE_ANON_KEY` - Anonymous public key

---

## Schema Evolution

### Current Schema (Production Tables After Legacy Cleanup)

1. `companies` - Multi-tenant company records
2. `company_users` - User-company associations
3. `company_settings` - Company configuration
4. `profiles` - User profiles (auth.users linkage)
5. `products` - Product catalog
6. `tables` - Restaurant floor tables (**name column added 2025-11-07**)
7. `orders` - Customer orders
8. `order_items` - Order line items
9. `sales` - Finalized sales records
10. `recipes`, `recipe_ingredients`, `suppliers`, `internal_productions`, `production_ingredients` - Inventory management

### Legacy Schema (Status)

- `bar_tables` (removed 2025-11-07 via `cleanup_legacy_tables` migration)
- `table_status` enum (dropped 2025-11-07)
- Remaining `_legacy` tables scheduled for archival & deletion (Phase 2) after resolving `stock_movements` foreign key dependencies
  - `stock_movements` still references legacy tables → blocker to be addressed
  - Data export to JSON archive planned prior to deletion

---

## Migration History

### 2025-11-07: add_tables_name_column

- Added `name TEXT NOT NULL` to `tables` table
- Populated with default values: `'Mesa ' || number::text`
- Added unique constraint: `tables_company_name_unique (company_id, name)`
- Added column comments for documentation

**Status**: ✅ Applied to production  
**Rollback**: Drop `name` column if needed

### 2025-11-07: cleanup_legacy_tables

- Migrated data from `bar_tables` → `tables`
- Normalized names; parsed numeric portions where available
- Mapped statuses (`free` → `available`)
- Added uniqueness guarantees on `(company_id, number)` and `(company_id, name)`
- Dropped `bar_tables` & `table_status` enum
- Added performance index on `company_users.invited_by`
- Hardened function search paths
- Moved `unaccent` extension to `extensions` schema

**Status**: ✅ Applied to production
**Rollback**: Not straightforward (data merged); would require restoration from archival backup

### 2025-11-07: refactor_rls_policies

- Introduced `is_company_member(company_id uuid) STABLE` helper function
- Added composite index `company_users(user_id, company_id)` for membership lookups
- Consolidated policies into `*_select` and `*_modify` per table using `is_company_member()`
- Kept owner semantics for `companies` via `owner_id` checks
- Temporarily tightened `stock_movements` to `auth.role() = 'authenticated'` until schema gains `company_id`

**Status**: ✅ Applied to production
**Rollback**: Recreate previous per-policy rules (see migration history prior to this entry)

### 2025-11-07: add_company_id_to_stock_movements

- Added `company_id uuid` to `stock_movements`
- Backfilled `company_id` from `products.company_id` (via `product_id` FK)
- Added FK constraint and index on `company_id`
- Switched RLS to membership-based: `is_company_member(company_id)`

**Status**: ✅ Applied to production
**Rollback**: Drop FK/index and column (data loss risk if application depends on it)

### 2025-11-07: enforce_text_enums

- Added NOT VALID CHECK constraint `products_category_check` enforcing (`drink`,`food`,`other`)
- Added NOT VALID CHECK constraint `orders_status_check` enforcing (`pending`,`preparing`,`ready`,`delivered`,`canceled`)
- Attempted validation; if any existing rows violate, constraints remain NOT VALID pending data cleanup
- Establishes groundwork for consistent enum mapping across mobile ↔ web sync

**Status**: ✅ Applied to production (may remain NOT VALID if legacy rows exist)
**Rollback**: `ALTER TABLE ... DROP CONSTRAINT products_category_check;` / `orders_status_check;`

### 2025-11-07: validate_text_enums

- Verified zero rows in `products` and `orders` violate allowed sets
- Successfully validated `products_category_check` and `orders_status_check` constraints
- Textual enum integrity now enforced at write-time

**Status**: ✅ Constraints VALIDATED
**Rollback**: Drop constraints or reintroduce NOT VALID state by recreating them

### 2025-11-07: ensure_updated_at_triggers

- Added `set_updated_at()` trigger function to auto-update `updated_at` on row modifications
- Applied triggers to all public tables containing an `updated_at` column
- Supports Sync API delta queries with consistent server-side timestamps

**Status**: ✅ Applied
**Rollback**: Drop triggers and/or function (`DROP FUNCTION public.set_updated_at();`)

### 2025-11-07: sync_api_spec

- Authored `docs/SYNC_API.md` defining endpoints: `/sync/meta`, `/sync/download`, `/sync/upload`
- Established conflict resolution rules and validation matrix
- Included rate limiting strategy and telemetry plan
- Enumerations published via `/sync/meta` for mobile index ↔ text mapping

**Status**: ✅ Draft Published
**OpenAPI**: Added `docs/sync.openapi.yaml`
**Next**: Implement endpoints

### 2025-11-07: enforce_stock_movements_company_id_not_null

- Added trigger `set_stock_movements_company_id_trg` to populate `company_id` from `products` on insert/update
- Backfilled any missing/mismatched `company_id` values
- Set `stock_movements.company_id` to NOT NULL
- Added index `(company_id, created_at)` for common filters

**Status**: ✅ Applied
**Rollback**: Drop trigger, relax NOT NULL, and remove index

---

## Breaking Changes

### None (All Changes Backward Compatible)

- Adding `name` column to `tables` is additive (no removal of `number` column)
- Legacy tables still exist (scheduled for removal in Phase 2)
- All APIs maintain existing function signatures

---

## Upcoming Changes

### Phase 2: Legacy Table Removal (Estimated: Week 2)

**Breaking**: Will remove 16 legacy tables  
**Mitigation**: Export legacy data to JSON archive before deletion

### Phase 3: Active Orders Management (Estimated: Week 3)

**Additive**: New page at `/painel/mesas/pedidos`

### Phase 4: Sync API for BotecoPRO Mobile (Estimated: Weeks 5-6)

**New Service**: REST API for mobile app synchronization

---

## Versioning

**Current Version**: v0.2.0 (Schema Migration + Integration Planning)  
**Previous Version**: v0.1.0 (Dashboard + Realtime)  
**Initial Release**: v0.0.1 (Supabase Setup)

---

**Maintained by**: Monynha Softwares Development Team  
**For Integration Questions**: See `docs/INTEGRATION_PLAN.md`
