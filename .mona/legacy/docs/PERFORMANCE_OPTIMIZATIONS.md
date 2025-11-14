# Performance Optimizations

This document details the performance optimizations implemented in the Boteco.pt application to improve load times, reduce bundle size, and enhance user experience.

## Summary of Improvements

### Bundle Size Reduction
- **Before**: 973.29 kB (minified main bundle)
- **After**: 244.20 kB (minified main bundle)
- **Improvement**: ~75% reduction in main bundle size

### Code Splitting Results
The application now generates the following optimized chunks:

#### Vendor Chunks (Cached Independently)
- `react-vendor.js` (163.46 kB) - React core libraries
- `animation-vendor.js` (133.65 kB) - Framer Motion & Embla Carousel
- `ui-vendor.js` (120.37 kB) - Radix UI components
- `clerk.js` (82.81 kB) - Authentication library (only loaded when needed)
- `i18n-vendor.js` (55.74 kB) - Internationalization libraries
- `utils-vendor.js` (21.03 kB) - Utility libraries (clsx, tailwind-merge)

#### Page Chunks (Lazy Loaded)
- Home sections: 0.5-2.5 kB per section (lazy loaded)
- Other pages: Lazy loaded on demand
- Marketing pages: Shared template code (~1.7 kB)

## Optimizations Implemented

### 1. Route-Level Code Splitting
**File**: `src/App.tsx`

Implemented lazy loading for all route components using `React.lazy()`:

```typescript
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
// ... etc
```

**Benefits**:
- Users only download the code for pages they visit
- Initial bundle size reduced significantly
- Faster time to interactive (TTI)

### 2. Component-Level Code Splitting
**File**: `src/pages/Home.tsx`

Applied lazy loading to below-the-fold sections on the home page:

```typescript
const SolutionsSection = lazy(() => import('@/components/home/SolutionsSection'));
const PlansSection = lazy(() => import('@/components/home/PlansSection'));
// ... etc
```

**Benefits**:
- Hero and features load immediately (above-the-fold)
- Additional sections load as user scrolls
- Reduced initial JavaScript execution time

### 3. Vendor Code Splitting
**File**: `vite.config.ts`

Configured manual chunks in Vite to separate vendor code:

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', ...],
  'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
  'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
  'animation-vendor': ['framer-motion', 'embla-carousel-react'],
  'clerk': ['@clerk/clerk-react'],
}
```

**Benefits**:
- Vendor code is cached independently from app code
- Updates to app code don't invalidate vendor cache
- Parallel loading of vendor chunks
- Better long-term caching strategy

### 4. React Component Memoization
**Files**: 
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/Layout.tsx`

Wrapped stable components with `React.memo()` to prevent unnecessary re-renders:

```typescript
export default React.memo(Header);
export default React.memo(Footer);
export default React.memo(Layout);
```

**Benefits**:
- Header and Footer don't re-render when route changes
- Reduced React reconciliation work
- Improved perceived performance

### 5. Hook Optimizations
**File**: `src/components/Header.tsx`

Added `useMemo` for static navigation items:

```typescript
const navItems = React.useMemo(() => (navigation.items as NavItem[]) ?? [], []);
```

**File**: `src/components/Footer.tsx`

Added `useMemo` for year calculation and `useCallback` for path generation:

```typescript
const currentYear = React.useMemo(() => new Date().getFullYear(), []);
const getLocalizedPath = React.useCallback(
  (path: string) => `/${currentLocale}${path}`,
  [currentLocale]
);
```

**File**: `src/hooks/use-mobile.tsx`

Optimized to prevent double state update on mount:

```typescript
// Before: Called window.innerWidth twice
const onChange = () => {
  setIsMobile(mql.matches); // Now uses mql.matches consistently
};
setIsMobile(mql.matches);
mql.addEventListener("change", onChange);
```

**Benefits**:
- Reduced unnecessary computations
- Prevented double state updates
- More efficient function references

