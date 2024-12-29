import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { addHours, differenceInHours } from 'date-fns';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Work with profile as "User" role (timezone', () => {
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
    await page.goto('/', {
      timeout: 7000,
    });
    await page.evaluate(
      (authorizerURL) => localStorage.setItem('authorizerURL', authorizerURL),
      get('SERVER_AUTHORIZER_URL').required().asString()
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

    await setTimeout(3000);

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
      page.locator('nz-header').locator('[nz-menu-item]').last()
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

    await setTimeout(3000);

    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first()
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should change timezone in profile', async () => {
    const oldServerTime = await page.locator('#serverTime').innerText();
    expect(
      oldServerTime
        .split(' ')
        .filter((p, i) => i !== 3)
        .join(' ')
    ).toEqual(
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
        .format(addHours(new Date(), new Date().getTimezoneOffset() / 60))
        .split(' ')
        .filter((p, i) => i !== 3)
        .join(' ')
    );

    await expect(
      page.locator('nz-header').locator('[nz-submenu]').first()
    ).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(
      page
        .locator('[nz-submenu-none-inline-child]')
        .locator('[nz-menu-item]')
        .first()
    ).toContainText(`Profile`);

    await page
      .locator('[nz-submenu-none-inline-child]')
      .locator('[nz-menu-item]')
      .first()
      .click();

    await setTimeout(4000);
    //
    await page
      .locator('auth-profile-form')
      .locator('[placeholder=timezone]')
      .click();
    await page.keyboard.press('Enter', { delay: 100 });
    await expect(
      page.locator('auth-profile-form').locator('[placeholder=timezone]')
    ).toContainText('UTC−12:00: Date Line (west)');

    await expect(
      page.locator('auth-profile-form').locator('button[type=submit]')
    ).toHaveText('Update');

    await page
      .locator('auth-profile-form')
      .locator('button[type=submit]')
      .click();

    await setTimeout(10000);

    const newServerTime = await page.locator('#serverTime').innerText();
    expect(
      newServerTime
        .split(' ')
        .filter((p, i) => i !== 3)
        .join(' ')
    ).toEqual(
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
        .format(addHours(new Date(), new Date().getTimezoneOffset() / 60 + -12))
        .split(' ')
        .filter((p, i) => i !== 3)
        .join(' ')
    );
    const oldTimeIsPM =
      oldServerTime
        .split(' ')
        .filter((p, i) => i === 4)
        .join(' ') === 'PM';
    const newTimeIsPM =
      newServerTime
        .split(' ')
        .filter((p, i) => i === 4)
        .join(' ') === 'PM';

    const oldTime = oldServerTime
      .split(' ')
      .filter((p, i) => i === 3)
      .join(' ');
    const newTime = newServerTime
      .split(' ')
      .filter((p, i) => i === 3)
      .join(' ');

    expect(
      differenceInHours(
        addHours(
          new Date(
            `1985-05-11T${(newTime.length === 7 ? '0' : '') + newTime}.000Z`
          ),
          newTimeIsPM ? 12 : 0
        ),
        addHours(
          new Date(
            `1985-05-11T${(oldTime.length === 7 ? '0' : '') + oldTime}.000Z`
          ),
          oldTimeIsPM ? 12 : 0
        )
      )
    ).toBeGreaterThanOrEqual(11);
  });
});
