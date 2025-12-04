# Environment Setup Guide

## Environment Variables

This project uses **Vite** (not Next.js), so environment variables must be prefixed with `VITE_`.

### Quick Setup

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

2.  (Optional) Add your Clerk credentials to `.env`:
    ```bash
    VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
    VITE_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
    ```

3.  Add your Supabase credentials to `.env`:
    ```bash
    VITE_SUPABASE_URL=your_supabase_url_here
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
    ```

### Available Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | No | Clerk publishable key for authentication (app works without it) |
| `VITE_CLERK_FRONTEND_API_URL` | No | Clerk frontend API URL |
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Your Supabase public (anon) key |
| `VITE_PROVISIONAL_REDIRECT` | No | If set to `true` at build-time, the app redirects likely-authenticated users to [https://painel.boteco.pt](https://painel.boteco.pt). **This is a build-time flag** |

### Important Notes

-   ✅ **Vite uses `VITE_` prefix**, not `NEXT_PUBLIC_` (Next.js) or `REACT_APP_` (Create React App)
-   ✅ Clerk authentication is **optional** - the app gracefully degrades if keys are missing
-   ✅ Supabase keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are **required** for database and auth functionality.
-   ❌ **Never commit `.env` files** to version control (already in `.gitignore`)
-   ❌ `CLERK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` should **never** be used in frontend code (server-side/Edge Functions only)

### Getting Clerk Keys

1.  Sign up at [https://clerk.com](https://clerk.com)
2.  Create a new application
3.  Go to **API Keys** section
4.  Copy the **Publishable Key** (safe for frontend)
5.  **Never use** the Secret Key in frontend code

### Getting Supabase Keys

1.  Sign up at [https://supabase.com](https://supabase.com)
2.  Create a new project
3.  Go to **Project Settings > API**
4.  Copy the **Project URL** and **anon (public) key**
5.  **Never use** the `service_role` key in frontend code

### Verification

To verify your environment is set up correctly:

```bash
# Start dev server
bun dev

# Check browser console - should see i18n loaded, no Clerk errors (if not using Clerk), and no Supabase client errors.
```

If Clerk keys are missing, you'll see:

```text
⚠️ Missing Publishable Key from Clerk. Rendering without authentication.
```

This is **normal and expected** if you're not using authentication features.