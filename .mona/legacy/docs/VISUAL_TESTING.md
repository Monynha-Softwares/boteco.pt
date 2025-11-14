# Visual Regression Testing Guide

This document describes the visual regression testing setup for Boteco.pt, implemented as part of the UI/UX Correction Plan.

## Overview

Visual regression testing ensures that UI changes don't introduce unintended visual bugs. This setup uses:

- **Playwright** for browser automation and screenshot capture
- **Lighthouse CI** for accessibility scoring and performance metrics
- **GitHub Actions** for automated CI/CD testing

## Quick Start

### Installation

```bash
# Install all dependencies including Playwright
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

### Running Tests Locally

```bash
# Run all visual tests
pnpm test:visual

# Run tests in UI mode (interactive)
pnpm test:visual:ui

# Update baseline screenshots
pnpm test:visual:update
```

### Running Lighthouse Audits Locally

```bash
# Build the application first
pnpm build

# Run Lighthouse CI
npx lhci autorun
```

## Test Structure

### Visual Tests (`tests/visual/`)

1. **homepage.spec.ts** - Tests home page layout and grid alignment
   - Full page screenshots
   - Individual section screenshots
   - Multi-breakpoint tests (mobile, tablet, desktop)

2. **sidebar.spec.ts** - Tests sidebar toggle behavior
   - No layout shifts during toggle
   - Rapid toggle stability
   - Performance metrics (CLS)

3. **accessibility.spec.ts** - Tests WCAG compliance
   - Keyboard navigation
   - ARIA labels coverage
   - Heading hierarchy
   - Color contrast
   - Touch target sizes

## Configuration Files

### playwright.config.ts

Configures test execution, browsers, and viewports:

- **Browsers**: Chrome, Firefox, Safari (Desktop & Mobile)
- **Base URL**: http://localhost:8080
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Video**: Retained on failure

### .lighthouserc.json

Configures Lighthouse audits and assertions:

- **URLs Tested**: Home, About, Blog, Contact
- **Runs**: 3 per URL (for statistical accuracy)
- **Assertions**:
  - Accessibility ≥ 90 (ERROR)
  - Performance ≥ 80 (WARN)
  - Best Practices ≥ 90 (WARN)
  - SEO ≥ 90 (WARN)
  - CLS < 0.1 (ERROR)

## CI/CD Integration

### GitHub Actions Workflows

#### Visual Regression Workflow (`.github/workflows/visual-regression.yml`)

Triggers on:
- Pull requests to `main` or `dev`
- Pushes to `main` or `dev`

Steps:
1. Checkout code
2. Install dependencies
3. Install Playwright browsers
4. Run visual tests
5. Upload test reports and screenshots as artifacts

#### Lighthouse CI Workflow (`.github/workflows/lighthouse.yml`)

Triggers on:
- Pull requests to `main` or `dev`
- Pushes to `main` or `dev`

Steps:
1. Checkout code
2. Install dependencies
3. Build application
4. Run Lighthouse CI
5. Upload reports
6. Comment PR with results

## Acceptance Criteria

### Visual Regression

✅ **Passed if:**
- All screenshots match baseline (or differences are intentional)
- No layout shifts detected (CLS < 0.1)
- Grid alignment consistent across breakpoints

### Accessibility

✅ **Passed if:**
- Lighthouse Accessibility score ≥ 90
- All interactive elements have ARIA labels
- Keyboard navigation works without traps
- Touch targets meet 44×44px minimum on mobile

## Troubleshooting

### Tests Failing Locally

**Issue**: Screenshots don't match baseline

**Solution**:
1. Verify the UI changes are intentional
2. If intentional, update baselines: `pnpm test:visual:update`
3. Review the updated screenshots in `test-results/`

**Issue**: Tests timeout

**Solution**:
1. Ensure dev server is running: `pnpm dev`
2. Increase timeout in `playwright.config.ts`
3. Check for JavaScript errors in console

### CI Tests Failing

**Issue**: Visual tests fail in CI but pass locally

**Solution**:
- Font rendering differences between OS
- Use `maxDiffPixels` or `maxDiffPixelRatio` in test config
- Generate baselines in CI environment

**Issue**: Lighthouse scores vary

**Solution**:
- Lighthouse scores can vary ±5 points due to system load
- Review trends over multiple runs
- Focus on consistent patterns, not single values

## Best Practices

### Writing Visual Tests

1. **Wait for stability**: Use `page.waitForLoadState('networkidle')`
2. **Consistent viewports**: Define in `playwright.config.ts`
3. **Meaningful names**: Use descriptive test and screenshot names
4. **Test in isolation**: Don't rely on previous test state

### Updating Baselines

1. **Review changes**: Always review diff reports before accepting
2. **Update selectively**: Update only screenshots for your changes
3. **Document reasons**: Add comment in PR explaining visual changes
4. **Cross-browser check**: Verify updates across all browser projects

### Lighthouse Optimization

1. **Build for production**: Always test production builds
2. **Minimize network**: Use local server or staging environment
3. **Consistent hardware**: CI environment should match production specs
4. **Multiple runs**: Average 3+ runs for accurate scores

## Maintenance

### Updating Playwright

```bash
# Update Playwright
pnpm update @playwright/test

# Reinstall browsers
pnpm exec playwright install
```

### Updating Lighthouse CI

```bash
# Update Lighthouse CLI
pnpm update -D @lhci/cli
```

### Reviewing Test Coverage

Periodically review:
- Are all critical user paths tested?
- Do tests cover all breakpoints?
- Are new components included in visual tests?

## References

- [Playwright Documentation](https://playwright.dev)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [UI/UX Correction Plan](../UI_UX_CORRECTION_PLAN.md)
- [Implementation Summary](../UI_UX_FIXES_IMPLEMENTATION_SUMMARY.md)

## Support

For questions or issues:
1. Check this guide first
2. Review Playwright/Lighthouse documentation
3. Check GitHub Actions logs for CI failures
4. Open an issue with test failure details

---

**Last Updated**: November 2025  
**Maintained by**: Boteco.pt Development Team
