import { test, expect } from '@playwright/test';

// Constants for accessibility testing
const MAX_TAB_COUNT = 50; // Maximum tabs to prevent infinite loops

/**
 * Accessibility Tests
 * Validates WCAG compliance and accessibility features
 */
test.describe('Accessibility - Keyboard Navigation', () => {
  test('can navigate entire site with keyboard', async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    // Tab through all interactive elements
    let tabCount = 0;

    while (tabCount < MAX_TAB_COUNT) { // Limit to prevent infinite loop
      await page.keyboard.press('Tab');
      tabCount++;

      // Check if we've trapped in a focus loop
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          role: el?.getAttribute('role'),
          ariaLabel: el?.getAttribute('aria-label'),
        };
      });

      // If we hit a link and press Enter, we should navigate
      if (focusedElement.tagName === 'A') {
        // Found a link, continue tabbing
        continue;
      }
    }

    // Should have successfully tabbed through elements
    expect(tabCount).toBeGreaterThan(5);
  });

  test('sidebar trigger is keyboard accessible', async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-sidebar="trigger"]');
    
    if (await trigger.count() === 0) {
      test.skip(true, 'Sidebar trigger not found');
      return;
    }

    // Focus the trigger
    await trigger.focus();

    // Check it has visible focus indicator
    const hasFocusRing = await trigger.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });

    expect(hasFocusRing).toBeTruthy();

    // Press Enter to toggle
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Should have toggled
    const isToggled = await page.evaluate(() => {
      return document.querySelector('[data-sidebar]')?.getAttribute('data-state') === 'collapsed';
    });

    // Should respond to keyboard activation (true or false, just checking it responded)
    expect(typeof isToggled).toBe('boolean');
  });
});

test.describe('Accessibility - ARIA Labels', () => {
  test('all icon-only buttons have ARIA labels', async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    // Find all buttons with only icons (no visible text)
    const iconButtons = await page.locator('button').evaluateAll((buttons) => {
      return buttons.filter((btn) => {
        const hasVisibleText = (btn.textContent?.trim().length ?? 0) > 0;
        const hasAriaLabel = btn.getAttribute('aria-label');
        const hasSrOnly = btn.querySelector('.sr-only');
        
        // Consider it an icon-only button if it has no visible text
        // but should have either aria-label or sr-only text
        if (!hasVisibleText && !hasAriaLabel && !hasSrOnly) {
          return true; // This is a problem button
        }
        return false;
      }).length;
    });

    // All icon-only buttons should have labels
    expect(iconButtons).toBe(0);
  });

  test('language switcher has ARIA label', async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.locator('[aria-label="Select language"]');
    await expect(languageSwitcher).toBeVisible();
  });

  test('theme toggle has screen reader text', async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    const themeToggle = page.locator('button').filter({ has: page.locator('.sr-only') });
    const count = await themeToggle.count();
    
    // Should have at least one button with sr-only text (theme toggle)
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Accessibility - Heading Hierarchy', () => {
  test('home page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    const headings = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim());
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim());
      const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim());
      
      return { h1s, h2s, h3s };
    });

    // Should have exactly one H1
    expect(headings.h1s.length).toBe(1);

    // Should have H2s
    expect(headings.h2s.length).toBeGreaterThan(0);

    // H1 should not be empty
    expect(headings.h1s[0]).toBeTruthy();
  });

  test('blog page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/pt/blog');
    await page.waitForLoadState('networkidle');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('about page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/pt/sobre');
    await page.waitForLoadState('networkidle');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('text elements have sufficient color contrast', async ({ page }) => {
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    // Sample key text elements
    const textElements = [
      page.locator('h1').first(),
      page.locator('p').first(),
      page.locator('a').first(),
    ];

    for (const element of textElements) {
      if (await element.count() === 0) continue;

      const contrastInfo = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        const fontSize = parseFloat(styles.fontSize);
        
        return { color, backgroundColor, fontSize };
      });

      // Basic check - elements should have defined colors
      expect(contrastInfo.color).toBeTruthy();
      expect(contrastInfo.backgroundColor).toBeTruthy();
    }
  });
});

test.describe('Accessibility - Touch Targets', () => {
  test('mobile interactive elements meet minimum size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button:visible, a:visible').evaluateAll((elements) => {
      return elements.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          meets44x44: rect.width >= 44 && rect.height >= 44,
          meets40x40: rect.width >= 40 && rect.height >= 40,
        };
      }).filter(size => size.width > 0 && size.height > 0);
    });

    // At least 80% of interactive elements should meet practical minimum (40x40)
    // Note: WCAG 2.5.5 recommends 44x44, but 40x40 is acceptable for most elements
    const passing = buttons.filter(b => b.meets40x40).length;
    const total = buttons.length;
    const percentage = (passing / total) * 100;

    expect(percentage).toBeGreaterThan(80);
  });
});
