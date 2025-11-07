# BotecoPRO Integration & Schema Migration Plan

**Last Updated**: November 2025  
**Status**: Planning Phase  
**Target**: Production Ready Q1 2026

---

## Executive Summary

This document outlines the comprehensive plan to:
1. **Clean up Supabase schema** - Remove 16 legacy tables
2. **Fix schema inconsistencies** - Resolve tables.name/number mismatch
3. **Define integration strategy** - BotecoPRO mobile app ↔ Web Admin Panel
4. **Implement data synchronization** - Enable multi-device restaurant management

---

## 1. Current State Analysis

### 1.1 Supabase Schema (26 Tables)

#### **Legacy Tables (16) - TO BE REMOVED**
```sql
-- Products & Orders (old schema)
products_legacy           -- Old product structure with stock_quantity
orders_legacy            -- Old order structure without company_id
order_items_legacy       -- Old order items
sales_legacy             -- Old sales records

-- Recipes & Production (old schema)
recipes_legacy           -- Old recipe structure
recipe_ingredients_legacy -- Old ingredient references
internal_production_legacy -- Old production records
production_ingredients_legacy -- Old production items

-- Suppliers (old schema)
suppliers_legacy         -- Old supplier structure

-- Tables (old schema - different from bar_tables)
bar_tables              -- Legacy table management (uses ENUM for status)
```

**Issues**:
- ❌ No `company_id` for multi-tenancy
- ❌ Use ENUM types (inflexible)
- ❌ Old naming conventions (`stock_quantity` vs `stock`)
- ❌ Foreign key dependencies on each other
- ❌ Not compatible with RLS policies

#### **Current Tables (10) - PRODUCTION READY**
```sql
-- Core Business
companies               -- Multi-tenant company records
company_users          -- User-company associations
company_settings       -- Company-specific config
profiles               -- User profiles (linked to auth.users)

-- Restaurant Operations
products               -- Products with company_id, stock, min_stock
tables                 -- ⚠️ ISSUE: uses 'number' instead of 'name'
orders                 -- Orders with company_id
order_items            -- Order line items
sales                  -- Sales records with company_id

-- Inventory & Production
recipes                -- Recipes with company_id
recipe_ingredients     -- Recipe composition
suppliers              -- Suppliers with company_id
internal_productions   -- Production batches
production_ingredients -- Production ingredients

-- Stock Management
stock_movements        -- ⚠️ ISSUE: Has FK to both legacy AND current tables
```

**Issues**:
- ⚠️ `tables.number` vs expected `tables.name` (API/UI mismatch)
- ⚠️ `stock_movements` references legacy tables (blocks cleanup)

---

### 1.2 BotecoPRO Mobile App Architecture

**Tech Stack**:
- Flutter 3.x web app
- Clerk authentication (same as web admin)
- localStorage persistence (NO backend database)
- Deployed to Firebase Hosting: botecopro.monynha.com

**Data Models** (from `lib/core/models/data_models.dart`):
```dart
// Mobile App Models
TableModel {
  id: String (UUID)
  number: int          ← Uses 'number', not 'name'
  status: TableStatus  ← ENUM (free, occupied)
  capacity: int
  currentOrderId: String?
}

Product {
  id: String (UUID)
  name: String
  category: ProductCategory  ← ENUM (drink, food, other)
  price: double
  stockQuantity: int         ← Uses 'stockQuantity', not 'stock'
  supplierId: String?
  description: String
  unit: String
}

Order {
  id: String (UUID)
  tableId: String
  tableNumber: int
  createdAt: DateTime
  items: List<OrderItem>
  status: OrderStatus  ← ENUM (pending, preparing, ready, delivered, canceled)
  isClosed: bool
}

// ... Supplier, Sale, Recipe, RecipeIngredient models
```

**Key Observations**:
- ✅ Uses **UUID** for IDs (compatible with Supabase UUID)
- ✅ Uses **number** field for tables (matches Supabase current schema)
- ❌ Uses **ENUM** types (incompatible with Supabase TEXT+CHECK)
- ❌ Uses **stockQuantity** (differs from Supabase `stock` column)
- ❌ **localStorage only** - no backend synchronization
- ❌ **No company_id** concept (single-tenant per browser)

