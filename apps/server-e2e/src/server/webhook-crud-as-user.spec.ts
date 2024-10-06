import {
  Configuration,
  WebhookApi,
  WebhookErrorEnum,
} from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';

describe('CRUD operations with Webhook as "User" role', () => {
  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const user1Headers = getRandomExternalHeaders();
  const user2Headers = getRandomExternalHeaders();

  let createEventName: string;

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
      user2Headers['x-external-user-id'],
      user2Headers['x-external-tenant-id']
    );
    for (const webhook of manyWebhooks2.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        user2Headers['x-external-user-id'],
        user2Headers['x-external-tenant-id']
      );
    }
  });

  it('should return a list of available event names', async () => {
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

  it('should return error "WEBHOOK-002" about empty user', async () => {
    await expect(
      webhookApi.webhookControllerProfile(
        undefined,
        user1Headers['x-external-tenant-id']
      )
    ).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum._002,
      message: 'User ID not set',
    });
  });

  it('should return error "WEBHOOK-003" about empty tenant', async () => {
    await expect(
      webhookApi.webhookControllerProfile(
        user1Headers['x-external-user-id'],
        undefined
      )
    ).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum._003,
      message: 'Tenant ID not set',
    });
  });

  it('should return profile of webhook auto created user1', async () => {
    const { data: profile } = await webhookApi.webhookControllerProfile(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    expect(profile).toMatchObject({
      externalTenantId: user1Headers['x-external-tenant-id'],
      externalUserId: user1Headers['x-external-user-id'],
      userRole: 'User',
    });
  });

  it('should return profile of webhook auto created user2', async () => {
    const { data: profile } = await webhookApi.webhookControllerProfile(
      user2Headers['x-external-user-id'],
      user2Headers['x-external-tenant-id']
    );
    expect(profile).toMatchObject({
      externalTenantId: user2Headers['x-external-tenant-id'],
      externalUserId: user2Headers['x-external-user-id'],
      userRole: 'User',
    });
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

  it('should create new webhook as user2', async () => {
    const { data: newWebhook } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: false,
        endpoint: 'http://example.com',
        eventName: createEventName,
      },
      user2Headers['x-external-user-id'],
      user2Headers['x-external-tenant-id']
    );
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should read all webhooks', async () => {
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

  it('should read one webhook by id', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    const { data: oneWebhook } = await webhookApi.webhookControllerFindOne(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    expect(oneWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should update webhook endpoint', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    const { data: updatedWebhook } =
      await webhookApi.webhookControllerUpdateOne(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
        {
          endpoint: 'http://example.com/new',
        },
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id']
      );
    expect(updatedWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com/new',
      eventName: createEventName,
    });
  });

  it('should delete updated webhook', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    const { data: deletedWebhook } =
      await webhookApi.webhookControllerDeleteOne(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id']
      );
    expect(deletedWebhook).toMatchObject({ message: 'ok' });

    const { data: manyWebhooksAfterDeleteOne } =
      await webhookApi.webhookControllerFindMany(
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id']
      );
    expect(manyWebhooksAfterDeleteOne).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 0 },
      webhooks: [],
    });
  });
});
