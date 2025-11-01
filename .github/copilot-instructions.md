# Boteco.pt AI Coding Instructions

## Architecture Overview

**Boteco.pt** is a multilingual (pt/en/es/fr) React SPA for restaurant management built with:
- **Vite + React 18 + TypeScript** with SWC compilation (port 8080)
- **React Router v6** with locale-aware routing: `/:locale/path` wraps all public pages
- **i18next** for internationalization - namespace = filename in `src/content/{locale}/`
- **shadcn/ui** (Radix + Tailwind) + **React Bits** for pre-built marketing components
- **next-themes** for dark/light mode with custom Boteco brand HSL colors
- **Optional Clerk auth** (feature-flagged via `VITE_CLERK_PUBLISHABLE_KEY` env var)
- **TanStack Query** with localStorage fallback for data persistence
- **Node.js native test runner** (not Jest) + Playwright visual regression tests

## Critical Patterns

### 1. Routing Architecture (`src/App.tsx`)
**Rule**: All new pages MUST go under `/:locale` wrapper except `/painel` (auth-protected).

```tsx
<Route path="/:locale" element={<LocaleWrapper />}>
  <Route path="nova-pagina" element={<NovaPagina />} />
</Route>
```

**LocaleWrapper** (`src/components/LocaleWrapper.tsx`) syncs URL locale with i18n and wraps with `<Layout>`.  
Root `/` auto-redirects to `/pt`. URLs like `/about` will 404 - must be `/pt/sobre`.

### 2. i18n Content Structure (`src/content/` + `src/i18n.ts`)
**Zero hardcoded strings.** All text lives in JSON organized by locale and page:
- `src/content/{pt,en,es,fr}/{page}.json` - Page translations (namespace = filename)
- `src/content/common/navigation.json` - Multi-locale nav labels with nested mega menu support

**Adding a new page checklist**:
1. Create `src/content/pt/nova-pagina.json` (+ en/es/fr copies)
2. Import in `src/i18n.ts` resources object: `import ptNovaPagina from './content/pt/nova-pagina.json'`
3. Add namespace to `ns` array and `resources.pt['nova-pagina']` mapping
4. In component: `const { t } = useTranslation('nova-pagina');` then `t('hero.title')`

**Navigation entries** in `navigation.json` support `type: 'link' | 'mega'` (dropdown with descriptions).

### 3. Theme System (Boteco Custom Brand Colors)
Uses **dual theming** with CSS variables in `src/globals.css`:
- **Boteco brand colors**: `boteco-primary`, `boteco-secondary`, `boteco-tertiary`, `boteco-neutral` (+ `-foreground` pairs)
- **shadcn semantic tokens**: `background`, `foreground`, `primary`, `card`, etc. (mapped to Boteco colors)
- **Dark mode**: `:root` vs `.dark` classes swap HSL values. All colors are CSS vars - **never hardcode hex/rgb**.

```tsx
// ✅ Correct - uses theme variables
<div className="bg-boteco-primary text-boteco-primary-foreground">

// ❌ Wrong - hardcoded color breaks dark mode
<div style={{ backgroundColor: '#9b1d5a' }}>
```

**ThemeProvider** uses `disableTransitionOnChange={true}` to prevent flash - don't override.

### 4. Component Architecture & Imports
**Pre-installed - DO NOT reinstall**:
- **shadcn/ui**: `src/components/ui/` - Import as `@/components/ui/button`. Never edit these files.
- **React Bits**: `src/components/reactbits/` - Marketing sections (Hero, FeatureGrid, Stepper, etc.)

**Marketing page pattern** (`src/pages/MenuDigital.tsx` example):
```tsx
import MarketingPageTemplate from '@/components/templates/MarketingPageTemplate';

const MenuDigital = () => <MarketingPageTemplate translationNamespace="menu-digital" />;
```

**MarketingPageTemplate** auto-renders Hero → Benefits → Workflow → Highlights → CTA from i18n JSON structure.

### 5. Data Persistence Strategy (`src/lib/storage/`)
Hybrid approach for dev/prod environments:
- **Dev mode**: Writes to localStorage (immediate persistence)
- **Production**: Reads from `/public/data/*.json` (static hosting)

**Example** (`src/lib/storage/contactRequests.ts`):
```typescript
// Tries remote fetch, falls back to localStorage cache
export const getContactRequests = async (): Promise<ContactRequest[]> => {
  try {
    const remote = await fetchRemoteRequests();
    writeToLocalStorage(remote);
    return remote;
  } catch (error) {
    return readFromLocalStorage();
  }
};
```