---

### 1.3 Web Admin Panel Architecture

**Tech Stack**:
- React 18 + TypeScript + Vite
- Supabase client (PostgreSQL + Realtime + RLS)
- TanStack Query for state management
- Multi-tenant with company context

**Data Models** (from `src/lib/api/*.ts`):
```typescript
// Web Admin Models
interface Table {
  id: string;
  company_id: string;
  name: string;          ← ⚠️ MISMATCH: DB has 'number', not 'name'
  number: number;        ← This field exists in DB
  status: 'free' | 'occupied' | 'reserved';
  capacity: number;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  company_id: string;
  name: string;
  category: string;      ← TEXT with CHECK constraint
  price: number;
  stock: number;         ← Uses 'stock', not 'stockQuantity'
  min_stock: number;
  supplier_id: string | null;
  description: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

// ... Order, Sale, Recipe interfaces with company_id
```

**Key Observations**:
- ✅ Multi-tenant with `company_id`
- ✅ RLS policies enforce data isolation
- ✅ Realtime subscriptions for live updates
- ⚠️ API expects `name` field but DB has `number`
- ✅ Uses TEXT+CHECK for enums (flexible)

---

## 2. Schema Migration Plan

### 2.1 Phase 1: Fix Current Schema Issues

#### **Migration 1: Fix tables.name/number Mismatch**
```sql
-- Option A: Add 'name' column (keep 'number' as well)
-- RECOMMENDED: Allows gradual migration
ALTER TABLE public.tables
ADD COLUMN IF NOT EXISTS name TEXT;

-- Set default name based on number
UPDATE public.tables
SET name = 'Mesa ' || number::text
WHERE name IS NULL;

-- Make name NOT NULL after data migration
ALTER TABLE public.tables
ALTER COLUMN name SET NOT NULL;

-- Add unique constraint on (company_id, name)
ALTER TABLE public.tables
ADD CONSTRAINT tables_company_name_unique 
UNIQUE (company_id, name);
```

**Impact**:
- ✅ Web Admin API works immediately (uses `name`)
- ✅ Mobile app can continue using `number`
- ✅ No breaking changes to existing data
- ⚠️ Need to update mobile app to sync `name` field

#### **Migration 2: Fix stock_movements FK Dependencies**
```sql
-- Step 1: Identify problematic FK constraints
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'stock_movements'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Step 2: Drop FK to legacy tables
ALTER TABLE public.stock_movements
DROP CONSTRAINT IF EXISTS stock_movements_product_legacy_fk;

-- Step 3: Ensure only current table FKs remain
ALTER TABLE public.stock_movements
ADD CONSTRAINT stock_movements_product_fk
FOREIGN KEY (product_id) REFERENCES public.products(id)
ON DELETE CASCADE;

ALTER TABLE public.stock_movements
ADD CONSTRAINT stock_movements_company_fk
FOREIGN KEY (company_id) REFERENCES public.companies(id)
ON DELETE CASCADE;
```

**Impact**:
- ✅ Removes blocker for legacy table deletion
- ⚠️ Existing stock_movements referencing legacy products will be orphaned
- 📝 Need to migrate or archive legacy stock movement data first

---

### 2.2 Phase 2: Remove Legacy Tables

#### **Pre-Migration Checklist**
- [ ] Backup entire database (`pg_dump`)
- [ ] Verify no production dependencies on legacy tables
- [ ] Export legacy data to JSON for archival
- [ ] Test restoration procedure
- [ ] Schedule maintenance window

