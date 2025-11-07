# Regenerating Supabase TypeScript types

This document explains how to regenerate the canonical `src/types/database.ts` file from your Supabase project. Follow these steps locally in the repository root.

Prerequisites
- supabase CLI installed (npm i -g supabase or use npx)
- You are logged in: `npx supabase login`
- You have the project ref (or are a member with access)

Steps
1. Link the repository to the Supabase project (only required once per repo):

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
```

2. Generate TypeScript types and write them to the canonical location:

```powershell
npx supabase gen types typescript --linked > src/types/database.ts
```

3. Run the build and tests to validate the generated types:

```powershell
pnpm build
pnpm test
```

4. If everything passes, commit and push the generated file. Example commit message:

```
chore(types): regenerate supabase Database types
```

Notes
- The generator output is deterministic for the same database schema and Supabase CLI version. If you update the DB schema, regenerate the types and run tests before committing.
- If the CLI reports "Cannot find project ref", ensure you ran `supabase link` and that the CLI is authenticated.
- If you prefer CI-based regeneration, consider adding an automation step that runs the generator and opens a PR when DB migrations change.
