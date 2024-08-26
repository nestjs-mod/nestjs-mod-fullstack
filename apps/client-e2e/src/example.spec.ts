import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/', {
    timeout: 5000,
  });

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Welcome');
});

test('has serverMessage', async ({ page }) => {
  await page.goto('/', {
    timeout: 5000,
  });

  // Expect h1 to contain a substring.
  expect(await page.locator('#serverMessage').innerText()).toContain(
    'Hello API'
  );
});