#### **Migration 3: Drop Legacy Tables (CASCADING)**
```sql
-- DANGEROUS: This will cascade delete all dependent data
-- Run ONLY after backup and verification

-- Drop legacy product/order ecosystem
DROP TABLE IF EXISTS public.order_items_legacy CASCADE;
DROP TABLE IF EXISTS public.orders_legacy CASCADE;
DROP TABLE IF EXISTS public.sales_legacy CASCADE;
DROP TABLE IF EXISTS public.products_legacy CASCADE;

-- Drop legacy recipe/production ecosystem
DROP TABLE IF EXISTS public.production_ingredients_legacy CASCADE;
DROP TABLE IF EXISTS public.internal_production_legacy CASCADE;
DROP TABLE IF EXISTS public.recipe_ingredients_legacy CASCADE;
DROP TABLE IF EXISTS public.recipes_legacy CASCADE;

-- Drop legacy suppliers
DROP TABLE IF EXISTS public.suppliers_legacy CASCADE;

-- Drop legacy tables (different from current 'tables')
DROP TABLE IF EXISTS public.bar_tables CASCADE;

-- Verify cleanup
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%legacy%';
-- Should return 0 rows
```

**Impact**:
- ✅ Cleaner schema (10 tables instead of 26)
- ✅ Faster queries (no legacy table scans)
- ✅ Reduced storage footprint
- ⚠️ **IRREVERSIBLE without backup**

---

## 3. Integration Strategy Options

### Option A: **Keep Separate (Status Quo)**
**Architecture**: Mobile app (localStorage) ⊕ Web Admin (Supabase)

**Pros**:
- ✅ No integration work required
- ✅ Mobile app remains fast (no network calls)
- ✅ Web admin has full reporting capabilities
- ✅ No cross-contamination of data

**Cons**:
- ❌ No data synchronization between devices
- ❌ Mobile app changes not visible in admin panel
- ❌ Admin panel changes not visible in mobile app
- ❌ Duplicate data entry required
- ❌ No multi-device restaurant operation

**Use Case**: **NOT RECOMMENDED** - Defeats purpose of admin panel

---

### Option B: **Sync API Layer (Recommended)**
**Architecture**: Mobile app ↔ REST API ↔ Supabase

**Flow**:
```
Mobile App (localStorage)
       ↓ POST /api/sync (batch changes)
  REST API (Node.js/Express)
       ↓ Write to Supabase with company_id
    Supabase (PostgreSQL + Realtime)
       ↓ Broadcast changes via WebSocket
  Web Admin Panel (React)
       ↓ Display realtime updates
```

**Implementation**:
1. **Mobile App Changes**:
   - Add sync service (`lib/services/sync_service.dart`)
   - Queue localStorage changes with timestamps
   - Periodic sync every 30s or on user action
   - Conflict resolution: last-write-wins

2. **REST API** (new microservice):
   - `/api/auth/verify` - Validate Clerk JWT
   - `/api/sync/upload` - Batch upload changes from mobile
   - `/api/sync/download` - Fetch updates for mobile
   - `/api/sync/conflict` - Resolve merge conflicts

3. **Web Admin Changes**:
   - Already has Supabase Realtime (no changes needed)
   - Add "Sync Status" indicator in UI
   - Handle mobile-originated data

**Pros**:
- ✅ Best of both worlds (offline + sync)
- ✅ Mobile app works offline (localStorage)
- ✅ Web admin has realtime data
- ✅ Multi-device support
- ✅ Clerk auth already shared
- ✅ Gradual rollout possible (feature flag)

**Cons**:
- ⚠️ Requires new REST API microservice
- ⚠️ Conflict resolution complexity
- ⚠️ Mobile app needs refactor (add sync layer)
- ⚠️ Network dependency for sync

**Recommended**: **YES** ✅

---

### Option C: **Migrate Mobile to Supabase**
**Architecture**: Mobile app → Supabase (direct client)

**Implementation**:
1. Add `supabase-flutter` package
2. Replace localStorage with Supabase client calls
3. Use same RLS policies as web admin
4. Share company context via Clerk → Supabase auth

**Pros**:
- ✅ Single source of truth (Supabase)
- ✅ No custom API needed
- ✅ Automatic realtime sync
- ✅ Simplified architecture

