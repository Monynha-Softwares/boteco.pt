# Local Development Setup - Boteco.pt

This guide walks you through setting up the Boteco.pt project for local development with Clerk authentication.

## Prerequisites

- **Node.js**: 20.18.0+ (specified in `.node-version`)
- **pnpm**: 10.18.3+ (enforced via `packageManager` field)
- **Git**: Latest version

> **Note**: This project uses **pnpm** as the official package manager. Using npm or yarn may cause inconsistencies.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

The project includes a `.env.local` file with Clerk test credentials for local development. If you need to update these:

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Then update with your Clerk credentials from [https://dashboard.clerk.com/](https://dashboard.clerk.com/):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
VITE_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
```

**Note**: The project uses `VITE_` prefix (not `NEXT_PUBLIC_`) because it's built with Vite.

### 3. Start Development Server

```bash
pnpm dev
```

The app will be available at:
- **Local**: http://localhost:8080/
- **Network**: Available on your local network IP

### 4. Test Authentication

1. Navigate to http://localhost:8080/
2. Click on any protected route (e.g., `/painel`)
3. You'll be redirected to `/sign-in`
4. Use Clerk's test mode to create a test account
5. After signing in, you'll be redirected to `/painel`

## Available Scripts

```bash
# Development
pnpm dev              # Start Vite dev server (localhost:8080)
pnpm build            # Production build with code splitting
pnpm build:dev        # Development build (for debugging)

# Preview/Serve
pnpm preview          # Preview build with Vite
pnpm serve            # Serve dist/ with npx serve (port 8080)
pnpm serve:build      # Build and serve in one command

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking without emit

# Testing
pnpm test             # Run Node.js unit tests
pnpm test:visual      # Run Playwright visual regression tests
pnpm test:visual:ui   # Interactive Playwright test UI
pnpm test:visual:update # Update visual regression snapshots

# Utilities
pnpm clean            # Remove dist/ and Vite cache
```

## Project Structure

```
boteco.pt/
├── .env.local              # Local environment variables (gitignored)
├── .env.example            # Environment variables template
├── src/
│   ├── pages/
│   │   ├── SignIn.tsx      # Clerk sign-in page
│   │   ├── SignUp.tsx      # Clerk sign-up page
│   │   └── Painel.tsx      # Protected dashboard
│   ├── main.tsx            # ClerkProvider configuration
│   ├── App.tsx             # Route definitions
│   └── utils/
│       └── clerk.ts        # Clerk feature flag helper
└── package.json
```

## Authentication Flow

### How Clerk is Integrated

1. **Environment Detection** (`src/utils/clerk.ts`):
   ```typescript
   export const hasClerkAuth = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
   ```

2. **Provider Setup** (`src/main.tsx`):
   ```typescript
   <ClerkProvider 
     publishableKey={PUBLISHABLE_KEY}
     signInUrl="/sign-in"
     signUpUrl="/sign-up"
     afterSignInUrl="/painel"
     afterSignUpUrl="/painel"
   >
   ```

3. **Route Protection** (`src/App.tsx`):
   ```typescript
   <Route path="/painel" element={
     hasClerkAuth ? (
       <>
         <SignedIn><Painel /></SignedIn>
         <SignedOut><RedirectToSignIn /></SignedOut>
       </>
     ) : <Painel />
   } />
   ```

### Authentication Routes

- **`/sign-in`**: Clerk sign-in component
- **`/sign-up`**: Clerk sign-up component
- **`/painel`**: Protected dashboard (requires authentication when Clerk is enabled)

### Graceful Degradation

The app works **with or without** Clerk:
- **With Clerk keys**: Full authentication enabled
- **Without Clerk keys**: Authentication UI is hidden, protected routes become public

## Troubleshooting

### Issue: "Missing Publishable Key from Clerk"

**Solution**: Ensure `.env.local` exists with valid `VITE_CLERK_PUBLISHABLE_KEY`

### Issue: Authentication redirects not working

**Solution**: Check that `signInUrl` and `signUpUrl` match your routes in `App.tsx`

### Issue: Build fails with TypeScript errors

**Solution**: Run `pnpm install` to ensure all dependencies are installed

### Issue: Hot reload not working

**Solution**: 
1. Stop the dev server (Ctrl+C)
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart: `pnpm dev`

## Testing

### Unit Tests
```bash
pnpm test
```

Tests validate:
- JSON content structure
- Theme configuration
- Data persistence flows

### Visual Regression Tests
```bash
pnpm test:visual
```

Runs Playwright tests across:
- Chromium (desktop)
- Mobile viewports
- Dark/light themes

### Linting
```bash
pnpm lint
```

## Build for Production

```bash
pnpm build
```

Output directory: `dist/`

The build process:
- Compiles TypeScript
- Optimizes assets
- Splits code into vendor chunks
- Minifies for production

Preview the production build:
```bash
pnpm preview
```

## CI/CD

All PRs automatically run:
- ✅ ESLint validation
- ✅ Unit tests
- ✅ Production build verification
- ✅ Lighthouse audits (performance/accessibility)
- ✅ Visual regression tests

## Need Help?

- **Documentation**: See `AGENTS.md` for coding conventions
- **Clerk Docs**: [https://clerk.com/docs](https://clerk.com/docs)
- **Vite Docs**: [https://vitejs.dev](https://vitejs.dev)

## Security Notes

- ⚠️ **Never commit `.env.local`** - it's gitignored by default
- ⚠️ **Don't expose `CLERK_SECRET_KEY`** in client code
- ✅ Only `VITE_*` prefixed variables are exposed to the browser
- ✅ Use test keys for development, production keys for deployment
