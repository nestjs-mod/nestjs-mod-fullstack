import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';
import { expect, Page, test } from '@playwright/test';
import { writeFileSync } from 'fs';
import { setTimeout } from 'timers/promises';

test.describe('CRUD operations with Webhook as "User" role', () => {
  const user1Headers = getRandomExternalHeaders();

  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let webhookId: string | null;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('sign in as user', async () => {
    await page.goto('/sign-in', {
      timeout: 5000,
    });

    await page
      .locator('webhook-auth-form')
      .locator('[placeholder=xExternalUserId]')
      .click();
    await page.keyboard.type(user1Headers['x-external-user-id'], {
      delay: 100,
    });
    await expect(
      page.locator('webhook-auth-form').locator('[placeholder=xExternalUserId]')
    ).toHaveValue(user1Headers['x-external-user-id']);

    await page
      .locator('webhook-auth-form')
      .locator('[placeholder=xExternalTenantId]')
      .click();
    await page.keyboard.type(user1Headers['x-external-tenant-id'], {
      delay: 100,
    });
    await expect(
      page
        .locator('webhook-auth-form')
        .locator('[placeholder=xExternalTenantId]')
    ).toHaveValue(user1Headers['x-external-tenant-id']);

    await expect(
      page.locator('webhook-auth-form').locator('button[type=submit]')
    ).toHaveText('Sign-in');

    await page
      .locator('webhook-auth-form')
      .locator('button[type=submit]')
      .click();
  });

  test('should create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(2000);

    await page
      .locator('webhook-form')
      .locator('[placeholder=eventName]')
      .click();
    await page.keyboard.press('Enter', { delay: 100 });
    await expect(
      page.locator('webhook-form').locator('[placeholder=eventName]')
    ).toContainText('create');

    await page
      .locator('webhook-form')
      .locator('[placeholder=endpoint]')
      .click();
    await page.keyboard.type('http://example.com', { delay: 100 });
    await expect(
      page.locator('webhook-form').locator('[placeholder=endpoint]').first()
    ).toHaveValue('http://example.com');

    await page.locator('webhook-form').locator('[placeholder=headers]').click();
    await page.keyboard.type(JSON.stringify(user1Headers), { delay: 100 });
    await expect(
      page.locator('webhook-form').locator('[placeholder=headers]')
    ).toHaveValue(JSON.stringify(user1Headers));

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(2000);

    webhookId = await page
      .locator('webhook-grid')
      .locator('td')
      .nth(0)
      .textContent();
    await expect(
      page.locator('webhook-grid').locator('td').nth(1)
    ).toContainText('false');
    await expect(
      page.locator('webhook-grid').locator('td').nth(2)
    ).toContainText('http://example.com');
    await expect(
      page.locator('webhook-grid').locator('td').nth(3)
    ).toContainText('app-demo.create');
    await expect(
      page.locator('webhook-grid').locator('td').nth(4)
    ).toContainText(JSON.stringify(user1Headers));
    await expect(
      page.locator('webhook-grid').locator('td').nth(5)
    ).toContainText('0');
  });

  test('should update webhook endpoint', async () => {
    await page
      .locator('webhook-grid')
      .locator('td')
      .last()
      .locator('a')
      .first()
      .click();

    await setTimeout(2000);

    await expect(
      page.locator('webhook-form').locator('[placeholder=eventName]')
    ).toContainText('create');

    await expect(
      page.locator('webhook-form').locator('[placeholder=endpoint]').first()
    ).toHaveValue('http://example.com');

    await expect(
      page.locator('webhook-form').locator('[placeholder=headers]')
    ).toHaveValue(JSON.stringify(user1Headers));

    await page
      .locator('webhook-form')
      .locator('[placeholder=endpoint]')
      .click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type('http://example.com/new', { delay: 100 });
    await expect(
      page.locator('webhook-form').locator('[placeholder=endpoint]').first()
    ).toHaveValue('http://example.com/new');

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(2000);

    await expect(
      page.locator('webhook-grid').locator('td').nth(0)
    ).toContainText(webhookId || 'empty');
    await expect(
      page.locator('webhook-grid').locator('td').nth(1)
    ).toContainText('false');
    await expect(
      page.locator('webhook-grid').locator('td').nth(2)
    ).toContainText('http://example.com/new');
    await expect(
      page.locator('webhook-grid').locator('td').nth(3)
    ).toContainText('app-demo.create');
    await expect(
      page.locator('webhook-grid').locator('td').nth(4)
    ).toContainText(JSON.stringify(user1Headers));
    await expect(
      page.locator('webhook-grid').locator('td').nth(5)
    ).toContainText('0');
  });

  test('should delete updated webhook', async () => {
    await page
      .locator('webhook-grid')
      .locator('td')
      .last()
      .locator('a')
      .last()
      .click();

    await setTimeout(2000);

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

    await setTimeout(2000);

    await expect(
      page.locator('webhook-grid').locator('nz-embed-empty')
    ).toContainText(`No Data`);
  });

  test('sign out', async () => {
    await expect(
      page.locator('nz-header').locator('[nz-submenu]')
    ).toContainText(`You are logged in as User`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(
      page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]')
    ).toContainText(`Sign-out`);

    await page
      .locator('[nz-submenu-none-inline-child]')
      .locator('[nz-menu-item]')
      .first()
      .click();

    await setTimeout(2000);

    await expect(
      page.locator('nz-header').locator('[nz-menu-item]').last()
    ).toContainText(`Sign-in`);
  });
});
