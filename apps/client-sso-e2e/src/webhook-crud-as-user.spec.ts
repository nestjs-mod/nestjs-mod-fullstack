import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('CRUD operations with Webhook as "User" role', () => {
  test.describe.configure({ mode: 'serial' });

  const user = {
    email: faker.internet.email({
      provider: 'example.fakerjs.dev',
    }),
    password: faker.internet.password({ length: 8 }),
    site: `http://${faker.internet.domainName()}`,
  };
  let page: Page;
  let webhookId: string | null | undefined;

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
    await page.goto('/', {
      timeout: 7000,
    });
    await page.evaluate(
      (ssoURL) => localStorage.setItem('ssoURL', ssoURL),
      get('SERVER_SSO_SSO_URL').asString() || ''
    );
    await page.evaluate(
      (minioURL) => localStorage.setItem('minioURL', minioURL),
      get('SERVER_SSO_MINIO_URL').required().asString()
    );
  });

  test.afterAll(async () => {
    await setTimeout(1000);
    await page.close();
  });

  test('sign up as user', async () => {
    await page.goto('/sign-up', {
      timeout: 7000,
    });

    await page
      .locator('auth-sign-up-form')
      .locator('[placeholder=email]')
      .click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(
      page.locator('auth-sign-up-form').locator('[placeholder=email]')
    ).toHaveValue(user.email.toLowerCase());

    await page
      .locator('auth-sign-up-form')
      .locator('[placeholder=password]')
      .click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(
      page.locator('auth-sign-up-form').locator('[placeholder=password]')
    ).toHaveValue(user.password);

    await page
      .locator('auth-sign-up-form')
      .locator('[placeholder=confirmPassword]')
      .click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(
      page.locator('auth-sign-up-form').locator('[placeholder=confirmPassword]')
    ).toHaveValue(user.password);

    await expect(
      page.locator('auth-sign-up-form').locator('button[type=submit]')
    ).toHaveText('Sign-up');

    await page
      .locator('auth-sign-up-form')
      .locator('button[type=submit]')
      .click();

    await page.waitForSelector(
      'div.cdk-overlay-container>div.cdk-global-overlay-wrapper'
    );

    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first()
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('sign out after sign-up', async () => {
    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first()
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(
      page
        .locator('[nz-submenu-none-inline-child]')
        .locator('[nz-menu-item]')
        .last()
    ).toContainText(`Sign-out`);

    await page
      .locator('[nz-submenu-none-inline-child]')
      .locator('[nz-menu-item]')
      .last()
      .click();

    await setTimeout(4000);

    await expect(
      page.locator('nz-header').locator('[nz-menu-item]').nth(-2)
    ).toContainText(`Sign-in`);
  });

  test('sign in as user', async () => {
    await page.goto('/sign-in', {
      timeout: 7000,
    });

    await page
      .locator('auth-sign-in-form')
      .locator('[placeholder=email]')
      .click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(
      page.locator('auth-sign-in-form').locator('[placeholder=email]')
    ).toHaveValue(user.email.toLowerCase());

    await page
      .locator('auth-sign-in-form')
      .locator('[placeholder=password]')
      .click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(
      page.locator('auth-sign-in-form').locator('[placeholder=password]')
    ).toHaveValue(user.password);

    await expect(
      page.locator('auth-sign-in-form').locator('button[type=submit]')
    ).toHaveText('Sign-in');

    await page
      .locator('auth-sign-in-form')
      .locator('button[type=submit]')
      .click();

    await page.waitForSelector(
      'div.cdk-overlay-container>div.cdk-global-overlay-wrapper'
    );

    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first()
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(7000);

    await page
      .locator('webhook-form')
      .locator('[placeholder=eventName]')
      .click();
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('Enter', { delay: 100 });
    await expect(
      page.locator('webhook-form').locator('[placeholder=eventName]')
    ).toContainText('create');

    await page
      .locator('webhook-form')
      .locator('[placeholder=endpoint]')
      .click();
    await page.keyboard.type(user.site, { delay: 50 });
    await expect(
      page.locator('webhook-form').locator('[placeholder=endpoint]').first()
    ).toHaveValue(user.site);

    await page.locator('webhook-form').locator('[placeholder=headers]').click();
    await page.keyboard.type(JSON.stringify(user.email.toLowerCase()), {
      delay: 50,
    });
    await expect(
      page.locator('webhook-form').locator('[placeholder=headers]')
    ).toHaveValue(JSON.stringify(user.email.toLowerCase()));

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(4000);

    await page.locator('nz-input-group').locator('input').click();
    await page.keyboard.press('Control+A', { delay: 100 });
    await page.keyboard.type(user.site, { delay: 100 });

    await setTimeout(4000);

    webhookId = (
      await page.locator('webhook-grid').locator('td').nth(0).textContent()
    )?.trim();
    await expect(
      page.locator('webhook-grid').locator('td').nth(1)
    ).toContainText('false');
    await expect(
      page.locator('webhook-grid').locator('td').nth(2)
    ).toContainText(user.site);
    await expect(
      page.locator('webhook-grid').locator('td').nth(3)
    ).toContainText('app-demo.create');
    await expect(
      page.locator('webhook-grid').locator('td').nth(4)
    ).toContainText(JSON.stringify(user.email.toLowerCase()));
    await expect(
      page.locator('webhook-grid').locator('td').nth(5)
    ).toContainText('');
  });

  test('should update webhook endpoint', async () => {
    await page
      .locator('webhook-grid')
      .locator('td')
      .last()
      .locator('a')
      .first()
      .click();

    await setTimeout(7000);

    await expect(
      page.locator('webhook-form').locator('[placeholder=eventName]')
    ).toContainText('create');

    await expect(
      page.locator('webhook-form').locator('[placeholder=endpoint]').first()
    ).toHaveValue(user.site);

    await expect(
      page.locator('webhook-form').locator('[placeholder=headers]')
    ).toHaveValue(JSON.stringify(user.email.toLowerCase()));

    await page
      .locator('webhook-form')
      .locator('[placeholder=endpoint]')
      .click();
    await page.keyboard.press('Control+A', { delay: 100 });
    await page.keyboard.type(`${user.site}/new`, { delay: 100 });
    await expect(
      page.locator('webhook-form').locator('[placeholder=endpoint]').first()
    ).toHaveValue(`${user.site}/new`);

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(4000);

    await page.locator('nz-input-group').locator('input').click();
    await page.keyboard.press('Control+A', { delay: 100 });
    await page.keyboard.type(`${user.site}/new`, { delay: 100 });

    await setTimeout(4000);

    await expect(
      page.locator('webhook-grid').locator('td').nth(0)
    ).toContainText(webhookId || 'empty');
    await expect(
      page.locator('webhook-grid').locator('td').nth(1)
    ).toContainText('false');
    await expect(
      page.locator('webhook-grid').locator('td').nth(2)
    ).toContainText(`${user.site}/new`);
    await expect(
      page.locator('webhook-grid').locator('td').nth(3)
    ).toContainText('app-demo.create');
    await expect(
      page.locator('webhook-grid').locator('td').nth(4)
    ).toContainText(JSON.stringify(user.email.toLowerCase()));
    await expect(
      page.locator('webhook-grid').locator('td').nth(5)
    ).toContainText('');
  });

  test('should delete updated webhook', async () => {
    await page
      .locator('webhook-grid')
      .locator('td')
      .last()
      .locator('a')
      .last()
      .click();

    await setTimeout(7000);

    await expect(
      page
        .locator('nz-modal-confirm-container')
        .locator('.ant-modal-confirm-title')
    ).toContainText(`Delete webhook #${webhookId}`);

    await page
      .locator('nz-modal-confirm-container')
      .locator('.ant-modal-body')
      .locator('button')
      .last()
      .click();

    await setTimeout(4000);

    await expect(
      page.locator('webhook-grid').locator('nz-embed-empty')
    ).toContainText(`No Data`);
  });

  test('sign out', async () => {
    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first()
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(
      page
        .locator('[nz-submenu-none-inline-child]')
        .locator('[nz-menu-item]')
        .last()
    ).toContainText(`Sign-out`);

    await page
      .locator('[nz-submenu-none-inline-child]')
      .locator('[nz-menu-item]')
      .last()
      .click();

    await setTimeout(4000);

    await expect(
      page.locator('nz-header').locator('[nz-menu-item]').nth(-2)
    ).toContainText(`Sign-in`);
  });
});
