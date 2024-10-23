import { test, expect } from '@playwright/test';
import { setTimeout } from 'timers/promises';

test('has title', async ({ page }) => {
  await page.goto('/', {
    timeout: 5000,
  });

  // Expect h1 to contain a substring.
  expect(await page.locator('.logo').innerText()).toContain('client');
});

test('has serverMessage', async ({ page }) => {
  await page.goto('/', {
    timeout: 5000,
  });

  await setTimeout(20000);

  // Expect h1 to contain a substring.
  expect(await page.locator('#serverMessage').innerText()).toContain(
    'Hello API'
  );
});
