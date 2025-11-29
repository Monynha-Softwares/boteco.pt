import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Company Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // This test assumes a user is signed in and needs to register a company.
    // In a real CI/CD environment, you might use Clerk's test utilities or
    // mock the Clerk session to simulate a signed-in user.
    // For this integration test, we directly navigate to the registration page.
    // The AuthRedirector component should handle the redirection if a user
    // is signed in but has no company.
    await page.goto('/company-registration');
    await page.waitForLoadState('networkidle');
  });

  test('successfully registers a new company and redirects to dashboard', async ({ page }) => {
    // Generate unique data for the company to avoid conflicts
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const companyName = faker.company.name();
    // Ensure slug is unique and valid (lowercase, numbers, hyphens)
    const companySlug = faker.lorem.slug(3).toLowerCase().replace(/[^a-z0-9-]/g, '') + '-' + faker.string.uuid().substring(0, 4);

    // Fill out the form
    await page.getByLabel('First Name').fill(firstName);
    await page.getByLabel('Last Name').fill(lastName);
    await page.getByLabel('Company Name').fill(companyName);
    await page.getByLabel('Unique Identifier (Slug)').fill(companySlug);

    // Submit the form
    await page.getByRole('button', { name: 'Register Company' }).click();

    // Expect success toast
    await expect(page.locator('[data-sonner-toast][data-type="success"]')).toBeVisible();
    await expect(page.locator('[data-sonner-toast][data-type="success"]')).toContainText('Company registered successfully!');

    // Expect redirection to /painel
    await page.waitForURL('/painel');
    await expect(page).toHaveURL('/painel');

    // Verify company name is displayed on the dashboard (assuming it is)
    // Note: The Painel page displays 'Hello, [FirstName]!' and the company name.
    await expect(page.locator('h1')).toContainText(`Hello, ${firstName}!`);
    await expect(page.locator('p').filter({ hasText: companyName }).first()).toBeVisible();
  });

  test('shows validation errors for invalid input', async ({ page }) => {
    // Attempt to submit with empty fields
    await page.getByRole('button', { name: 'Register Company' }).click();

    // Expect validation messages for required fields
    await expect(page.locator('p:has-text("First name must be at least 2 characters.")')).toBeVisible();
    await expect(page.locator('p:has-text("Last name must be at least 2 characters.")')).toBeVisible();
    await expect(page.locator('p:has-text("Company name must be at least 2 characters.")')).toBeVisible();
    await expect(page.locator('p:has-text("Unique identifier must be at least 3 characters.")')).toBeVisible();

    // Test invalid slug format
    await page.getByLabel('Unique Identifier (Slug)').fill('Invalid Slug!');
    await page.getByRole('button', { name: 'Register Company' }).click();
    await expect(page.locator('p:has-text("Unique identifier must contain only lowercase letters, numbers, and hyphens.")')).toBeVisible();
  });

  // Note: Testing for an already existing slug is challenging in an integration test
  // without a controlled test database or mocking Supabase responses.
  // For now, this scenario is not explicitly covered by Playwright.
});