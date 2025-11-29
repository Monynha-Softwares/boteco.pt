# Boteco.pt - AI Coding Rules

This document provides a concise overview of the Boteco.pt application's tech stack and strict guidelines for library usage to ensure consistency, maintainability, and adherence to architectural patterns.

## Tech Stack Overview

*   **Frontend Framework**: React 18 with TypeScript for robust and scalable UI development.
*   **Build Tool**: Vite 6.3.4 with SWC for extremely fast development and optimized production builds.
*   **Routing**: React Router v6, implementing a locale-first routing strategy (`/:locale/path`).
*   **State Management**: TanStack Query v5 for efficient data fetching, caching, and synchronization.
*   **Styling**: Tailwind CSS 3.4, leveraging utility classes and custom CSS variables for theming.
*   **UI Components**: shadcn/ui (built on Radix UI primitives) for a consistent and accessible component library.
*   **Internationalization (i18n)**: i18next + react-i18next for comprehensive multilingual support.
*   **Forms**: react-hook-form with Zod for robust form management and validation.
*   **Animations**: Framer Motion and Embla Carousel for smooth UI transitions and carousels.
*   **SEO**: react-helmet-async for managing document head tags and SEO metadata.

## Library Usage Rules

To maintain a consistent and high-quality codebase, adhere to the following rules for library usage:

1.  **UI Components**:
    *   **Always** use components from `shadcn/ui`. Import them from `@/components/ui/`.
    *   **NEVER** edit files within `src/components/ui/`. If customization is needed, create a new component that wraps the `shadcn/ui` component.
2.  **Icons**:
    *   **Always** use icons from the `lucide-react` library.
3.  **Styling**:
    *   **Always** use Tailwind CSS utility classes for styling.
    *   **NEVER** hardcode hex, RGB, or HSL color values directly in components. Instead, use the predefined CSS variables (e.g., `bg-boteco-primary`, `text-foreground`).
    *   Ensure designs are responsive and include `focus-visible:ring-2` for accessibility on interactive elements.
4.  **Internationalization (i18n)**:
    *   **All** user-facing strings must be externalized into JSON translation files located in `src/content/{locale}/{page}.json`.
    *   Use the `useTranslation()` hook from `react-i18next` to access translated strings.
    *   Ensure new translation namespaces are imported in `src/i18n.ts` and added to the `ns` array.
5.  **Forms**:
    *   Use `react-hook-form` for all form state management and submission handling.
    *   Use `zod` for schema-based form validation.
    *   Integrate `zod` with `react-hook-form` using `@hookform/resolvers/zod`.
6.  **State Management**:
    *   Use `TanStack Query` for all server-state management, including data fetching, caching, and mutations.
7.  **Routing**:
    *   Use `react-router-dom` for all client-side routing.
    *   **All marketing and content routes MUST be locale-aware**, following the `/:locale/path` pattern (e.g., `/pt/sobre`). The `/painel` route is an exception and is not locale-aware.
    *   Use the `useLocalizedPath` hook for generating locale-aware URLs.
8.  **Theming**:
    *   Use `next-themes` for dark/light mode functionality.
    *   Ensure components are theme-aware by using CSS variables and `transition-colors duration-300` for smooth transitions.
9.  **Animations**:
    *   For complex animations and gestures, use `framer-motion`.
    *   For carousels, use `embla-carousel-react`.
10. **SEO**:
    *   Use `react-helmet-async` to manage `<head>` elements for SEO purposes (titles, meta descriptions, etc.).