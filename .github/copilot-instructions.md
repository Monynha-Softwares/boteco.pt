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
**Dev writes to localStorage, Prod reads from static JSON** (`src/lib/storage/`):
```typescript
export const getContactRequests = async (): Promise<ContactRequest[]> => {
  try {
    const remote = await fetch('/data/contact-requests.json');
    writeToLocalStorage(await remote.json());
    return data;
  } catch {
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
- Copy `.env.example` to `.env` and add your Clerk keys
- `.env` files are git-ignored - never commit credentials

## Pre-installed Components (DO NOT reinstall)
- **shadcn/ui**: `src/components/ui/` - Import as `@/components/ui/button`. Never edit.
- **React Bits**: `src/components/reactbits/` - Marketing sections (Hero, FeatureGrid, Stepper, etc.)
- See `components.json` for registry (includes `@react-bits` custom registry)

## Essential Commands
```bash
pnpm dev              # Dev server on localhost:8080
pnpm build            # Production build with chunk splitting
pnpm test             # Node.js native test runner (NOT Jest)
pnpm test:visual      # Playwright visual regression tests
pnpm test:visual:ui   # Interactive Playwright UI mode
pnpm lint             # ESLint with TypeScript
```

## Testing Strategy
1. **Unit tests** (`tests/*.test.mjs`): Node.js native runner validates JSON schemas, theme config, data flows
2. **Visual tests** (`tests/visual/*.spec.ts`): Playwright cross-browser screenshots + CLS detection
3. **CI/CD**: All PRs auto-run linting, tests, builds, Lighthouse audits, visual regression

## Common Pitfalls
1. **Locale routing**: URLs without `/:locale` prefix will 404. Test nav links after changes.
2. **Missing i18n namespace**: Ensure imported in `src/i18n.ts` AND added to `ns` array.
3. **Theme flash**: Don't override `ThemeProvider` `disableTransitionOnChange={true}`.
4. **Clerk assumptions**: Always check `hasClerkAuth` before using auth components.
5. **Hardcoded colors**: Use CSS vars (`bg-boteco-primary`), not inline styles.

## Utility Functions
- **`cn()` (`src/lib/utils.ts`)**: Merge Tailwind classes with conflict resolution
- **`useLocalizedPath()`**: Build locale-aware URLs from navigation items
- **`useIsMobile()`**: Responsive hook for JS-based mobile decisions

## Key Files
- **Routing**: `src/App.tsx` (lazy-loaded routes)
- **i18n**: `src/i18n.ts` (import all translations here)
- **Theme**: `src/globals.css` (CSS vars), `tailwind.config.ts`
- **Navigation**: `src/content/common/navigation.json` (multi-locale with mega menu support)
- **Types**: `src/types/marketing-page.ts`, `src/types/navigation.ts`

## Design System
- **Spacing**: Tailwind 4px base (`gap-4`, `p-6`, `mt-8`)
- **Typography**: Body text uses `text-boteco-neutral` or `text-foreground`
- **Responsive**: Mobile-first design
- **Accessibility**: All interactive elements need `focus-visible:ring-2`
- **Transitions**: Include `transition-colors duration-300` on theme-aware elements

---
**See also**: `AGENTS.md` (detailed conventions), `docs/VISUAL_TESTING.md`, `README.md`
