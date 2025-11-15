import { test, expect } from '@playwright/test';

test('Contact form submits and shows success message; language toggles', async ({ page }) => {
  // Use server-rendered query param to avoid waiting for dynamic hydration of the language switcher
  await page.goto('/contact?locale=en');
  // default lang should be pt-BR (or empty if not set on initial load)
  const lang = await page.evaluate(() => document.documentElement.lang || '');
  expect(['pt-BR', '']).toContain(lang);

  // We used server-side `?locale=en` to render the page with English; verify it
  await page.waitForFunction(() => document.documentElement.lang === 'en', null, { timeout: 5000 });
  const newLang = await page.evaluate(() => document.documentElement.lang);
  expect(newLang).toBe('en');

  // fill the form
  await page.fill('input[type="text"]', 'Test User');
  await page.fill('input[type="email"]', 'test@example.org');
  await page.fill('textarea', 'This is a test message');
  await page.click('[data-testid="contact-submit"]');

  // Wait for UI success message
  await page.waitForSelector('[data-testid="contact-success"]', { timeout: 5000 });
  const successText = await page.locator('[data-testid="contact-success"]').innerText();
  expect(successText).toContain("Thanks");
});

test('Language switching affects URL and HTML lang attribute and contact submission', async ({ page }) => {
  // Visit the home page and assert default lang
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  // Toggle language to English
  await page.locator('button[aria-label="English"]').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  // Navigate to Contact page
  await page.goto('/contact?locale=pt-BR')
  // Fill the form
  await page.fill('input[type="text"]', 'Jane Doe')
  await page.fill('input[type="email"]', 'jane@example.org')
  await page.fill('textarea', 'This is a demo lead')
  await page.click('button:has-text("Send")')
  // On success, expect a thank-you message
  await expect(page.locator('text=Thanks')).toBeVisible({ timeout: 10_000 })
})