**Cons**:
- ❌ Requires internet connection (no offline mode)
- ❌ Major mobile app refactor (all data layer)
- ❌ Breaking change for existing mobile users
- ❌ Performance impact (network calls)

**Recommended**: **NO** ❌ - Offline capability is crucial for restaurants

---

## 4. Recommended Implementation Roadmap

### **Phase 1: Schema Fixes (Week 1)**
- [ ] **Task 1.1**: Backup Supabase database
- [ ] **Task 1.2**: Apply Migration 1 (tables.name column)
- [ ] **Task 1.3**: Update `src/lib/api/tables.ts` to use `name` field
- [ ] **Task 1.4**: Test TablesFloor.tsx with corrected schema
- [ ] **Task 1.5**: Deploy to dev environment
- [ ] **Task 1.6**: Run visual regression tests

**Deliverable**: ✅ Tables Floor View working correctly

---

### **Phase 2: Legacy Table Removal (Week 2)**
- [ ] **Task 2.1**: Export all legacy tables to JSON archive
- [ ] **Task 2.2**: Analyze stock_movements dependencies
- [ ] **Task 2.3**: Apply Migration 2 (fix stock_movements FK)
- [ ] **Task 2.4**: Verify no other legacy dependencies
- [ ] **Task 2.5**: Apply Migration 3 (drop legacy tables)
- [ ] **Task 2.6**: Vacuum database to reclaim space

**Deliverable**: ✅ Clean 10-table schema

---

### **Phase 3: Sync API Design (Week 3-4)**
- [ ] **Task 3.1**: Design API contract (OpenAPI spec)
- [ ] **Task 3.2**: Define sync data format (JSON schema)
- [ ] **Task 3.3**: Document conflict resolution strategy
- [ ] **Task 3.4**: Create database schema for sync metadata
  - `sync_queue` table (pending changes)
  - `sync_conflicts` table (conflict log)
  - `device_state` table (last sync timestamps)

**Deliverable**: ✅ API specification document

---

### **Phase 4: Sync API Implementation (Week 5-6)**
- [ ] **Task 4.1**: Set up Node.js/Express microservice
- [ ] **Task 4.2**: Implement Clerk JWT verification middleware
- [ ] **Task 4.3**: Implement `/api/sync/upload` endpoint
- [ ] **Task 4.4**: Implement `/api/sync/download` endpoint
- [ ] **Task 4.5**: Implement conflict resolution logic
- [ ] **Task 4.6**: Add rate limiting and error handling
- [ ] **Task 4.7**: Write API tests (Jest + Supertest)
- [ ] **Task 4.8**: Deploy to staging

**Deliverable**: ✅ Working sync API

---

### **Phase 5: Mobile App Sync Integration (Week 7-8)**
- [ ] **Task 5.1**: Create `SyncService` class in Flutter
- [ ] **Task 5.2**: Implement change tracking in localStorage
- [ ] **Task 5.3**: Add sync queue (IndexedDB for persistence)
- [ ] **Task 5.4**: Implement upload logic (batch changes)
- [ ] **Task 5.5**: Implement download logic (apply remote changes)
- [ ] **Task 5.6**: Add sync status UI indicator
- [ ] **Task 5.7**: Handle network failures gracefully
- [ ] **Task 5.8**: Write unit tests for sync logic

**Deliverable**: ✅ Mobile app with sync capability

---

### **Phase 6: Testing & Rollout (Week 9-10)**
- [ ] **Task 6.1**: End-to-end integration tests
- [ ] **Task 6.2**: Performance testing (sync latency)
- [ ] **Task 6.3**: Conflict simulation tests
- [ ] **Task 6.4**: Beta testing with 3 restaurants
- [ ] **Task 6.5**: Fix bugs and iterate
- [ ] **Task 6.6**: Documentation for restaurant staff
- [ ] **Task 6.7**: Production deployment
- [ ] **Task 6.8**: Monitor sync metrics (success rate, latency)

**Deliverable**: ✅ Production-ready sync system

---

## 5. Data Model Alignment

### 5.1 Field Mapping (Mobile ↔ Supabase)

