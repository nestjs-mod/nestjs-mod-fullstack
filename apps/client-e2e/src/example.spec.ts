import { expect, Page, test } from '@playwright/test';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('basic usage', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: join(__dirname, 'video'),
        size: { width: 1920, height: 1080 },
      },
    });
  });

  test.afterAll(async () => {
    await setTimeout(1000);
    await page.close();
  });

  test('has title', async () => {
    await page.goto('/', {
      timeout: 5000,
    });

    // Expect h1 to contain a substring.
    expect(await page.locator('.logo').innerText()).toContain('client');

    await setTimeout(4000);
  });

  test('has serverMessage', async () => {
    await page.goto('/', {
      timeout: 5000,
    });

    await setTimeout(4000);

    // Expect h1 to contain a substring.
    expect(await page.locator('#serverMessage').innerText()).toContain(
      'Hello API'
    );
  });
});
