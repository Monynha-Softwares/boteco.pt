# API Changelog

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

### Changed

- **TypeScript Types** (`src/types/database.ts`)
  - Updated `tables.Row` interface to include `name: string`
  - Updated `tables.Insert` interface to require `name: string`
  - Updated `tables.Update` interface to allow `name?: string`
  - Regenerated from Supabase schema

### Fixed

- **Tables API** (`src/lib/api/tables.ts`)
  - API already used `table.name` field - now compatible with database schema
  - `getTables()` sorts by `name` column (now exists in DB)

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

### Current Schema (10 Production Tables)

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

### Legacy Schema (16 Tables - Pending Removal)

All tables suffixed with `_legacy`:
- `products_legacy`, `orders_legacy`, `sales_legacy`
- `recipes_legacy`, `recipe_ingredients_legacy`
- `internal_production_legacy`, `production_ingredients_legacy`
- `suppliers_legacy`
- `bar_tables` (old table structure)
- `stock_movements` (references legacy tables - needs cleanup)

**Removal Blockers**:
- `stock_movements` has foreign keys to legacy tables
- Need to export legacy data for archival
- Requires migration plan approval

**Planned Removal**: After completing `docs/INTEGRATION_PLAN.md` Phase 2

---

## Migration History

### 2025-11-07: add_tables_name_column

- Added `name TEXT NOT NULL` to `tables` table
- Populated with default values: `'Mesa ' || number::text`
- Added unique constraint: `tables_company_name_unique (company_id, name)`
- Added column comments for documentation

**Status**: ✅ Applied to production  
**Rollback**: Drop `name` column if needed

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
