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

### Available Scripts

```bash
pnpm dev              # Start development server on localhost:8080
pnpm build            # Production build
pnpm build:dev        # Development build for debugging
pnpm lint             # Run ESLint
pnpm test             # Run Node.js tests
pnpm test:visual      # Run Playwright visual regression tests
pnpm preview          # Preview production build
```

### Testing

The project uses multiple testing strategies:

- **Unit/Integration Tests**: Node.js native test runner (`pnpm test`)
  - Content structure validation
  - Theme configuration tests
  - Data flow validation
- **Visual Regression Tests**: Playwright (`pnpm test:visual`)
  - Cross-browser screenshot comparisons
  - UI component visual consistency
- **Lighthouse Audits**: Automated performance and accessibility checks

## CI/CD

All pull requests and pushes trigger automated checks:

- ✅ **Linting**: ESLint validation
- ✅ **Tests**: All unit tests must pass
- ✅ **Build**: Production build verification
- ✅ **Lighthouse**: Performance and accessibility audits
- ✅ **Visual Tests**: Cross-browser screenshot comparisons

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6 with locale-aware patterns (`/:locale/path`)
- **Styling**: Tailwind CSS + shadcn/ui + React Bits
- **i18n**: i18next with JSON content files
- **State**: TanStack Query with localStorage fallback
- **Theme**: next-themes with custom Boteco color system

## Documentation

See [AGENTS.md](./AGENTS.md) for detailed coding conventions and architecture patterns.