| Entity | Mobile Field | Supabase Column | Action |
|--------|--------------|-----------------|--------|
| **Table** | `number` | `number` | ✅ No change |
| **Table** | N/A | `name` | ➕ Add to mobile (generated) |
| **Table** | `status` (ENUM) | `status` (TEXT) | 🔄 Convert enum.name ↔ text |
| **Product** | `stockQuantity` | `stock` | 🔄 Rename on sync |
| **Product** | `category` (ENUM) | `category` (TEXT) | 🔄 Convert enum.name ↔ text |
| **Order** | `status` (ENUM) | `status` (TEXT) | 🔄 Convert enum.name ↔ text |
| **All** | `id` (UUID) | `id` (UUID) | ✅ Compatible |
| **All** | N/A | `company_id` | ➕ Inject from Clerk token |
| **All** | N/A | `created_at`, `updated_at` | ➕ Generate server-side |

### 5.2 ENUM Conversion Strategy

**Mobile App** (Dart):
```dart
enum TableStatus { free, occupied }
// Serializes to: 0, 1 (index)
// For sync: use .name → "free", "occupied"
```

**Supabase** (PostgreSQL):
```sql
status TEXT CHECK (status IN ('free', 'occupied', 'reserved'))
-- Stores: "free", "occupied", "reserved"
```

**Sync API** (conversion):
```typescript
// Mobile → Supabase
const statusToDb = (enumName: string) => enumName.toLowerCase();

// Supabase → Mobile
const statusToMobile = (dbValue: string) => dbValue.toUpperCase();
```

---

## 6. Conflict Resolution Strategy

### 6.1 Conflict Detection

**Scenario**: Mobile and web both modify same entity

**Example**:
```
T0: Table #5 status = "free" (both synced)
T1: Mobile sets status = "occupied" (offline)
T2: Web admin sets status = "reserved" (online, written to Supabase)
T3: Mobile comes online, tries to sync status = "occupied"
     → CONFLICT DETECTED (updated_at timestamps differ)
```

### 6.2 Resolution Rules

| Conflict Type | Resolution Strategy | Rationale |
|---------------|---------------------|-----------|
| **Table Status** | **Last-Write-Wins** | Most recent change is likely correct |
| **Product Stock** | **Server-Wins** | Web admin has full view, mobile may be stale |
| **Order Creation** | **Both-Keep** | Create separate orders, user reviews later |
| **Order Deletion** | **Delete-Wins** | Deletion implies intentional action |
| **Supplier Edit** | **Last-Write-Wins** | Low frequency, unlikely to conflict |

### 6.3 Conflict Log

Store all conflicts in `sync_conflicts` table:
```sql
CREATE TABLE public.sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  entity_type TEXT NOT NULL, -- 'table', 'order', 'product', etc.
  entity_id UUID NOT NULL,
  mobile_value JSONB NOT NULL, -- What mobile tried to write
  server_value JSONB NOT NULL, -- What was already in Supabase
  resolved_value JSONB, -- Final value after resolution
  resolution_strategy TEXT, -- 'last_write_wins', 'server_wins', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Use case**: Admin can review conflicts and manually adjust if needed

---

## 7. Performance Considerations

### 7.1 Sync Optimization

**Batch Uploads**:
- Mobile queues changes locally
- Syncs every 30 seconds OR when user triggers
- Max 100 changes per batch (pagination for larger sets)

**Delta Downloads**:
- Web admin only sends changes since last sync
- Uses `updated_at > last_sync_timestamp`
- Mobile stores `last_sync_timestamp` in localStorage

**Compression**:
- Use `gzip` compression for API payloads
- Reduces mobile data usage by ~70%

### 7.2 Database Indexes

**Required indexes for sync performance**:
```sql
-- Fetch changes since timestamp
CREATE INDEX idx_products_updated_at_company 
ON products(company_id, updated_at);

CREATE INDEX idx_orders_updated_at_company 
ON orders(company_id, updated_at);

CREATE INDEX idx_tables_updated_at_company 
ON tables(company_id, updated_at);

