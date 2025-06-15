import { expect, Page, test } from '@playwright/test';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('basic usage (ru)', () => {
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

    expect(await page.locator('.logo').innerText()).toContain('Fullstack');
  });

  test('should change language to RU', async () => {
    await expect(
      page.locator('nz-header').locator('[nz-submenu]'),
    ).toContainText(`EN`);
    await page.locator('nz-header').locator('[nz-submenu]').last().click();

    await expect(
      page
        .locator('[nz-submenu-none-inline-child]')
        .locator('[nz-menu-item]')
        .last(),
    ).toContainText(`Russian`);

    await page
      .locator('[nz-submenu-none-inline-child]')
      .locator('[nz-menu-item]')
      .last()
      .click();

    await setTimeout(7000);
    //

    await expect(
      page.locator('nz-header').locator('[nz-submenu]'),
    ).toContainText(`RU`);
  });

  test('has serverMessage', async () => {
    await page.goto('/', {
      timeout: 7000,
    });

    await setTimeout(4000);

    expect(await page.locator('#serverMessage').innerText()).toContain(
      'Привет АПИ',
    );
  });
  test('has serverTime format should be equal to "21 дек. 2024 г., 13:56:00" without "13:56:00"', async () => {
    await page.goto('/', {
      timeout: 7000,
    });

    await setTimeout(4000);

    const serverTime = await page.locator('#serverTime').innerText();
    expect(
      serverTime
        .split(' ')
        .filter((p, i) => i !== 4)
        .join(' '),
    ).toEqual(
      new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
        .format(new Date())
        .split(' ')
        .filter((p, i) => i !== 4)
        .join(' '),
    );
  });
});
