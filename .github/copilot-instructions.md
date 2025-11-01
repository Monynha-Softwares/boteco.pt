# GitHub Copilot Instructions for boteco.pt

This document provides guidelines for GitHub Copilot when working with this repository.

## Project Overview

This is a React-based web application built with modern web technologies, serving as the boteco.pt website.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router (routes defined in `src/App.tsx`)
- **UI Library**: shadcn/ui components (pre-installed)
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Internationalization**: i18next with React bindings
- **Testing**: Node.js native test runner
- **Package Manager**: npm (note: both package-lock.json and pnpm-lock.yaml are present)

## Project Structure

```
src/
├── App.tsx           # Main app component with routing
├── pages/            # Page components
│   └── Index.tsx     # Main/default page
├── components/       # Reusable components
├── content/          # Content files (e.g., blog posts, localized content)
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

tests/                # Test files (*.test.mjs)
```

## Development Guidelines

### Code Organization

1. **Always place source code in the `src/` folder**
2. **Pages**: Put page components in `src/pages/`
3. **Components**: Put reusable components in `src/components/`
4. **Routes**: Keep routes in `src/App.tsx` - do not create separate routing files
5. **Main page**: The default page is `src/pages/Index.tsx`

### UI Development

1. **Always use shadcn/ui components** when available - they are pre-installed
   - All shadcn/ui components and their Radix UI dependencies are already installed
   - Don't install them again
   - These components are in `src/components/ui/` and should not be edited directly
   - Create new wrapper components if you need to customize them

2. **Styling**: Always use Tailwind CSS
   - Utilize Tailwind classes for layout, spacing, colors, and all design aspects
   - Avoid inline styles or CSS modules

3. **Icons**: Use lucide-react package for icons

### Component Updates

**CRITICAL**: When adding new components, **always update the main page** (`src/pages/Index.tsx`) to include them. Otherwise, users won't be able to see the new components.

### Testing

- Tests use Node.js native test runner (`node:test`)
- Test files are located in `tests/` directory
- Use `.test.mjs` extension for test files
- Run tests with: `npm test`
  - Package.json defines: `node --test tests/**/*.test.mjs`
  - If the glob pattern doesn't expand properly, use: `node --test tests/*.test.mjs`
  - Currently all tests are in the root of the `tests/` directory

### Code Quality

- **Linting**: Run `npm run lint` before committing
- **TypeScript**: Always use TypeScript for type safety
- Existing lint warnings in shadcn/ui components can be ignored (they're about react-refresh and are acceptable)

### Building and Development

- Development server: `npm run dev`
- Production build: `npm run build`
- Development build: `npm run build:dev`
- Preview production: `npm run preview`

### Internationalization

- The app supports multiple locales (pt, en, es, fr)
- Content is stored in `src/content/{locale}/` directories
- Common content shared across locales is in `src/content/common/`
- Use i18next for translations

### Content Management

- Blog posts are stored as JSON files in `src/content/{locale}/blog.json`
- Blog posts must include these fields: content, cover, date, excerpt, id, slug, tags, title
- Cover images should be in `/images/blog/` directory
- Ensure content files are kept in sync across locales

## Best Practices

1. **Minimal changes**: Make the smallest possible changes to accomplish the task
2. **Type safety**: Leverage TypeScript for type checking
3. **Consistency**: Follow existing code patterns and conventions
4. **Testing**: Write tests for new features following existing test patterns
5. **Accessibility**: Ensure UI components are accessible
6. **Performance**: Consider performance implications, especially for large datasets

## Common Pitfalls to Avoid

- Don't create separate routing files - keep routes in `src/App.tsx`
- Don't install shadcn/ui or Radix UI packages - they're already installed
- Don't forget to update `src/pages/Index.tsx` when adding new components
- Don't edit shadcn/ui components directly - create wrapper components instead
- Don't use CSS modules or inline styles - use Tailwind CSS

## Dependencies

All necessary packages are pre-installed. Key dependencies include:
- React Router DOM for routing
- React Hook Form with Zod for form validation
- TanStack Query for data fetching
- Framer Motion for animations
- All shadcn/ui and Radix UI components

Before adding new dependencies, verify they're not already available in the project.
