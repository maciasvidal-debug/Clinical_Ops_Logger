const { test, expect } = require('@playwright/test');

// Simple test to ensure the page doesn't throw 500 when loaded.
test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveTitle(/SiteFlow/);
});
