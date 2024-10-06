import { Configuration, WebhookApi } from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';

describe('CRUD operations with Webhook as "Admin" role', () => {
  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const user1Headers = getRandomExternalHeaders();
  const adminHeaders = {
    ...getRandomExternalHeaders(),
    ['x-external-user-id']:
      process.env.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID,
  };

  let createEventName: string;

  beforeAll(async () => {
    const { data: events } = await webhookApi.webhookControllerEvents(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    createEventName =
      events.find((e) => e.eventName.includes('create'))?.eventName || 'create';
    expect(events.map((e) => e.eventName)).toEqual([
      'app-demo.create',
      'app-demo.update',
      'app-demo.delete',
    ]);
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    for (const webhook of manyWebhooks.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id']
      );
    }
    //

    const { data: manyWebhooks2 } = await webhookApi.webhookControllerFindMany(
      adminHeaders['x-external-user-id'],
      adminHeaders['x-external-tenant-id']
    );
    for (const webhook of manyWebhooks2.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        adminHeaders['x-external-user-id'],
        adminHeaders['x-external-tenant-id']
      );
    }
  });

  it('should create new webhook as user1', async () => {
    const { data: newWebhook } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: false,
        endpoint: 'http://example.com',
        eventName: createEventName,
      },
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should create new webhook as admin', async () => {
    const { data: newWebhook } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: false,
        endpoint: 'http://example.com',
        eventName: createEventName,
      },
      adminHeaders['x-external-user-id'],
      adminHeaders['x-external-tenant-id']
    );
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should read one webhooks as user', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 1 },
      webhooks: [
        {
          enabled: false,
          endpoint: 'http://example.com',
          eventName: createEventName,
        },
      ],
    });
  });

  it('should read all webhooks as admin', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      adminHeaders['x-external-user-id']
    );
    expect(manyWebhooks.meta.totalResults).toBeGreaterThan(1);
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5 },
    });
  });
});