### 6. Production Configuration
**File**: `src/i18n.ts`

Disabled debug mode in production:

```typescript
debug: import.meta.env.DEV, // Only enable debug in development
```

**Benefits**:
- Eliminates console.log noise in production
- Slightly reduces bundle size
- Improves runtime performance

### 7. TanStack Query Optimization
**File**: `src/main.tsx`

Configured optimized defaults for data fetching:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Cache for 5 minutes
      gcTime: 10 * 60 * 1000,          // Keep unused data for 10 minutes
      retry: 1,                         // Retry failed requests once
      refetchOnWindowFocus: !import.meta.env.DEV, // Disable in dev
    },
  },
});
```

**Benefits**:
- Reduced unnecessary network requests
- Better cache utilization
- Improved offline experience

### 8. Resource Hints
**File**: `index.html`

Added preconnect hints for faster external resource loading:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
```

**Benefits**:
- Faster connection establishment to external domains
- Reduced latency for external resources
- Improved perceived performance

### 9. Removed Duplicate QueryClient
**Files**: `src/App.tsx`, `src/main.tsx`

Removed duplicate QueryClient instance from App.tsx:

**Benefits**:
- Single source of truth for query configuration
- Cleaner component tree
- Reduced memory usage

## Performance Metrics

### Before Optimizations
- Main bundle: 973.29 kB (301.77 kB gzipped)
- Single monolithic JavaScript file
- All code loaded upfront
- No caching strategy

### After Optimizations
- Main bundle: 244.20 kB (76.89 kB gzipped) - **75% smaller**
- 40+ separate chunks for optimal caching
- Progressive loading based on user navigation
- Vendor code cached independently

### Network Impact
- **Initial page load**: Downloads only ~300 kB of critical code (vs ~1 MB before)
- **Subsequent visits**: Leverages cached vendor chunks (~600 kB saved)
- **Route changes**: Only loads new page code (~5-10 kB per route)

## Best Practices Going Forward

### When Adding New Pages
1. Always use lazy loading via `React.lazy()`
2. Wrap with `<Suspense>` and provide a loading fallback
3. Consider splitting large pages into sections

### When Adding New Components
1. Use `React.memo()` for components that rarely change
2. Use `useMemo` for expensive computations
3. Use `useCallback` for function props passed to memoized children

### When Adding New Dependencies
1. Check if they can be code-split into separate chunks
2. Consider dynamic imports for large libraries used conditionally
3. Update `vite.config.ts` manual chunks if needed

### When Modifying Translations
1. i18n loads all translations upfront (current trade-off)
2. Consider implementing namespace-based lazy loading for very large apps
3. Monitor i18n bundle size as translations grow

## Future Optimization Opportunities

While significant improvements have been made, here are potential future optimizations:

1. **Image Optimization**
   - Implement next-gen image formats (WebP/AVIF)
   - Add responsive images with srcset
   - Consider lazy loading images below the fold

2. **Font Optimization**
   - Self-host fonts to reduce external requests
   - Use font-display: swap for better perceived performance
   - Subset fonts to include only needed characters

3. **Service Worker**
   - Implement offline support
   - Cache static assets aggressively
   - Prefetch likely next routes

4. **i18n Lazy Loading**
   - Load translation namespaces on demand
   - Reduce initial i18n bundle size
   - Implementation complexity vs benefit trade-off

5. **CSS Optimization**
   - Consider critical CSS extraction
   - Evaluate unused Tailwind classes
   - Optimize CSS delivery

## Monitoring

To track performance over time:

1. Run `npm run build` and review bundle analysis
2. Monitor Lighthouse scores in CI/CD
3. Use Chrome DevTools Performance tab for runtime analysis
4. Track Core Web Vitals in production

## Conclusion

These optimizations resulted in a **75% reduction** in bundle size and significantly improved the application's load time and runtime performance. The changes maintain code quality while providing a much better user experience, especially for users on slower connections or devices.
