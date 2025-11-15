# Plano de Personalização - boteco.pt (Next.js 15 App Router)

Este documento é a versão consolidada do plano de personalização incremental do template Next.js para o projeto `boteco.pt`.
Ele contém: fases, tarefas atômicas, critérios de aceite (DoD), garantias de teste obrigatórias e observações técnicas (incluindo integração Convex).

---

## Resumo / Regras Obrigatórias

- Stack: Next.js 15 (App Router, TS), Tailwind v4 + shadcn/ui, Clerk (auth), Convex/Supabase (leads), i18n com conteúdo default em pt-BR e rotas em inglês.
- Regras de i18n: rotas sempre em inglês; idioma controlado via Provider; `lang="pt-BR"` padrão no HTML; `LanguageSwitcher` apenas troca locale.
- Escopo removido: `Eventos` e `Fidelidade` removidos por completo — sem páginas, seções, i18n keys, menus, etc.
- Design System: usar tokens CSS `--boteco-*` e tokens `depth.*`, `sidebar.*`, `container` no Tailwind; `app/globals.css` como fonte.
- Devs: todo PR pequeno e revisável; testes obrigatórios (unit, component, E2E) dependendo do impacto.

---

# Fase 1 – Design System & Base do layout

Objetivo: preparar a base tokens, layout e i18n skeleton. PRs pequenos e independentes.

Tarefa 1.1 – Configurar design tokens Boteco no Tailwind
- Resumo: mapear variáveis CSS em `globals.css` para tokens e expor em `tailwind.config.ts`.
- Arquivos: `app/globals.css`, `tailwind.config.ts`, `tests/design-tokens.test.mjs`.
- Checklist:
  - `--boteco-*`, `--depth-*`, `--sidebar-*`, `--container` definidos em `globals.css`.
  - `tailwind.config.ts` tem `boteco.*`, `depth.*`, `sidebar.*`, `container`.
  - `tests/design-tokens.test.mjs` atualizado para checar tokens.
- DoD:
  - `pnpm dev` e `pnpm build` sem erros.
  - `pnpm test` passa com validação dos tokens.
- Testes obrigatórios: Node unit test (design tokens) + manual visual sanity.

Tarefa 1.2 – Base do layout & i18n skeleton
- Resumo: Definir `lang="pt-BR"` em `app/layout.tsx`, criar `LanguageProvider` e skeleton de `locales`.
- Arquivos: `app/layout.tsx`, `components/LanguageProvider.tsx`, `locales/{pt-BR,en}.json`.
- Checklist:
  - `<html lang="pt-BR">` e `LanguageProvider` adicionado à árvore do layout.
  - Testes: `tests/layout.test.mjs` e `tests/language-provider.test.mjs` existentes.
- DoD:
  - `pnpm dev` & `pnpm test` OK.
  - `LanguageProvider` expõe `locale` e `setLocale`.
- Testes: Node unit tests para provider e layout.

Tarefa 1.3 – Baseline test infra
- Resumo: Garantir que runner de tests e scripts `pnpm test`, `pnpm test:unit` e `pnpm test:e2e` (quando Playwright estiver configurado) existem.
- Arquivos/áreas: `package.json` (scripts), `README.md` (dev instructions), dev-deps `vitest`/`playwright` (sugestão).
- DoD: smoke test `pnpm test` & `pnpm dev` rodando.

---

# Fase 2 – Navegação & i18n

Objetivo: Header, footer, links em inglês, LanguageSwitcher e i18n strings.

Tarefa 2.1 – Header (sem lógica auth)
- Resumo: Implementar navegação com rotas em inglês e labels com i18n.
- Arquivos: `app/(landing)/header.tsx`, `components/LanguageSwitcher.tsx`.
- Checklist:
  - Todos links em inglês (`/`, `/about`, `/contact`, `/blog`, `/solutions`).
  - Labels traduzíveis via `LanguageProvider`.
  - Sem referência a eventos/fidelidade.
- DoD: component unit test; renderização sem crashes.
- Garantias: Unit + component test.

