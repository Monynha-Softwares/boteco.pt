# Convex Integration Guidelines (Boteco Pro)

This document summarizes best practices, constraints, and conventions for integrating Convex into the Boteco Pro project.

## General Rules
- Always use the new function registration API (`query`, `mutation`, `action`, `internalQuery`, `internalMutation`, `internalAction`).
- Include `args` and `returns` validators for all public and internal functions. Use `returns: v.null()` when functions return nothing.
- Use `internal*` functions for private server-side logic. Only use `api.*` functions for public server functions.
- Avoid using `ctx.db` in actions – only use in queries/mutations.
- Use `ctx.runMutation`, `ctx.runQuery` to call other Convex functions – pass a `FunctionReference` (e.g., `api.x.y`, `internal.x.y`).

## Security & Hook Handling
- Webhooks should be verified using `svix` and a secret (`CLERK_WEBHOOK_SECRET`) (see `convex/http.ts`).
- Webhooks should dispatch work to internal mutations only (ex: `internal.users.upsertFromClerk`) to avoid exposing sensitive processes.

## Conventions
- All function definitions should include runtime validators using `v.*` and `returns` validators for clarity and safety.
- Server code should be placed in `convex/` and follow file-based routing. Keep `internal.*` functions private.
- Keep CLI / dev instructions in `convex/README.md`.

## Local Dev / Test Workflow
1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_CONVEX_URL` (for dev, `npx convex dev` recommended), `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_CLERK_*` keys.
3. Run `npx convex dev` to spin up Convex dev server and `pnpm dev` for the Next app.
4. Use `npx convex` commands for deployment, database inspection and logs.

## CI & Tests
- Basic static tests ensure `returns:` validators (see `tests/convex-validators.test.mjs`).
- Add integration tests for: webhook reception (simulate svix payload), mutation paths (create / patch / delete users and payment attempts).
