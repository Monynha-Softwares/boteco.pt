# Environment Setup Guide

## Environment Variables

This project uses **Vite** (not Next.js), so environment variables must be prefixed with `VITE_`.

### Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your Clerk credentials to `.env`:
   ```bash
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   VITE_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
   ```

### Available Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | No | Clerk publishable key for authentication (app works without it) |
| `VITE_CLERK_FRONTEND_API_URL` | No | Clerk frontend API URL |

### Important Notes

- ✅ **Vite uses `VITE_` prefix**, not `NEXT_PUBLIC_` (Next.js) or `REACT_APP_` (Create React App)
- ✅ Clerk authentication is **optional** - the app gracefully degrades if keys are missing
- ❌ **Never commit `.env` files** to version control (already in `.gitignore`)
- ❌ `CLERK_SECRET_KEY` should **never** be used in frontend code (server-side only)

### Getting Clerk Keys

1. Sign up at [https://clerk.com](https://clerk.com)
2. Create a new application
3. Go to **API Keys** section
4. Copy the **Publishable Key** (safe for frontend)
5. **Never use** the Secret Key in frontend code

### Verification

To verify your environment is set up correctly:

```bash
# Start dev server
bun dev

# Check browser console - should see i18n loaded, no Clerk errors
```

If Clerk keys are missing, you'll see:
```
⚠️ Missing Publishable Key from Clerk. Rendering without authentication.
```

This is **normal and expected** if you're not using authentication features.
