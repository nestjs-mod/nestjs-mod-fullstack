import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Validation', () => {
  test.describe.configure({ mode: 'serial' });

  const user = {
    email: faker.internet.email({
      provider: 'example.fakerjs.dev',
    }),
    password: faker.internet.password({ length: 8 }),
    site: `http://${faker.internet.domainName()}`,
  };
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
    await page.goto('/', {
      timeout: 7000,
    });
    await page.evaluate(
      (authorizerURL) => localStorage.setItem('authorizerURL', authorizerURL),
      get('SERVER_AUTHORIZER_URL').asString() || ''
    );
    await page.evaluate(
      (minioURL) => localStorage.setItem('minioURL', minioURL),
      get('SERVER_MINIO_URL').required().asString()
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
      .locator('[placeholder=confirm_password]')
      .click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(
      page
        .locator('auth-sign-up-form')
        .locator('[placeholder=confirm_password]')
    ).toHaveValue(user.password);

    await expect(
      page.locator('auth-sign-up-form').locator('button[type=submit]')
    ).toHaveText('Sign-up');

    await page
      .locator('auth-sign-up-form')
      .locator('button[type=submit]')
      .click();

    await setTimeout(5000);

    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first()
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should catch error on create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(7000);

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(4000);

    await expect(
      page.locator('webhook-form').locator('formly-validation-message').nth(1)
    ).toContainText('field "endpoint" should not be empty');
    await expect(
      page.locator('webhook-form').locator('formly-validation-message').last()
    ).toContainText('field "event name" should not be empty');
  });
});