**Pattern**: Functions named `get*`, `create*`, `calculate*Metrics` with full TypeScript interfaces.

### 6. Optional Features via Environment
**Clerk Auth**: Conditionally rendered based on `hasClerkAuth` from `src/utils/clerk.ts`:
```tsx
import { hasClerkAuth } from '@/utils/clerk';

{hasClerkAuth && <SignedIn><UserButton /></SignedIn>}
```

App gracefully degrades without `VITE_CLERK_PUBLISHABLE_KEY` - never assume auth is present.

## Development Workflows

### Adding a New Page
1. Create route in `src/App.tsx` under `/:locale` wrapper:
   ```tsx
   <Route path="nova-pagina" element={<NovaPagina />} />
   ```
2. Create page component in `src/pages/NovaPagina.tsx`
3. Add i18n files: `src/content/{pt,en,es,fr}/nova-pagina.json`
4. Update `src/i18n.ts`: import JSON + add to `resources` object + add to `ns` array
5. (Optional) Add nav entry to `src/content/common/navigation.json`

### Running & Testing
```bash
pnpm dev              # Dev server on localhost:8080
pnpm build            # Production build
pnpm build:dev        # Development build (for debugging)
pnpm test             # Node.js test runner (tests/*.test.mjs)
pnpm test:visual      # Playwright visual regression tests
pnpm test:visual:ui   # Interactive Playwright UI mode
pnpm lint             # ESLint with TypeScript
```

### Testing Philosophy
- **Unit tests** (`tests/*.test.mjs`): Node.js native runner (NOT Jest)
  - Content structure validation (JSON schemas)
  - Theme configuration correctness
  - Data flow integrity
- **Visual tests** (`tests/visual/*.spec.ts`): Playwright
  - Cross-browser screenshot comparisons (Chromium, Mobile)
  - Layout shift detection (CLS < 0.1)
  - Accessibility audits (Lighthouse score ≥ 90)

**CI/CD**: All PRs trigger automated linting, tests, builds, Lighthouse audits, and visual regression checks.

## Common Pitfalls

1. **Breaking locale routing**: URLs without `/:locale` prefix will 404. Always test nav links after changes.

2. **Theme transitions flashing**: `ThemeProvider` uses `disableTransitionOnChange={true}` - don't override.

3. **Clerk auth assumptions**: App degrades gracefully without `VITE_CLERK_PUBLISHABLE_KEY`. Always check `hasClerkAuth`.

4. **Reinstalling shadcn/ui**: All components already installed in `src/components/ui/`. Never run `shadcn add` again.

5. **Missing i18n namespaces**: If text doesn't appear, ensure namespace is imported in `src/i18n.ts` AND added to `ns` array.

6. **Skeleton loaders jumping**: Always provide explicit width/height. Don't rely on parent container dimensions.

## Utility Functions

**`cn()` (src/lib/utils.ts)**: Merge Tailwind classes with conflict resolution
```tsx
className={cn("base-classes", conditional && "extra-class", props.className)}
```

**`resolveHref()` (Header.tsx)**: Build locale-aware URLs from navigation items
```tsx
resolveHref({ href: "/sobre", localeAware: true }) // → "/pt/sobre"
```

## Key Files Reference
- **Routing**: `src/App.tsx`
- **i18n Setup**: `src/i18n.ts`
- **Theme Config**: `src/globals.css` (CSS vars), `tailwind.config.ts`
- **Component Registry**: `components.json` (includes @react-bits registry)
- **Navigation**: `src/content/common/navigation.json`
- **Type Definitions**: `src/types/navigation.ts`, `src/types/marketing-page.ts`

## Design System Principles
- **Spacing**: Use Tailwind spacing scale (4px base). Common: `gap-4`, `p-6`, `mt-8`
- **Typography**: Body text should be `text-boteco-neutral` or `text-foreground`
- **Responsive**: Mobile-first with `useIsMobile()` hook for JS-based decisions
- **Accessibility**: All interactive elements need `focus-visible:ring-2` for keyboard nav
- **Transitions**: Always include `transition-colors duration-300` on theme-aware elements

---

**Last Updated**: 2025-11-01  
**See also**: `AGENTS.md`, `docs/VISUAL_TESTING.md`, `README.md`
