import { AuthErrorEnum } from '@nestjs-mod-fullstack/app-rest-sdk';
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';

describe('CRUD operations with Webhook as "User" role', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();
  const user2 = new RestClientHelper();

  let createEventName: string;

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
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
  });

  it('should return a list of available event names', async () => {
    try {
      const { data: events } = await user1
        .getWebhookApi()
        .webhookControllerEvents();
      createEventName =
        events.find((e) => e.eventName.includes('create'))?.eventName ||
        'create';
      expect(events.map((e) => e.eventName)).toEqual([
        'app-demo.create',
        'app-demo.update',
        'app-demo.delete',
      ]);
    } catch (err) {
      console.log(err);
      throw err;
    }
  });

  it('should return error "AUTH-001" about empty user', async () => {
    await expect(
      user2.getWebhookApi().webhookControllerProfile()
    ).rejects.toHaveProperty('response.data', {
      code: AuthErrorEnum.Auth001,
      message: 'Unauthorized',
    });
  });

  it('should return profile of webhook auto created user1', async () => {
    const { data: profile } = await user1
      .getWebhookApi()
      .webhookControllerProfile();
    expect(profile).toMatchObject({
      userRole: 'User',
    });
  });

  it('should return profile of webhook auto created user2', async () => {
    await user2.createAndLoginAsUser();

    const { data: profile } = await user2
      .getWebhookApi()
      .webhookControllerProfile();
    expect(profile).toMatchObject({
      userRole: 'User',
    });
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

  it('should create new webhook as user2', async () => {
    const { data: newWebhook } = await user2
      .getWebhookApi()
      .webhookControllerCreateOne({
        enabled: false,
        endpoint: user2.getGeneratedRandomUser().site,
        eventName: createEventName,
      });
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: user2.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
  });

  it('should read all webhooks', async () => {
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

  it('should read one webhook by id', async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    const { data: oneWebhook } = await user1
      .getWebhookApi()
      .webhookControllerFindOne(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id
      );
    expect(oneWebhook).toMatchObject({
      enabled: false,
      endpoint: user1.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
  });

  it('should update webhook endpoint', async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    const { data: updatedWebhook } = await user1
      .getWebhookApi()
      .webhookControllerUpdateOne(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
        {
          endpoint: `${user1.getGeneratedRandomUser().site}/new`,
        }
      );
    expect(updatedWebhook).toMatchObject({
      enabled: false,
      endpoint: `${user1.getGeneratedRandomUser().site}/new`,
      eventName: createEventName,
    });
  });

  it('should delete updated webhook', async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    const { data: deletedWebhook } = await user1
      .getWebhookApi()
      .webhookControllerDeleteOne(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id
      );
    expect(deletedWebhook).toMatchObject({ message: 'ok' });

    const { data: manyWebhooksAfterDeleteOne } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    expect(manyWebhooksAfterDeleteOne).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 0 },
      webhooks: [],
    });
  });
});
