# Boteco.pt - AI Agent Instructions

## Project Overview

**Boteco.pt** is a multilingual (pt/en/es/fr) React SPA for restaurant management built with modern web technologies. The application provides a complete platform for restaurants with features like digital menus, supplier management, loyalty programs, event management, and integrations.

## Tech Stack

### Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.3.4 with SWC (fast compilation)
- **Routing**: React Router v6 with locale-aware routing
- **State Management**: TanStack Query v5 with localStorage fallback
- **Styling**: Tailwind CSS 3.4 + CSS Variables
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Animations**: Framer Motion + Embla Carousel
- **i18n**: i18next + react-i18next
- **Theme**: next-themes (dark/light mode)
- **Forms**: react-hook-form + zod validation
- **Auth**: Clerk (optional, feature-flagged)
- **SEO**: react-helmet-async

### Development Tools
- **Package Manager**: pnpm 10+
- **Testing**: Node.js native test runner + Playwright
- **Linting**: ESLint with TypeScript
- **CI/CD**: GitHub Actions (linting, tests, Lighthouse, visual regression)
- **Deployment**: Docker (multi-stage build with nginx)

## Project Structure

### Source Code (`src/`)

#### Core Files
- **`main.tsx`** - Application entry point with providers setup
- **`App.tsx`** - Route configuration with lazy loading
- **`i18n.ts`** - i18next configuration and translations import
- **`globals.css`** - Global styles and CSS variables (Boteco brand colors)

#### Components (`src/components/`)
- **`Layout.tsx`** - Main layout wrapper (Header + Footer)
- **`LocaleWrapper.tsx`** - Locale sync wrapper for routes
- **`Header.tsx`** - Navigation with mega menu support
- **`Footer.tsx`** - Footer with links and branding
- **`ThemeProvider.tsx`** - Dark/light mode provider
- **`ThemeToggle.tsx`** - Theme switcher component
- **`Seo.tsx`** - SEO meta tags component
- **`ScrollToTop.tsx`** - Auto-scroll on route change

##### Home Section Components (`src/components/home/`)
Specialized components for the homepage:
- `HeroSection.tsx`, `FeaturesSection.tsx`, `SolutionsSection.tsx`
- `PlansSection.tsx`, `TestimonialsSection.tsx`, `FaqSection.tsx`
- `PlatformCarouselSection.tsx`, `EcosystemCtaSection.tsx`, `FinalCtaSection.tsx`

##### React Bits (`src/components/reactbits/`)
Pre-built marketing components from @react-bits registry:
- `Hero.tsx`, `FeatureGrid.tsx`, `Stepper.tsx`, `Faq.tsx`
- `PricingTable.tsx`, `TestimonialCarousel.tsx`, `AnimatedSection.tsx`

##### Templates (`src/components/templates/`)
- **`MarketingPageTemplate.tsx`** - Reusable template for solution pages
  - Auto-renders: Hero → Benefits → Workflow → Highlights → CTA
  - Driven by i18n JSON structure

##### UI Components (`src/components/ui/`)
**DO NOT EDIT** - shadcn/ui components (50+ components):
- All Radix UI primitives styled with Tailwind CSS
- Import as needed: `@/components/ui/{component}`
- To customize, create new components wrapping these

#### Pages (`src/pages/`)
- **`Home.tsx`** - Landing page with all sections
- **`About.tsx`** - About page
- **`Contact.tsx`** - Contact form with TanStack Query
- **`Blog.tsx`** - Blog listing
- **`BlogPost.tsx`** - Individual blog post
- **`Painel.tsx`** - Dashboard (auth-protected if Clerk enabled)
- **Solution Pages**: `MenuDigital.tsx`, `Fornecedores.tsx`, `Fidelidade.tsx`, `Eventos.tsx`, `Integracoes.tsx`
- **Legal**: `legal/PrivacyPolicy.tsx`, `legal/TermsOfService.tsx`
- **`NotFound.tsx`** - 404 page

#### Content (`src/content/`)
**Zero hardcoded strings** - all text in JSON files:
- **`common/navigation.json`** - Multi-locale navigation with mega menu support
- **`{pt,en,es,fr}/{page}.json`** - Page translations organized by locale
- Each page has its own namespace matching filename

#### Library (`src/lib/`)
- **`utils.ts`** - Utility functions (`cn()` for class merging)
- **`blog.ts`** - Blog post utilities
- **`storage/`** - Data persistence layer
  - `contactRequests.ts` - Contact form data management
  - Hybrid approach: reads from JSON, writes to localStorage