Tarefa 2.2 – Footer (links & legal)
- Resumo: Footer atualiza links (inclui `/legal/privacy`, `/legal/terms`) e usa i18n.
- Arquivos: `app/(landing)/footer.tsx`, `locales/*`.
- Checklist: English routes, `legal` links; tests.
- DoD: footer tests pass; no eventos/fidelidade em links.

Tarefa 2.3 – LanguageSwitcher
- Resumo: Dropdown or segmented control switch locale (pt-BR / en) without changing pathname; integration to `LanguageProvider`.
- Arquivos: `components/LanguageSwitcher.tsx`, `components/LanguageProvider` (extend as needed).
- Checklist:
  - Toggle updates `locale` in provider and re-renders texts.
  - The route doesn’t change.
- DoD: passes component tests and E2E smoke (toggle persists in UI only).
- Tests: Unit tests + integration test for header+switcher.

Pre-condição para Fase 2: Fase 1 concluída.

---

# Fase 3 – Landing pages: Home, About, Contact & Blog

Objetivo: Implementar páginas institucionais e o formulário de contato (mockado), blog (list & details).

Tarefa 3.1 – Home (Hero, Benefits, Solutions, etc.)
- Resumo: Implementar seções conforme a ordem solicitada: hero → benefits → solutions overview → how-it-works → pricing → app carousel → testimonials → FAQ → CTA.
- Arquivos: `app/(landing)/page.tsx` e novos components.
- Checklist:
  - All sections implemented with i18n keys in `locales/pt-BR.json` and `en.json`.
  - No references a eventos/fidelidade.
- DoD: UI renders, mobile/desktop verified; unit & E2E tests.
- Tests: Unit for components; Playwright smoke: loads home and clicks CTA.

Tarefa 3.2 – About
- Resumo: `/about` com hero, missão, valores, parceiros.
- DoD: i18n present; tests pass.

Tarefa 3.3 – Contact (form) – Mock integration
- Resumo: Implementar `Contact` com `zod` + `react-hook-form` validation; integrate with Convex/Supabase as mocked endpoint first.
- Arquivos: `app/contact/page.tsx`, `components/forms/contact-form.tsx`, `convex/*` stub or `app/api/leads/route.ts`.
- Checklist:
  - Fields: name, email, phone, establishment name, city/state, plan interest, message.
  - Validation + loading/success/error states.
  - Use `ctx.runMutation(internal.leads.create)` or temporary API route mock.
- DoD: unit tests for validation; E2E: send a lead and assert a success state.

Tarefa 3.4 – Blog Listing & Post
- Resumo: Implement `/blog` grid and `/blog/[slug]` detail with `generateMetadata`.
- Files: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `lib/blog-utils.ts`.
- Checklist: read-time helper unit test, SEO metadata tests.

Pre-condição Fase 3: Fases 1 e 2 done.

---

# Fase 4 – Solutions pages & sanitize events/fidelidade

Tarefa 4.1 – Solutions Overview & detail pages
- Resumo: `/solutions` overview & three detail pages: `/solutions/digital-menu`, `/solutions/suppliers`, `/solutions/integrations`.
- Checklist: Each page with hero, feature grid, stepper, CTA; i18n strings.
- DoD: tests pass; no events/fidelidade.

Tarefa 4.2 – Sanitize content (events/fidelidade)
- Resumo: Remove residual references to `Eventos` or `Fidelidade` (search & delete).
- Checklist:
  - grep repo for `eventos|fidelidade|fidelity|loyalty` and delete; tests to ensure no menu/sections link to them.
- DoD: repo clean (no matches), unit and integration tests pass.

Pre-condição: Fases 1–3 complete.

---

# Fase 5 – Dashboard & Backend Integration (Convex)

Objetivo: Dashboard with mock -> real data via Convex, and secure pages via Clerk.

Tarefa 5.1 – Dashboard baseline (mocked data)
- Resumo: Cards, pipeline statuses, channels, list of recent leads with mock data.
- Files: `app/dashboard/**`, `app/dashboard/data.json`.
- DoD: UI renders and auth gating enforced by `middleware.ts` and Clerk.
- Tests: E2E — login flow and dashboard requires auth.

