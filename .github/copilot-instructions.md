## Quick context

- This repo is a starter SaaS using Next.js 15 App Router (frontend) + Convex (backend / serverless functions and DB) + Clerk (authentication + billing). See `README.md` for full details.
- Convex serverless code lives in `convex/`—schema in `convex/schema.ts`, functions in `convex/*.ts`, and HTTP/webhook routing in `convex/http.ts`.
- Frontend uses `app/` (Next 15 App Router), `components/` for UI and providers, and `middleware.ts` for route protection.

## Big-picture architecture

- Frontend (Next.js 15) talks to Convex using `ConvexReactClient` via `components/ConvexClientProvider.tsx` (requires `NEXT_PUBLIC_CONVEX_URL`).
- Clerk handles auth and billing; signed webhooks are handled in `convex/http.ts` (svix) and are saved via internal Convex mutations.
- Convex functions follow file-based routing; use `api` for public functions and `internal` for internal/private functions (see `convex/_generated/api.ts`).
- Convex schema and indexes are defined in `convex/schema.ts`. Use indexes in queries via `.withIndex()` rather than `.filter()` to avoid table scans.

## Key developer workflows (commands)

- Local frontend dev: `npm run dev` (uses Next/Turbopack). Keep a terminal for this.
- Run Convex locally (must run alongside frontend): `npx convex dev`.
- Build and run production locally: `npm run build` then `npm start`.
- Linting: `npm run lint`.
- Convex CLI: `npx convex <command>` (deploy, dev, docs). The repo includes `convex/README.md` with examples.

## Env variables & setup to test features

- Copy `.env.example` to `.env.local` and set the values described in `README.md` (notably `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`, and Clerk variables).
- Convex environment variables like `CLERK_WEBHOOK_SECRET` must be also set in the Convex dashboard for deployed runtimes.
- If `NEXT_PUBLIC_CONVEX_URL` is missing, `ConvexClientProvider.tsx` throws—so tests & run commands must include this var.

## Convex function & data conventions (important)

- Always use the new function syntax with validators (`query`, `mutation`, `action`, `internalQuery`, `internalMutation`, `internalAction`) located in `convex/_generated/server`.
- Include runtime validators (v.*) for args and returns. Use `returns: v.null()` for functions that return nothing.
- Use `internal*` functions for private logic; use `api.*` for public API functions.
- Query patterns:
  - Use `.withIndex()` and `.order()` to avoid table scans.
  - Use `.paginate()` for cursor-based pagination when appropriate.
  - Avoid `.filter()` in queries—create indexes in `convex/schema.ts` instead.
- Mutation patterns:
  - Use `ctx.db.insert`, `ctx.db.patch`, `ctx.db.replace` (read docs for expected behavior).
  - Example: `internal.users.upsertFromClerk` updates user records from Clerk webhook events (see `convex/users.ts`).
- Actions:
  - Add `"use node";` at the top if using Node.js built-ins.
  - Actions DO NOT have `ctx.db` access; use `internalMutation`/`internalQuery` for DB access.

## Webhooks & integrations

- Clerk webhook verification uses `svix` in `convex/http.ts`. Use the `validateRequest()` pattern (headers, payload, verify) to handle webhook events.
- Payment webhooks are transformed using `convex/paymentAttemptTypes.ts` before saving via `internal.paymentAttempts.savePaymentAttempt`.
- When adding new webhook types, extend `validateRequest()` and add handlers (e.g., new `case` in the switch) referencing `internal.*` functions.

## Naming & schema patterns

- `users` table uses `externalId` for Clerk's user ID, indexed by `byExternalId`. Link payment attempts to `users` by `_id`.
- `paymentAttempts` schema is defined in `convex/paymentAttemptTypes.ts` and referenced in schema as `paymentAttemptSchemaValidator`.
- Include indexes for any fields used in queries; index names include the fields, e.g., `byUserId`, `byPaymentId`.

## UI & frontend patterns

- Use `components/` for shared UI and providers:
  - `ConvexClientProvider.tsx` sets up the Convex client with Clerk support
  - `custom-clerk-pricing.tsx` demonstrates Clerk Billing UI customization.
- App Router pages: landing views in `app/(landing)/` and dashboard in `app/dashboard/`.
- `middleware.ts` uses `clerkMiddleware` and `createRouteMatcher()` to protect `/dashboard(.*)` routes.

## Examples & quick references to copy

- Insert & upsert user from Clerk webhook: `convex/users.ts` - use `internalMutation` and `userByExternalId(ctx, externalId)` to find and patch or insert.
- Payment attempts: `convex/paymentAttempts.ts` - use `paymentAttemptDataValidator` from `paymentAttemptTypes.ts` for validation.
- HTTP webhook: `convex/http.ts` - follow `svix` header validation + `ctx.runMutation(internal.*...)` call pattern.

## What AI agents must never do

- Do not bypass validators—every new Convex function requires validators for args & returns.
- Do not use `ctx.db` in actions (Actions don't have DB access).
- Do not register sensitive internal operations as `query`/`action`—use `internal*` methods.

## When adding tests or features

- Add unit tests for new backend logic where possible (Convex functions should be covered by calling `npx convex dev` and integration checks).
- Add new pages under `app/` and new components under `components/` with clear folder names and headless UI patterns (shadcn/Radix).
- Update `convex/schema.ts` when adding new data fields or indexes; run `npx convex dev` to test schema changes locally.

## Useful files to inspect

- `README.md` - project setup and instructions
- `convex/schema.ts` - DB schema & index configuration
- `convex/http.ts` - webhook handling patterns (svix) and routing
- `convex/users.ts` - user sync patterns from Clerk webhooks
- `convex/paymentAttempts.ts` - payment handling & validators
- `components/ConvexClientProvider.tsx` - client setup requiring env vars
- `middleware.ts` - route protection and Clerk usage
- `.cursor/rules/convex_rules.mdc` - local Convex conventions (read & follow)

## Final note
- Keep the project’s structure (App Router + Convex + Clerk) in mind: UI updates live in `app/`/`components/`, server code in `convex/`; use validators and generated `api`/`internal` references. If unsure, reference `convex_rules.mdc` and `convex/README.md` and the `convex/*.ts` examples in this repo.

---
Please review this file and tell me whether anything is unclear or missing; I'll iterate on examples/caveats you want added.