#### Hooks (`src/hooks/`)
- **`use-mobile.tsx`** - Responsive breakpoint detection
- **`use-localized-path.ts`** - Build locale-aware URLs
- **`use-toast.ts`** - Toast notifications

#### Types (`src/types/`)
- **`marketing-page.ts`** - Marketing page template types
- **`navigation.ts`** - Navigation structure types

#### Utils (`src/utils/`)
- **`clerk.ts`** - Clerk auth feature flag
- **`toast.ts`** - Toast helper functions

### Tests (`tests/`)

#### Unit Tests (`*.test.mjs`)
Node.js native test runner validates:
- **`blogPosts.test.mjs`** - Blog post structure
- **`contactContent.test.mjs`** - Contact page content
- **`contactRequests.test.mjs`** - Data flow integrity
- **`homeSections.test.mjs`** - Homepage section validation
- **`theme.test.mjs`** - Theme configuration correctness

#### Visual Tests (`visual/*.spec.ts`)
Playwright cross-browser tests:
- **`homepage.spec.ts`** - Homepage layout and grid alignment
- **`sidebar.spec.ts`** - Sidebar component visual regression
- **`accessibility.spec.ts`** - Accessibility compliance

### Documentation (`docs/`)
- **`DOCKER_DEPLOYMENT.md`** - Comprehensive Docker deployment guide
- **`DOCKER_TROUBLESHOOTING.md`** - Common Docker issues and solutions
- **`ENVIRONMENT_SETUP.md`** - Environment variable configuration
- **`PERFORMANCE_OPTIMIZATIONS.md`** - Performance tuning details
- **`PERFORMANCE_SUMMARY.md`** - Performance metrics overview
- **`VISUAL_TESTING.md`** - Visual regression testing guide

## Critical Architecture Patterns

### 1. Locale-First Routing
**All routes MUST be under `/:locale` wrapper** (except `/painel`):
```tsx
// src/App.tsx
<Route path="/:locale" element={<LocaleWrapper />}>
  <Route path="nova-pagina" element={<NovaPagina />} />
</Route>
```
- Root `/` redirects to `/pt`
- URLs without locale (e.g., `/about`) will 404 → use `/pt/sobre`
- `LocaleWrapper` syncs URL param with i18next

### 2. i18n Content System
**Namespace = filename pattern**:
```typescript
// src/i18n.ts
import ptNovaPagina from './content/pt/nova-pagina.json'

resources: {
  pt: { 'nova-pagina': ptNovaPagina },
  // ... other locales
}

ns: ['home', 'about', 'nova-pagina', ...] // Add to array!
```

**In component**:
```tsx
const { t } = useTranslation('nova-pagina');
const title = t('hero.title');
```

### 3. Theme System (Boteco Brand Colors)
**CSS variables only** - never hardcode colors:
```tsx
// ✅ Correct
<div className="bg-boteco-primary text-boteco-primary-foreground">

// ❌ Wrong - breaks dark mode
<div style={{ backgroundColor: '#9b1d5a' }}>
```

