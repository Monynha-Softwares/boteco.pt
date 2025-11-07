import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Home Page
 * Tests the layout and grid alignment at different breakpoints
 */
test.describe('Home Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');
  });

  test('desktop layout full page', async ({ page }) => {
    await expect(page).toHaveScreenshot('home-desktop-full.png', {
      fullPage: true,
    });
  });

  test('hero section renders correctly', async ({ page }) => {
    const hero = page.getByTestId('hero-section');
    // Allow initial animations/fonts to settle
    await page.waitForTimeout(300);
    await expect(hero).toHaveScreenshot('hero-section.png');
  });

  test('features grid alignment', async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      if (sections[1]) {
        sections[1].scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    
    // Wait for scroll position to stabilize
    const featuresSection = page.locator('section').nth(1);
    await featuresSection.waitFor({ state: 'visible' });

    await expect(featuresSection).toHaveScreenshot('features-grid.png');
  });

  test('solutions grid alignment', async ({ page }) => {
    // Scroll to solutions section
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      if (sections[2]) {
        sections[2].scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    // Wait for scroll position to stabilize
    const solutionsSection = page.locator('section').nth(2);
    await solutionsSection.waitFor({ state: 'visible' });

    await expect(solutionsSection).toHaveScreenshot('solutions-grid.png');
  });
});

test.describe('Grid Alignment at Multiple Breakpoints', () => {
  const breakpoints = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'desktop-small' },
    { width: 1440, height: 900, name: 'desktop-large' },
  ];

  for (const bp of breakpoints) {
    test(`grid alignment at ${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/pt');
      await page.waitForLoadState('networkidle');

      // Scroll through key sections
      await page.evaluate(() => {
        const sections = document.querySelectorAll('section');
        if (sections[1]) {
          sections[1].scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      });
      
      // Wait for the section to be visible and stable
      await page.locator('section').nth(1).waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot(`home-${bp.name}.png`, {
        fullPage: true,
      });
    });
  }
});

test.describe('Blog Page Grid Consistency', () => {
  test('blog grid layout', async ({ page }) => {
    await page.goto('/pt/blog');
    await page.waitForLoadState('networkidle');

    const blogGrid = page.locator('.grid').first();
    await expect(blogGrid).toHaveScreenshot('blog-grid.png');
  });
});

test.describe('About Page Grid Consistency', () => {
  test('about values grid', async ({ page }) => {
    await page.goto('/pt/sobre');
    await page.waitForLoadState('networkidle');

    // Scroll to values section
    await page.evaluate(() => {
      const grids = document.querySelectorAll('.grid');
      if (grids[0]) {
        grids[0].scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    // Wait for the grid to be visible and stable
    const valuesGrid = page.locator('.grid').first();
    await valuesGrid.waitFor({ state: 'visible' });

    await expect(valuesGrid).toHaveScreenshot('about-values-grid.png');
  });
});