Tarefa 5.2 – Backend: Convex lead schema & mutations
- Resumo: Add `convex/schema.ts` table for `leads` and `convex/leads.ts` mutations/queries.
- Checklist:
  - `convex/schema.ts` includes `leads` table and relevant indexes.
  - `convex/leads.create` and `convex/leads.list` created with validators.
  - Contact form calls `internal.leads.create` (or `api.leads.create`) after Convex dev is prepared.
- DoD: API compiles with `npx convex build`; local `npx convex dev` pass; tests for mutation behavior.

Tarefa 5.3 – Dashboard: show real Convex data
- Resumo: Replace mock with Convex queries and pagination if needed.
- Tests: integration tests for data flow; E2E verifying lead creation on contact and appearance on dashboard.

Pre-condição Fase 5: Fases 1–4 and Convex basics configured.

---

# Fase 6 – Legal, SEO, Final QA & Tests

Tarefa 6.1 – `legal/privacy` & `legal/terms` pages
- Resumo: Implement legal pages with update dates, i18n keys, accessible layout.
- DoD: Render tests, SEO metadata, no events references.

Tarefa 6.2 – SEO & Metadata
- Resumo: Add `generateMetadata` usage to root pages and blog posts; integrate i18n in metadata.
- DoD: Test metadata generation and localized titles.

Tarefa 6.3 – Playwright E2E & Visual tests
- Resumo: Implement Playwright E2E flows:
  - Home loads & CTA flows;
  - Contact form submit -> mocked lead creation -> dashboard listing (requires Convex dev);
  - Dashboard auth gating test.
- DoD: E2E tests pass in CI for critical flows — required for merge in high-impact PRs.

Tarefa 6.4 – QA & Accessibility sweep
- Resumo: Accessibility checks (color contrast, keyboard nav), mobile/desktop breakpoints.
- DoD: A11y tested and passed; docs updated.

---

# Convex Integration & Scan Findings

### General Convex guidelines (consolidated)
- Always add `args` and `returns` validators for Convex functions; `returns: v.null()` if no output.
- Use `internal*` for server-only logic and `api.*` for public functions.
- Webhooks: validate using `svix` (`convex/http.ts`), call `internal` mutations only.
- Test webhook payloads and transformations via `paymentAttemptTypes.ts`.

### Scan results & fixes already applied
- `convex/users.ts` — added explicit `returns` validators to `current`, `upsertFromClerk`, `deleteFromClerk`.
- `convex/paymentAttempts.ts` — already had `returns: v.null()`.
- `convex/http.ts` — properly uses `httpAction` and `ctx.runMutation(internal.*)` for webhook handling.
- Added `tests/convex-validators.test.mjs` to ensure functions include `returns` validators (excludes `httpAction` by convention).

### Suggested Convex test additions
- Add an integration test for webhook reception to assert `users` and `paymentAttempts` updates.
- Consider adding `npx convex build` step to CI to verify functions compile.

---

## PR Guide & Merge gating (for every PR)
- Include: purpose, files updated, testing steps.
- Must pass `pnpm build`, `pnpm lint`, `pnpm test` (unit), and for high-impact PRs add `pnpm test:e2e` for E2E checks.
- Ensure i18n keys added and no events/fidelity references.

---

## Next Actions
1. Approve / adapt this plan (what we just created) and create the small PRs in the planned order.
2. Implement Phase 2: Header, Footer & LanguageSwitcher (component + tests).
3. Implement Contact form with Convex lead creation flow and integrate to Dashboard.
4. Add Playwright tests for critical flows.

---

## Observations & Tips
- The repository already contains many shadcn/ui, components and Convex code. Follow file-based routing for Convex, use `internal` functions for private logic, and add inline validators to the functions.
- For SSR/CSR mismatch: client-only operations must be in `use client` components; date formatting must use `Intl` with the locale, avoid `Math.random()` in server components.

---

Arquivo criado: `untitled:plan-botecoPersonalizationPlan.prompt.md`.


*** End of Plan ***
