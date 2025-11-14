---
title: Supabase Integration Guide
category: Development
tags: [supabase, database, api, backend]
author: Monynha Softwares
date: 2025-11-07
status: Active
---

# Supabase Integration Guide

## Overview

This guide covers the Supabase integration for BotecoPro, including client configuration, API patterns, real-time subscriptions, and Row Level Security (RLS) policies.

**Related Documentation:**
- [AGENTS.md](../AGENTS.md) - Architecture patterns
- [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) - Query optimization

---

## Quick Start

### 1. Environment Setup

Add your Supabase credentials to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from: https://app.supabase.com/project/_/settings/api

### 2. Import the Client

```typescript
import { supabase } from '@/lib/supabase';
import { getProducts, getActiveOrders } from '@/lib/api';
```

### 3. Use with TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';

const { data: products, isLoading, error } = useQuery({
  queryKey: ['products', companyId],
  queryFn: () => getProducts(companyId),
  enabled: !!companyId,
});
```

---

## Architecture

### Client Configuration

**File**: `src/lib/supabase.ts`

The Supabase client is configured with:
- ✅ Session persistence
- ✅ Auto token refresh
- ✅ Session detection from URL
- ✅ Custom client headers

```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
});
```

### Type Safety

**File**: `src/types/database.ts`

Auto-generated TypeScript types from the Supabase schema ensure type safety across all queries.

To regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Or with Supabase CLI:

```bash
supabase gen types typescript --linked > src/types/database.ts
```

---

## API Modules

### Products API

**File**: `src/lib/api/products.ts`

```typescript
// Get all active products
const products = await getProducts(companyId);

// Get all products (including inactive)
const allProducts = await getProducts(companyId, false);

// Get single product
const product = await getProduct(productId, companyId);

// Get low stock products
const lowStock = await getLowStockProducts(companyId);

// Create product
const newProduct = await createProduct({
  company_id: companyId,
  name: 'Cerveja Artesanal',
  price: 12.90,
  category: 'drink',
  unit: 'un',
  stock: 50,
  min_stock: 10,
});

// Update product
const updated = await updateProduct(productId, companyId, {
  price: 13.90,
  stock: 45,
});

// Soft delete product
const deleted = await deleteProduct(productId, companyId);
```

### Orders API

**File**: `src/lib/api/orders.ts`

```typescript
// Get all orders
const orders = await getOrders(companyId);

// Get orders by status
const openOrders = await getOrders(companyId, 'open');

// Get active orders (open + in_progress)
const activeOrders = await getActiveOrders(companyId);

// Get single order
const order = await getOrder(orderId, companyId);

// Create order
const newOrder = await createOrder({
  company_id: companyId,
  table_id: tableId,
  status: 'open',
  subtotal: 50.00,
  total: 55.00,
  tax: 5.00,
  discount: 0,
});

// Update order status
const updated = await updateOrder(orderId, companyId, {
  status: 'ready',
});

// Get orders count by status
const counts = await getOrdersCountByStatus(companyId);
// { open: 3, in_progress: 5, ready: 2, closed: 15 }
```

### Sales API

**File**: `src/lib/api/sales.ts`

```typescript
// Get today's sales total
const todayTotal = await getTodaysSalesTotal(companyId);

// Get last 30 days sales
const monthTotal = await getPeriodSalesTotal(companyId, 30);

// Get sales in date range
const sales = await getSales(companyId, '2025-11-01', '2025-11-07');

// Create sale
const newSale = await createSale({
  company_id: companyId,
  order_id: orderId,
  total: 55.00,
  subtotal: 50.00,
  tax: 5.00,
  discount: 0,
  payment_method: 'pix',
  sale_date: new Date().toISOString(),
});

// Get sales by payment method
const byMethod = await getSalesByPaymentMethod(companyId);
// { pix: 1500, credit: 2300, debit: 800, cash: 400 }
```

---

## TanStack Query Integration

### Basic Query Pattern

```typescript
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';

