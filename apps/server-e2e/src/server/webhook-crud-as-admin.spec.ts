import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { get } from 'env-var';

describe('CRUD operations with Webhook as "Admin" role', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();
  const admin = new RestClientHelper({
    isAdmin: true,
  });

  let createEventName: string;

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
    await admin.login({
      email: get('SERVER_AUTH_ADMIN_EMAIL').required().asString(),
      password: get('SERVER_AUTH_ADMIN_PASSWORD').required().asString(),
    });

    const { data: events } = await user1
      .getWebhookApi()
      .webhookControllerEvents();
    createEventName =
      events.find((e) => e.eventName.includes('create'))?.eventName || 'create';
    expect(events.map((e) => e.eventName)).toEqual([
      'app-demo.create',
      'app-demo.update',
      'app-demo.delete',
    ]);
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    for (const webhook of manyWebhooks.webhooks) {
      if (webhook.endpoint.startsWith(user1.getGeneratedRandomUser().site)) {
        await user1.getWebhookApi().webhookControllerUpdateOne(webhook.id, {
          enabled: false,
        });
      }
    }
    //

    const { data: manyWebhooks2 } = await admin
      .getWebhookApi()
      .webhookControllerFindMany();
    for (const webhook of manyWebhooks2.webhooks) {
      if (webhook.endpoint.startsWith(admin.getGeneratedRandomUser().site)) {
        await admin.getWebhookApi().webhookControllerUpdateOne(webhook.id, {
          enabled: false,
        });
      }
    }
  });

  it('should create new webhook as user1', async () => {
    const { data: newWebhook } = await user1
      .getWebhookApi()
      .webhookControllerCreateOne({
        enabled: false,
        endpoint: user1.getGeneratedRandomUser().site,
        eventName: createEventName,
      });
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: user1.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
  });

  it('should create new webhook as admin', async () => {
    const { data: newWebhook } = await admin
      .getWebhookApi()
      .webhookControllerCreateOne({
        enabled: false,
        endpoint: admin.getGeneratedRandomUser().site,
        eventName: createEventName,
      });
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: admin.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
  });

  it('should read one webhooks as user', async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 1 },
      webhooks: [
        {
          enabled: false,
          endpoint: user1.getGeneratedRandomUser().site,
          eventName: createEventName,
        },
      ],
    });
  });

  it('should read all webhooks as admin', async () => {
    const { data: manyWebhooks } = await admin
      .getWebhookApi()
      .webhookControllerFindMany();
    expect(manyWebhooks.meta.totalResults).toBeGreaterThan(1);
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5 },
    });
  });
});
