# Boteco.pt - AI Coding Instructions

**Multilingual (pt/en/es/fr) React SPA** for restaurant management: Vite + React 18 + TypeScript + i18next + shadcn/ui + Tailwind CSS.

## Critical Architecture Patterns
## .github/copilot-instructions.md — Boteco.pt (concise)

Purpose: give an AI coding agent exactly the repo-specific rules, patterns and commands needed to be productive immediately.

Key patterns (quick reference)
- Locale-first routing: every public page must be nested under `/:locale` (see `src/App.tsx` and `src/components/LocaleWrapper.tsx`). Exception: `/painel` (admin).
- i18n namespaces: translations live in `src/content/{pt,en,es,fr}/{page}.json` and must be imported/registered in `src/i18n.ts` and added to the `ns` array. Example: add `src/content/pt/menu-digital.json`, import in `i18n.ts` and add `'menu-digital'` to ns.
- Theme/colors: use CSS variables only (defined in `src/globals.css`) — use `bg-boteco-primary`, never inline hex values. `ThemeProvider` uses `disableTransitionOnChange={true}`; preserve it.
- Marketing pages: use `src/components/templates/MarketingPageTemplate.tsx` with prop `translationNamespace` (it renders hero → benefits → workflow → CTA driven by JSON schema in `src/types/marketing-page.ts`).
- Data persistence pattern: development writes to localStorage while production reads static JSON under `public/data/` — see `src/lib/storage/*` (e.g., `contactRequests.ts`).
- Feature flags: Clerk auth is optional; guard with `hasClerkAuth` from `src/utils/clerk.ts`.

Commands / workflows (exact)
- pnpm dev         # start dev server (Vite)
- pnpm build       # production build
- pnpm preview     # preview production build
- pnpm test        # Node.js native unit tests (tests/*.test.mjs)
- pnpm test:visual # Playwright visual regression
- pnpm lint        # ESLint
- Docker (Windows PowerShell): `.\docker-build.ps1`

Where to edit safely
- DO NOT modify `src/components/ui/` (shadcn/ui components). Create wrappers instead.
- Content: add translations under `src/content/{pt,en,es,fr}/` and register them in `src/i18n.ts`.
- New pages: add component in `src/pages/`, add route under `/:locale` in `src/App.tsx`, and create content JSON files for every locale.

Testing & CI notes
- Unit tests validate JSON namespaces, theme tokens, and small logic; run `pnpm test` locally.
- Visual tests use Playwright; changes to marketing templates or layout likely need visual snapshots updates.

Quick examples (copyable)
- Add i18n namespace:
  1. Create `src/content/pt/nova-pagina.json` (and for other locales).
  2. In `src/i18n.ts` import and add to `resources.pt['nova-pagina']` and append `'nova-pagina'` to `ns`.
- Guard Clerk usage:
  import { hasClerkAuth } from '@/utils/clerk';
  {hasClerkAuth && <SignedIn><UserButton /></SignedIn>}

Files to inspect first when debugging
- Routing & locale: `src/App.tsx`, `src/components/LocaleWrapper.tsx`
- i18n config: `src/i18n.ts`
- Theme vars: `src/globals.css`, `tailwind.config.ts`
- Marketing template: `src/components/templates/MarketingPageTemplate.tsx` and `src/types/marketing-page.ts`
- Storage layer: `src/lib/storage/` (hybrid pattern + public data in `public/data/`)
- Feature flags: `src/utils/clerk.ts`
- Tests: `tests/*.test.mjs`, `tests/visual/*`

If anything seems missing or ambiguous here, tell me which day-to-day task you want the agent to optimize for (e.g., add new page, fix i18n, run visual tests) and I will expand the instructions with concrete examples and checks.

### Quick checklists

1) Add a new public page (locale-aware)
   - Create component: `src/pages/NovaPagina.tsx` (use `MarketingPageTemplate` when appropriate).
   - Add route: in `src/App.tsx` under the `/:locale` wrapper add `<Route path="nova-pagina" element={<NovaPagina/>} />`.
   - Add content: create `src/content/{pt,en,es,fr}/nova-pagina.json` (namespace = filename).
   - Register i18n: import each JSON in `src/i18n.ts`, add to `resources.<locale>['nova-pagina']` and append `'nova-pagina'` to the `ns` array.
   - Navigation (optional): update `src/content/common/navigation.json` if the page should appear in nav.
   - Styling: use CSS variables from `src/globals.css` (e.g., `bg-boteco-primary`) and `@/components/ui/*` components for patterns.
   - Tests: update/ add unit tests under `tests/` validating JSON keys if needed (see `tests/*` examples).
   - Visual test (optional): add a Playwright spec under `tests/visual/` that navigates to `/<locale>/nova-pagina` and takes a screenshot.

2) Add or update a Playwright visual test / snapshot
   - Create or edit spec: `tests/visual/my-page.spec.ts` (follow existing tests for viewport and auth mocks).
   - Run tests locally (PowerShell):
     ```powershell
     pnpm test:visual
     ```
   - If a single spec is needed, run Playwright directly (example):
     ```powershell
     npx playwright test tests/visual/my-page.spec.ts
     ```
   - Update snapshots intentionally: re-run with the update flag:
     ```powershell
     npx playwright test -u
     # or if using the script
     pnpm test:visual -- -u
     ```
   - Baseline files & reports: review `playwright-report/` for generated diffs and `test-results/` for saved artifacts.
   - CI notes: visual snapshot updates must be committed and peer-reviewed; avoid blindly updating baselines in PRs.

If you'd like, I can expand any checklist into a runnable mini-guide (files to create, minimal component template, and an example Playwright spec). Which one should I generate first?
  try {
