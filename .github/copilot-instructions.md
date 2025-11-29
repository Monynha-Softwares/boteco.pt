# Boteco.pt - AI Coding Instructions

**Multilingual (pt/en/es/fr) React SPA** for restaurant management: Vite + React 18 + TypeScript + i18next + shadcn/ui + Tailwind CSS.

## Critical Architecture Patterns

### 1. Locale-First Routing (`src/App.tsx`)
**All pages MUST live under `/:locale` wrapper** (except `/painel`):
```tsx
<Route path="/:locale" element={<LocaleWrapper />}>
  <Route path="nova-pagina" element={<NovaPagina />} />
</Route>
```
- Root `/` redirects to `/pt`
- URLs without locale prefix (e.g., `/about`) will 404 → use `/pt/sobre`
- `LocaleWrapper` syncs URL param with i18next and wraps `<Layout>`

### 2. i18n Content System (`src/i18n.ts` + `src/content/`)
**Zero hardcoded strings.** All text in JSON files organized by locale:
- `src/content/{pt,en,es,fr}/{page}.json` - Translations (namespace = filename)
- `src/content/common/navigation.json` - Multi-locale nav with `type: 'link' | 'mega'` support

**New page checklist:**
1. Create `src/content/{pt,en,es,fr}/nova-pagina.json`
2. Import in `src/i18n.ts`: `import ptNovaPagina from './content/pt/nova-pagina.json'`
3. Add to `resources.pt['nova-pagina']` + append `'nova-pagina'` to `ns` array
4. Use in component: `const { t } = useTranslation('nova-pagina'); t('hero.title')`

### 3. Theme System (Boteco Brand Colors)
**CSS variables only** - never hardcode hex/rgb values:
```tsx
// ✅ Correct
<div className="bg-boteco-primary text-boteco-primary-foreground">
// ❌ Wrong - breaks dark mode
<div style={{ backgroundColor: '#9b1d5a' }}>
```
- Custom colors: `boteco-primary`, `boteco-secondary`, `boteco-tertiary`, `boteco-neutral` (+ `-foreground` pairs)
- Dark mode: `:root` vs `.dark` classes in `src/globals.css` swap HSL values
- `ThemeProvider` uses `disableTransitionOnChange={true}` - don't override

### 4. Marketing Page Template Pattern
**Reusable template for solution pages** (`src/components/templates/MarketingPageTemplate.tsx`):
```tsx
// src/pages/MenuDigital.tsx
import MarketingPageTemplate from '@/components/templates/MarketingPageTemplate';
const MenuDigital = () => <MarketingPageTemplate translationNamespace="menu-digital" />;
```
Auto-renders Hero → Benefits → Workflow → Highlights → CTA from i18n JSON structure matching `types/marketing-page.ts`.

### 5. Data Persistence (Hybrid Approach)
**Dev writes to localStorage, Prod reads from static JSON/Supabase** (`src/lib/storage/`):
```typescript
export const getContactRequests = async (): Promise<ContactRequest[]> => {
  try {
    const { data, error } = await supabase.from('contact_requests').select('*');
    // ... handle error and normalize data
    writeToLocalStorage(normalizedData); // Cache to local storage
    return normalizedData;
  } catch (error) {
    return readFromLocalStorage(); // Fallback
  }
};
```
Functions follow `get*`, `create*`, `calculate*Metrics` naming with full TypeScript interfaces.

### 6. Optional Feature Flags
**Clerk auth is optional** - check before using:
```tsx
import { hasClerkAuth } from '@/utils/clerk';
{hasClerkAuth && <SignedIn><UserButton /></SignedIn>}
```
App degrades gracefully without `VITE_CLERK_PUBLISHABLE_KEY` env var.

**Environment Setup**:
- Use `VITE_` prefix for env vars (NOT `NEXT_PUBLIC_` or `REACT_APP_`)
- Copy `.env.example` to `.env` and add your Clerk/Supabase keys
- `.env` files are git-ignored - never commit credentials

## Pre-installed Components (DO NOT reinstall)
-   **shadcn/ui**: `src/components/ui/` - Import as `@/components/ui/button`. Never edit.
-   **React Bits**: `src/components/reactbits/` - Marketing sections (Hero, FeatureGrid, Stepper, etc.)
-   **@supabase/supabase-js**: Supabase client library.
-   **sonner**: For toast notifications.
-   See `components.json` for registry (includes `@react-bits` custom registry)

## Essential Commands
```bash
pnpm dev              # Dev server on localhost:8080
pnpm build            # Production build with chunk splitting
pnpm test             # Node.js native unit tests
pnpm test:visual      # Playwright visual regression tests
pnpm test:visual:ui   # Interactive Playwright UI mode
pnpm lint             # ESLint with TypeScript
```

## Docker Deployment
```bash
# Build and run with scripts
.\docker-build.ps1    # Windows
./docker-build.sh     # Linux/Mac

# Or manually
docker build -t boteco-pt:latest .
docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest

# Or use Docker Compose
docker-compose up -d
```

See `DOCKER_QUICK_REF.md` for common commands and `docs/DOCKER_DEPLOYMENT.md` for full guide.

## Testing Strategy
1.  **Unit tests** (`tests/*.test.mjs`): Node.js native runner validates JSON schemas, theme config, data flows (via `ci.yml`)
2.  **Visual tests** (`tests/visual/*.spec.ts`): Playwright cross-browser screenshots + CLS detection (via `visual-regression.yml`)
3.  **Lighthouse Audits**: Automated performance and accessibility checks (via `lighthouse.yml`)
4.  **CI/CD**: All PRs auto-run linting, tests, builds, Lighthouse audits, visual regression

## Common Pitfalls
1.  **Locale routing**: URLs without `/:locale` prefix will 404. Test nav links after changes.
2.  **Missing i18n namespace**: Ensure imported in `src/i18n.ts` AND added to `ns` array.
3.  **Theme flash**: Don't override `ThemeProvider` `disableTransitionOnChange={true}`.
4.  **Clerk assumptions**: Always check `hasClerkAuth` before using auth components.
5.  **Hardcoded colors**: Use CSS vars (`bg-boteco-primary`), not inline styles.
6.  **Supabase RLS**: Ensure RLS is enabled and policies are correctly defined for all tables.

## Utility Functions
-   **`cn()` (`src/lib/utils.ts`)**: Merge Tailwind classes with conflict resolution
-   **`useLocalizedPath()`**: Build locale-aware URLs from navigation items
-   **`useIsMobile()`**: Responsive hook for JS-based mobile decisions
-   **`useUserCompany()`**: Fetches user profile and company data from Supabase.
-   **`showSuccess`, `showError`, `showLoading`, `dismissToast` (`src/utils/toast.ts`)**: Sonner toast helpers.

## Key Files
-   **Routing**: `src/App.tsx` (lazy-loaded routes)
-   **i18n**: `src/i18n.ts` (import all translations here)
-   **Theme**: `src/globals.css` (CSS vars), `tailwind.config.ts`
-   **Navigation**: `src/content/common/navigation.json` (multi-locale with mega menu support)
-   **Types**: `src/types/marketing-page.ts`, `src/types/navigation.ts`
-   **Supabase Client**: `src/integrations/supabase/client.ts`
-   **Auth Redirector**: `src/components/AuthRedirector.tsx`
-   **Company Registration Page**: `src/pages/CompanyRegistration.tsx`
-   **User Company Hook**: `src/hooks/use-user-company.ts`

---
**See also**: `AGENTS.md` (detailed conventions), `docs/VISUAL_TESTING.md`, `README.md`