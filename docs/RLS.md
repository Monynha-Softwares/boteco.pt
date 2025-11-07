# Row Level Security (RLS) Architecture

**Last Updated**: 2025-11-07

This document explains the RLS model used by Boteco.pt after the policy refactor on 2025-11-07.

## Goals

1. Enforce strict multi-tenant isolation via `company_id`.
2. Minimize repeated `auth.uid()` subqueries for performance.
3. Provide a single membership abstraction for all business tables.
4. Keep owner semantics (`companies.owner_id`) explicit.

## Membership Helper

```sql
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.company_id = p_company_id AND cu.user_id = auth.uid()
  );
$$;
```

Characteristics:

- STABLE: evaluated once per statement execution branch.
- Uses indexed lookup (`company_users(user_id, company_id)`).
- Centralizes membership logic reducing policy duplication and planner cost.

## Policy Pattern

Each table falls into one of these categories:

| Category | Tables | Policy Logic |
|----------|--------|--------------|
| Owned Entity | companies | `auth.uid() = owner_id` (select & modify) |
| Direct Membership | products, tables, orders, sales, recipes, suppliers, internal_productions | `is_company_member(company_id)` |
| Indirect Membership (parent join) | order_items, recipe_ingredients, production_ingredients | Join parent row to derive `company_id` |
| User Profile | profiles | Self-only (`auth.uid() = id`) |
| Transitional / Mixed | stock_movements (pre-refactor) | Now migrated: `company_id` introduced, membership policies applied |

## Consolidated Policies

Instead of four separate CRUD policies per table, we use two:

```sql
-- Example: products
CREATE POLICY products_select ON public.products FOR SELECT USING (is_company_member(company_id));
CREATE POLICY products_modify ON public.products FOR ALL USING (is_company_member(company_id)) WITH CHECK (is_company_member(company_id));
```

Benefits:

- Reduced policy count → smaller catalog, faster planning.
- Uniform naming convention (`*_select`, `*_modify`).
- Clear separation of read vs write/modify intents.

## Stock Movements Migration

`stock_movements` lacked `company_id`. Migration `add_company_id_to_stock_movements` added:

1. `company_id uuid` (nullable initial).
2. Backfill from `products.company_id` when `product_id` matches.
3. FK constraint to `companies(id)`.
4. Membership-based policies.

Next Phase:

- Enforce `NOT NULL` once legacy/unmapped rows reach 0.
- Add cascade clean-up verified by usage patterns.

## Security Considerations

- All membership decisions flow through a single function → easier audit.
- Avoid granting `public` direct privileges outside RLS; rely on policies with `auth.uid()` context.
- Profiles keep permissive visibility limited to self (no global people directory yet).

## Performance Notes

- Composite index `company_users(user_id, company_id)` ensures membership checks use an index-only scan in common scenarios.
- Consolidated policies reduce repeated quals in plan cache.
- Future improvement: MATERIALIZED VIEW for cross-table company stats can rely on membership function for incremental refresh permission.

## Testing Strategy

1. Unit test: simulate queries across tables ensuring blocked access without membership row.
2. Integration test: create a second company, ensure data isolation holds for each test user.
3. Regression check: verify `EXPLAIN ANALYZE` for heavy queries (orders, products) uses index on company_id.

## Future Improvements

- Add column-level security for sensitive financial aggregates.
- Introduce `is_company_owner(company_id)` helper to distinguish privileges (e.g. destructive deletes).
- Add `company_id` to any remaining transitional tables before deprecation of legacy data.

---
**Owner**: Monynha Softwares Dev Team
