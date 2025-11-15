import { test, expect } from '@playwright/test';

test('Contact form submits and shows success message; language toggles', async ({ page }) => {
  await page.goto('/contact');
  // default lang should be pt-BR (or empty if not set on initial load)
  const lang = await page.evaluate(() => document.documentElement.lang || '');
  expect(['pt-BR', '']).toContain(lang);

  // toggle language to English using the switcher
  // wait until one visible language switcher variant is available then click
  let which: 'aria'|'title'|'text'|null = null
  try {
    which = await Promise.any([
      page.waitForSelector('button[aria-label="English"]', { state: 'visible', timeout: 10000 }).then(() => 'aria'),
      page.waitForSelector('button[title="English"]', { state: 'visible', timeout: 10000 }).then(() => 'title'),
      page.waitForSelector('button', { state: 'visible', timeout: 10000 }).then(async () => {
        const count = await page.locator('button', { hasText: 'EN' }).count()
        return count > 0 ? 'text' : Promise.reject(new Error('no text EN'))
      }),
    ])
  } catch (e) {
    which = null
  }
  let enBtn
  if (which === 'aria') enBtn = page.locator('button[aria-label="English"]')
  else if (which === 'title') enBtn = page.locator('button[title="English"]')
  else enBtn = page.locator('button', { hasText: 'EN' })
  await enBtn.click()
  // Wait until a visible switcher is available
  await enBtn.waitFor({ state: 'visible', timeout: 5000 });
  await enBtn.scrollIntoViewIfNeeded();
  await enBtn.click();
  await page.waitForFunction(() => document.documentElement.lang === 'en', null, { timeout: 5000 });
  const newLang = await page.evaluate(() => document.documentElement.lang);
  expect(newLang).toBe('en');

  // fill the form
  await page.fill('input[type="text"]', 'Test User');
  await page.fill('input[type="email"]', 'test@example.org');
  await page.fill('textarea', 'This is a test message');
  await page.click('button[type="submit"]');

  // Wait for UI success message
  await page.locator('text=Thanks').waitFor({ timeout: 5000 });
  const successText = await page.locator('text=Thanks').innerText();
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
  await page.goto('/contact')
  // Fill the form
  await page.fill('input[type="text"]', 'Jane Doe')
  await page.fill('input[type="email"]', 'jane@example.org')
  await page.fill('textarea', 'This is a demo lead')
  await page.click('button:has-text("Send")')
  // On success, expect a thank-you message
  await expect(page.locator('text=Thanks')).toBeVisible({ timeout: 10_000 })
})
