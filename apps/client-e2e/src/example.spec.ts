import { expect, Page, test } from '@playwright/test';
import { isDateString } from 'class-validator';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('basic usage', () => {
  test.describe.configure({ mode: 'serial' });

  const correctStringDateLength = '2024-11-20T11:58:03.338Z'.length;
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
      timeout: 7000,
    });

    await setTimeout(4000);

    expect(await page.locator('.logo').innerText()).toContain('client');
  });

  test('has serverMessage', async () => {
    await page.goto('/', {
      timeout: 7000,
    });

    await setTimeout(4000);

    expect(await page.locator('#serverMessage').innerText()).toContain(
      'Hello API'
    );
  });

  test('has serverTime', async () => {
    await page.goto('/', {
      timeout: 7000,
    });

    await setTimeout(4000);

    const serverTime = await page.locator('#serverTime').innerText();
    expect(serverTime).toHaveLength(correctStringDateLength);
    expect(isDateString(serverTime)).toBeTruthy();
  });
});
