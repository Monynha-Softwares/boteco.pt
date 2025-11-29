# Boteco.pt

[![CI](https://github.com/marcelo-m7/boteco.pt/actions/workflows/ci.yml/badge.svg)](https://github.com/marcelo-m7/boteco.pt/actions/workflows/ci.yml)
[![Lighthouse CI](https://github.com/marcelo-m7/boteco.pt/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/marcelo-m7/boteco.pt/actions/workflows/lighthouse.yml)
[![Visual Regression Tests](https://github.com/marcelo-m7/boteco.pt/actions/workflows/visual-regression.yml/badge.svg)](https://github.com/marcelo-m7/boteco.pt/actions/workflows/visual-regression.yml)

A multilingual (pt/en/es/fr) React SPA for restaurant management built with modern web technologies.

## Features

- 🌍 **Multilingual Support**: Portuguese, English, Spanish, and French
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🌙 **Dark Mode**: Persistent theme support with next-themes
- 🔐 **Optional Authentication**: Feature-flagged Clerk integration
- 🚀 **Supabase Backend**: Robust backend for authentication, database, and edge functions.
- 📝 **User & Company Registration**: Streamlined onboarding for new users and their businesses.
- ⚡ **Fast Development**: Vite + React 18 + TypeScript with SWC
- 📱 **Responsive Design**: Mobile-first approach with React Bits components

## Development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Environment Setup

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

2.  (Optional) Add your Clerk credentials to `.env`:
    ```bash
    VITE_CLERK_PUBLISHABLE_KEY=your_key_here
    VITE_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
    ```

3.  Add your Supabase credentials to `.env`:
    ```bash
    VITE_SUPABASE_URL=your_supabase_url_here
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
    ```

    **Note**: The app works perfectly without Clerk authentication. See `docs/ENVIRONMENT_SETUP.md` for details.

### Available Scripts

```bash
pnpm dev              # Start development server on localhost:8080
pnpm build            # Production build
pnpm build:dev        # Development build for debugging
pnpm lint             # Run ESLint
pnpm test             # Run Node.js unit tests
pnpm test:visual      # Run Playwright visual regression tests
pnpm preview          # Preview production build
```

### Testing

The project uses multiple testing strategies:

-   **Unit/Integration Tests**: Node.js native test runner (`pnpm test`)
    -   Content structure validation
    -   Theme configuration tests
    -   Data flow validation
-   **Visual Regression Tests**: Playwright (`pnpm test:visual`)
    -   Cross-browser screenshot comparisons
    -   UI component visual consistency
-   **Lighthouse Audits**: Automated performance and accessibility checks

## CI/CD

All pull requests and pushes trigger automated checks:

-   ✅ **Linting**: ESLint validation (via `ci.yml`)
-   ✅ **Unit Tests**: All unit tests must pass (via `ci.yml`)
-   ✅ **Build**: Production build verification (via `ci.yml` and `lighthouse.yml`)
-   ✅ **Lighthouse**: Performance and accessibility audits (via `lighthouse.yml`)
-   ✅ **Visual Tests**: Cross-browser screenshot comparisons (via `visual-regression.yml`)

## Docker Deployment

### Quick Start

```bash
# Build the image (include Vite build-time vars via --build-arg)
docker build \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_xxx \
  --build-arg VITE_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev \
  --build-arg VITE_PROVISIONAL_REDIRECT=true \
  -t boteco-pt:latest .

# Run the container
docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest

# Or use Docker Compose
docker-compose up -d
```

Access at: http://localhost:3000

### Automated Build Script

**Windows (PowerShell)**:
```powershell
.\docker-build.ps1
```

**Linux/Mac (Bash)**:
```bash
chmod +x docker-build.sh
./docker-build.sh
```

**See also**:
-   `DOCKER_QUICK_REF.md` - Quick reference for common commands
-   `docs/DOCKER_DEPLOYMENT.md` - Comprehensive deployment guide

## Architecture

-   **Frontend**: React 18 + TypeScript + Vite
-   **Backend**: Supabase (Auth, Database, Edge Functions)
-   **Routing**: React Router v6 with locale-aware patterns (`/:locale/path`)
-   **Styling**: Tailwind CSS + shadcn/ui + React Bits
-   **i18n**: i18next with JSON content files
-   **State**: TanStack Query with localStorage fallback
-   **Theme**: next-themes with custom Boteco color system

## Documentation

-   **[AGENTS.md](./AGENTS.md)** - Comprehensive AI agent instructions and architecture patterns
-   **[docs/README.md](./docs/README.md)** - Technical documentation index
-   **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Concise AI coding guidelines

## About

**Boteco.pt** is developed and maintained by [Monynha Softwares](https://github.com/Monynha-Softwares).

### Links

-   **Organization**: [github.com/Monynha-Softwares](https://github.com/Monynha-Softwares)
-   **Repository**: [github.com/Monynha-Softwares/boteco.pt](https://github.com/Monynha-Softwares/boteco.pt)
-   **Issues**: [Report a bug or request a feature](https://github.com/Monynha-Softwares/boteco.pt/issues)
-   **Discussions**: [Join the conversation](https://github.com/Monynha-Softwares/boteco.pt/discussions)

## License

© 2025 Monynha Softwares. All rights reserved.