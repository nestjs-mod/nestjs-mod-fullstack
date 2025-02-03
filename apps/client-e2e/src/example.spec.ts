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
    page.on('pageerror', (exception) => {
      console.log(exception);
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

  test('has serverTime format should be equal to "Dec 21, 2024, 1:56:00 PM" without "1:56:00"', async () => {
    await page.goto('/', {
      timeout: 7000,
    });

    await setTimeout(4000);

    const serverTime = await page.locator('#serverTime').innerText();
    expect(
      serverTime
        .split(' ')
        .filter((p, i) => i !== 3 && i !== 4)
        .join(' ')
    ).toEqual(
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
        .format(new Date())
        .split(' ')
        .filter((p, i) => i !== 3 && i !== 4)
        .join(' ')
    );
  });
});