export const useProducts = (companyId: string) => {
  return useQuery({
    queryKey: ['products', companyId],
    queryFn: () => getProducts(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '@/lib/api';

export const useCreateProduct = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products', companyId] });
    },
  });
};
```

### Usage in Component

```typescript
const ProductList = () => {
  const { companyId } = useCompany();
  const { data: products, isLoading } = useProducts(companyId);
  const createMutation = useCreateProduct(companyId);

  const handleCreate = (productData) => {
    createMutation.mutate(productData);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

---

## Real-time Subscriptions

### Basic Realtime Hook

**File**: `src/hooks/useRealtimeOrders.ts`

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useRealtimeOrders = (companyId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`orders-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          console.log('Order change:', payload);
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['orders', companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);
};
```

### Usage in Component

```typescript
const ActiveOrders = () => {
  const { companyId } = useCompany();
  const { data: orders } = useQuery({
    queryKey: ['orders', companyId],
    queryFn: () => getActiveOrders(companyId),
  });

  // Enable real-time updates
  useRealtimeOrders(companyId);

  return (
    <div>
      {orders?.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};
```

### Optimistic Updates

```typescript
export const useRealtimeOrdersOptimistic = (companyId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`orders-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          // Optimistically add new order to cache
          queryClient.setQueryData(['orders', companyId], (old: any) => {
            return [payload.new, ...(old || [])];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          // Optimistically update order in cache
          queryClient.setQueryData(['orders', companyId], (old: any) => {
            return old?.map((order: any) =>
              order.id === payload.new.id ? payload.new : order
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);
};
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Queries automatically filter by the authenticated user's company access.

### RLS Policy Examples

```sql
-- Products: Users can only access their company's products
CREATE POLICY "Users can view own company products"
ON products FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
  )
);

-- Orders: Users can only access their company's orders
CREATE POLICY "Users can view own company orders"
ON orders FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
  )
);
```

### Testing RLS Policies

```typescript
import { checkConnection } from '@/lib/supabase';

// Check if connection is healthy
const isHealthy = await checkConnection();
console.log('Supabase connection:', isHealthy ? 'OK' : 'Failed');
```

---

## Error Handling

All API functions use the `handleSupabaseError` utility for consistent error handling:

```typescript
try {
  const products = await getProducts(companyId);
} catch (error) {
  // Error is automatically formatted and logged
  console.error(error.message);
}
```

Custom error handling:

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['products', companyId],
  queryFn: () => getProducts(companyId),
  onError: (error) => {
    toast.error(`Failed to load products: ${error.message}`);
  },
});
```

---

## Performance Best Practices

### 1. Select Only Needed Columns

```typescript
// ❌ Avoid selecting everything
const { data } = await supabase.from('products').select('*');

// ✅ Select only what you need
const { data } = await supabase
  .from('products')
  .select('id, name, price, stock');
```

### 2. Use Pagination

```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .range(0, 49) // First 50 items
  .eq('company_id', companyId);
```

### 3. Enable Query Caching

```typescript
const { data } = useQuery({
  queryKey: ['products', companyId],
  queryFn: () => getProducts(companyId),
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
});
```

### 4. Batch Operations

```typescript
import { batchOperation } from '@/lib/supabase';

// Execute multiple queries in parallel
const [products, orders, sales] = await batchOperation([
  getProducts(companyId),
  getActiveOrders(companyId),
  getTodaysSalesTotal(companyId),
]);
```

---

## Troubleshooting

### Connection Issues

```typescript
import { checkConnection } from '@/lib/supabase';

const isHealthy = await checkConnection();
if (!isHealthy) {
  console.error('Cannot connect to Supabase');
}
```

### RLS Policy Errors

If you get "row-level security policy" errors, verify:
1. User is authenticated
2. User has `company_users` entry
3. RLS policies are correctly configured

### Real-time Not Working

Check if real-time is enabled:
1. Supabase Dashboard → Database → Replication
2. Enable replication for required tables
3. Verify `realtime_enabled` in `company_settings`

---

## Migration Guide

### Creating a New Migration

```bash
# Using Supabase CLI
supabase migration new add_reservations_table

# Manual migration in SQL
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  -- ... other fields
);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own company reservations"
ON reservations FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
  )
);
```

### Applying Migrations

```bash
# Local development
supabase migration up

# Production (via dashboard or CLI)
supabase db push
```

---

## Related Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: November 7, 2025  
**Maintained by**: Monynha Softwares Development Team