-- Sync queue lookups
CREATE INDEX idx_sync_queue_device_status 
ON sync_queue(device_id, status);
```

---

## 8. Security Considerations

### 8.1 Authentication Flow

```
Mobile App → Clerk.getToken() → JWT
           ↓
REST API → Verify JWT (Clerk SDK)
        ↓ Extract user_id
Supabase → Query company_users(user_id) → company_id
        ↓ Enforce RLS with company_id
        ✅ Only allowed company data accessible
```

### 8.2 RLS Policies (Already Implemented)

**Example** (products table):
```sql
CREATE POLICY "Users can only access their company's products"
ON public.products
FOR ALL
USING (
  company_id IN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid()
  )
);
```

**Applies to**: products, orders, tables, sales, recipes, suppliers, etc.

---

## 9. Rollback Plan

### 9.1 Schema Migration Rollback

**If Migration 1 fails** (tables.name):
```sql
-- Rollback: Drop name column
ALTER TABLE public.tables DROP COLUMN IF EXISTS name;
-- Restore API to use 'number' field
```

**If Migration 3 fails** (legacy table drop):
```sql
-- Restore from pg_dump backup
pg_restore -d boteco_db -c -v legacy_backup.dump
```

### 9.2 Integration Rollback

**If sync API causes issues**:
1. Feature flag OFF (`ENABLE_SYNC=false`)
2. Mobile app reverts to localStorage-only mode
3. Web admin continues working independently
4. No data loss (mobile changes queued for later sync)

---

## 10. Success Metrics

### 10.1 Schema Migration

- ✅ Zero downtime during migration
- ✅ All tests passing after migration
- ✅ 50% reduction in database size (legacy tables removed)
- ✅ No RLS policy violations

### 10.2 Integration

- ✅ Sync latency < 5 seconds (95th percentile)
- ✅ Sync success rate > 99%
- ✅ Conflict rate < 1% of total syncs
- ✅ Mobile app works offline for 24+ hours
- ✅ Zero data loss incidents

---

## 11. Open Questions

1. **Company Association**: How does mobile app know which `company_id` to use?
   - **Option A**: User selects company on first login (stored in localStorage)
   - **Option B**: Clerk JWT includes `company_id` claim
   - **Recommendation**: Option B (more secure, no user error)

2. **Multi-Restaurant Support**: Can one user manage multiple companies?
   - **Current**: Web admin supports this via company switcher
   - **Mobile**: Single company per device (localStorage isolation)
   - **Sync API**: Must handle user switching companies

3. **Legacy Data Migration**: What to do with existing legacy data?
   - **Option A**: Discard (if no production use)
   - **Option B**: Export to JSON archive
   - **Option C**: Migrate to current tables
   - **Recommendation**: Option B (safe archival)

---

## 12. Next Steps (Immediate Actions)

### **This Week**:
1. ✅ Review and approve this integration plan
2. 🔄 Apply Migration 1 (tables.name fix) to dev environment
3. 🔄 Update `src/lib/api/tables.ts` to use `name` field
4. 🔄 Test TablesFloor.tsx with corrected schema
5. 🔄 Document API changes in `docs/API_CHANGELOG.md`

### **Next Week**:
1. Export legacy tables to JSON archive
2. Apply Migration 2 + 3 (remove legacy tables)
3. Begin sync API design (OpenAPI spec)
4. Update project roadmap in `TODO.md`

---

## Appendix A: SQL Snippets

### A.1 Verify Current Schema
```sql
-- List all tables with row counts
SELECT 
  schemaname,
  tablename,
  (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
  SELECT 
    schemaname, 
    tablename,
    query_to_xml(format('SELECT count(*) AS cnt FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
  FROM pg_tables
  WHERE schemaname = 'public'
) t
ORDER BY row_count DESC;
```

### A.2 Find All Foreign Keys
```sql
-- List all FK constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

---

**Document Owner**: Boteco.pt Engineering Team  
**Review Cycle**: Weekly during implementation phases  
**Approval Required**: Yes (before production migrations)
