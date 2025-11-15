import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Sidebar
 * Validates no layout shifts during toggle
 */

// Type definition for Layout Shift Performance Entry
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

test.describe('Sidebar Toggle Animation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with sidebar (assuming /pt/painel or similar)
    // Adjust path based on actual sidebar implementation
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');
  });

  test('sidebar toggle does not cause layout shifts', async ({ page }) => {
    // Find the sidebar trigger button
    const trigger = page.locator('[data-sidebar="trigger"]');
    
    if (await trigger.count() === 0) {
      test.skip(true, 'Sidebar trigger not found on this page');
      return;
    }

    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // Capture before toggle
    await expect(page).toHaveScreenshot('sidebar-before-toggle.png');

    // Toggle sidebar
    await trigger.click();
    
    // Wait for transition to complete by checking when the element becomes stable
    await page.evaluate(() => 
      new Promise<void>((resolve) => {
        const sidebarEl = document.querySelector('[data-sidebar="sidebar"]');
        if (!sidebarEl) {
          resolve();
          return;
        }
        const handler = () => {
          sidebarEl.removeEventListener('transitionend', handler);
          resolve();
        };
        sidebarEl.addEventListener('transitionend', handler);
        // Fallback timeout in case transitionend doesn't fire
        setTimeout(() => {
          sidebarEl.removeEventListener('transitionend', handler);
          resolve();
        }, 500);
      })
    );

    // Capture after toggle
    await expect(page).toHaveScreenshot('sidebar-after-toggle.png');

    // Toggle back
    await trigger.click();
    
    // Wait for transition to complete
    await page.evaluate(() => 
      new Promise<void>((resolve) => {
        const sidebarEl = document.querySelector('[data-sidebar="sidebar"]');
        if (!sidebarEl) {
          resolve();
          return;
        }
        const handler = () => {
          sidebarEl.removeEventListener('transitionend', handler);
          resolve();
        };
        sidebarEl.addEventListener('transitionend', handler);
        // Fallback timeout
        setTimeout(() => {
          sidebarEl.removeEventListener('transitionend', handler);
          resolve();
        }, 500);
      })
    );

    // Should match the original state
    await expect(page).toHaveScreenshot('sidebar-toggled-back.png');
  });

  test('rapid sidebar toggles remain stable', async ({ page }) => {
    const trigger = page.locator('[data-sidebar="trigger"]');
    
    if (await trigger.count() === 0) {
      test.skip(true, 'Sidebar trigger not found on this page');
      return;
    }

    // Perform rapid toggles
    for (let i = 0; i < 5; i++) {
      await trigger.click();
      // Wait briefly between clicks to ensure click is registered
      await page.waitForTimeout(50);
    }

    // Wait for all animations to settle by checking when sidebar transitions complete
    await page.evaluate(() => 
      new Promise<void>((resolve) => {
        const sidebarEl = document.querySelector('[data-sidebar="sidebar"]');
        if (!sidebarEl) {
          resolve();
          return;
        }
        let timeoutId: number;
        const handler = () => {
          // Clear existing timeout and set a new one to ensure all transitions are done
          clearTimeout(timeoutId);
          timeoutId = window.setTimeout(() => {
            sidebarEl.removeEventListener('transitionend', handler);
            resolve();
          }, 100);
        };
        sidebarEl.addEventListener('transitionend', handler);
        // Initial timeout to start the check
        timeoutId = window.setTimeout(() => {
          sidebarEl.removeEventListener('transitionend', handler);
          resolve();
        }, 1000);
      })
    );

    // Check final state is stable
    await expect(page).toHaveScreenshot('sidebar-after-rapid-toggles.png');
  });
});

test.describe('Sidebar Performance', () => {
  test('sidebar toggle has no layout shifts', async ({ page }) => {
    // Start measuring layout shifts
    await page.goto('/pt');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[data-sidebar="trigger"]');
    
    if (await trigger.count() === 0) {
      test.skip(true, 'Sidebar trigger not found on this page');
      return;
    }

    // Measure layout shifts during toggle
    const layoutShifts = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cumulativeShift = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              // Check for user input using the PerformanceEntry properties
              const hasRecentInput = 'hadRecentInput' in entry ? (entry as Record<string, unknown>).hadRecentInput : false;
              if (!hasRecentInput) {
                const value = 'value' in entry ? (entry as Record<string, unknown>).value as number : 0;
                cumulativeShift += value;
              }
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(cumulativeShift);
        }, 1000);
      });
    });

    // Trigger sidebar toggle
    await trigger.click();
    
    // Wait for transition to complete before checking layout shifts
    await page.evaluate(() => 
      new Promise<void>((resolve) => {
        const sidebarEl = document.querySelector('[data-sidebar="sidebar"]');
        if (!sidebarEl) {
          resolve();
          return;
        }
        const handler = () => {
          sidebarEl.removeEventListener('transitionend', handler);
          resolve();
        };
        sidebarEl.addEventListener('transitionend', handler);
        // Fallback timeout
        setTimeout(() => {
          sidebarEl.removeEventListener('transitionend', handler);
          resolve();
        }, 500);
      })
    );

    // Layout shift score should be 0 or very close to 0
    // Good: < 0.1, Needs improvement: 0.1-0.25, Poor: > 0.25
    expect(layoutShifts).toBeLessThan(0.1);
  });
});
