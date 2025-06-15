import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Validation with store lang in db (ru)', () => {
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
      (ssoURL) => localStorage.setItem('ssoURL', ssoURL),
      get('SERVER_SSO_SSO_URL').asString() || '',
    );
    await page.evaluate(
      (minioURL) => localStorage.setItem('minioURL', minioURL),
      get('SERVER_SSO_MINIO_URL').required().asString(),
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
      page.locator('auth-sign-up-form').locator('[placeholder=email]'),
    ).toHaveValue(user.email.toLowerCase());

    await page
      .locator('auth-sign-up-form')
      .locator('[placeholder=password]')
      .click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(
      page.locator('auth-sign-up-form').locator('[placeholder=password]'),
    ).toHaveValue(user.password);

    await page
      .locator('auth-sign-up-form')
      .locator('[placeholder=confirmPassword]')
      .click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(
      page
        .locator('auth-sign-up-form')
        .locator('[placeholder=confirmPassword]'),
    ).toHaveValue(user.password);

    await expect(
      page.locator('auth-sign-up-form').locator('button[type=submit]'),
    ).toHaveText('Sign-up');

    await page
      .locator('auth-sign-up-form')
      .locator('button[type=submit]')
      .click();

    await page.waitForSelector(
      'div.cdk-overlay-container>div.cdk-global-overlay-wrapper',
    );

    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first(),
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should change language to RU', async () => {
    await expect(
      page.locator('nz-header').locator('[nz-submenu]').last(),
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
      page.locator('nz-header').locator('[nz-submenu]').last(),
    ).toContainText(`RU`);
  });

  test('change lang to en in localStorage', async () => {
    await page.evaluate(() => localStorage.setItem('activeUserLang', 'en'));

    const activeUserLang = await page.evaluate(() =>
      localStorage.getItem('activeUserLang'),
    );

    expect(activeUserLang).toEqual('en');
  });

  test('should catch error on create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(7000);

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(4000);

    await expect(
      page.locator('webhook-form').locator('formly-validation-message').nth(0),
    ).toContainText('поле "адрес" не может быть пустым');
    await expect(
      page.locator('webhook-form').locator('formly-validation-message').nth(1),
    ).toContainText('поле "событие" не может быть пустым');
  });
});