**Color Palette** (see `src/globals.css`):
- `boteco-primary` - Burgundy (#9b1d5a / #e0528c dark)
- `boteco-secondary` - Orange (#d77124 / #ea954c dark)
- `boteco-tertiary` - Cream (#f2e8d0 / #322822 dark)
- `boteco-neutral` - Dark brown (#3d2919 / #f2e8d0 dark)

### 4. Marketing Page Template Pattern
For solution pages (menu-digital, fornecedores, etc.):
```tsx
// src/pages/MenuDigital.tsx
import MarketingPageTemplate from '@/components/templates/MarketingPageTemplate';

const MenuDigital = () => (
  <MarketingPageTemplate translationNamespace="menu-digital" />
);
```
JSON structure matches `types/marketing-page.ts` interfaces.

### 5. Data Persistence Strategy
Hybrid approach (dev + production):
```typescript
// src/lib/storage/contactRequests.ts
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

### 6. Optional Feature Flags
**Clerk auth is optional**:
```tsx
import { hasClerkAuth } from '@/utils/clerk';

{hasClerkAuth && <SignedIn><UserButton /></SignedIn>}
```

## Development Workflow

### Adding a New Page

1. **Create route** in `src/App.tsx`:
   ```tsx
   <Route path="/:locale" element={<LocaleWrapper />}>
     <Route path="nova-pagina" element={<NovaPagina />} />
   </Route>
   ```

2. **Create component** in `src/pages/NovaPagina.tsx`

3. **Add translations** in `src/content/{pt,en,es,fr}/nova-pagina.json`

4. **Update i18n** in `src/i18n.ts`:
   - Import JSON files for all locales
   - Add to `resources` object
   - Add `'nova-pagina'` to `ns` array

5. **(Optional) Add navigation** in `src/content/common/navigation.json`

### Component Guidelines

- **Use shadcn/ui**: Import from `@/components/ui/` - DO NOT edit these
- **Tailwind first**: Use utility classes, not inline styles
- **Responsive**: Mobile-first with `useIsMobile()` hook
- **Accessibility**: Include `focus-visible:ring-2` on interactive elements
- **Theme-aware**: Use CSS variables, add `transition-colors duration-300`
- **i18n**: No hardcoded strings - use `useTranslation()` hook

### Styling Conventions

```tsx
// Spacing: Tailwind 4px base
className="gap-4 p-6 mt-8"

// Typography: Use theme colors
className="text-boteco-neutral dark:text-boteco-neutral"
// Or semantic tokens
className="text-foreground"

// Layout: Container patterns
className="container mx-auto px-4 py-16"

// Cards: Use depth variables
className="bg-depth-surface dark:bg-depth-elevated"
```

## Essential Commands

```bash
# Development
pnpm dev              # Dev server on localhost:8080
pnpm build            # Production build with chunk splitting
pnpm build:dev        # Development build (for debugging)
pnpm preview          # Preview production build

# Testing
pnpm test             # Node.js unit tests
pnpm test:visual      # Playwright visual regression
pnpm test:visual:ui   # Interactive Playwright UI
pnpm lint             # ESLint with TypeScript

# Docker
.\docker-build.ps1    # Windows automated build
./docker-build.sh     # Linux/Mac automated build
docker-compose up -d  # Start with compose
```

## Common Pitfalls

1. **Locale routing**: URLs without `/:locale` will 404
2. **Missing i18n namespace**: Must import in `i18n.ts` AND add to `ns` array
3. **Theme flash**: Don't override `ThemeProvider` `disableTransitionOnChange={true}`
4. **Hardcoded colors**: Use CSS vars, never hex/rgb values
5. **Editing shadcn/ui**: Don't edit `src/components/ui/` - create wrappers
6. **Environment vars**: Must use `VITE_` prefix, not `NEXT_PUBLIC_` or `REACT_APP_`

## Key Files Reference

- **Routing**: `src/App.tsx`
- **i18n Setup**: `src/i18n.ts`
- **Theme Config**: `src/globals.css`, `tailwind.config.ts`
- **Navigation**: `src/content/common/navigation.json`
- **Type Definitions**: `src/types/`
- **Component Registry**: `components.json` (includes @react-bits)

## Available Packages & Libraries

### Pre-installed - DO NOT REINSTALL
- ✅ **All shadcn/ui components** (`src/components/ui/`)
- ✅ **All Radix UI primitives**
- ✅ **lucide-react** for icons
- ✅ **React Bits** marketing components
- ✅ **Framer Motion** for animations
- ✅ **TanStack Query** for data fetching
- ✅ **react-hook-form + zod** for forms
- ✅ **Clerk** for authentication (optional)

### Custom Registries
- `@react-bits` - Marketing component registry (see `components.json`)

## Design System

- **Spacing**: `gap-4`, `p-6`, `mt-8` (4px base scale)
- **Typography**: `text-boteco-neutral` or `text-foreground`
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Containers**: `container mx-auto px-4`
- **Transitions**: `transition-colors duration-300`
- **Focus States**: `focus-visible:ring-2 focus-visible:ring-boteco-primary`

## Documentation Reference

- **AI Instructions**: `.github/copilot-instructions.md` (concise version)
- **Full Guide**: This file (`AGENTS.md`)
- **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- **Docker Deployment**: `docs/DOCKER_DEPLOYMENT.md`
- **Performance**: `docs/PERFORMANCE_OPTIMIZATIONS.md`
- **Visual Testing**: `docs/VISUAL_TESTING.md`
- **Main README**: `README.md`

---

**Last Updated**: November 7, 2025  
**Project**: Boteco.pt  
**Status**: Production Ready ✅
