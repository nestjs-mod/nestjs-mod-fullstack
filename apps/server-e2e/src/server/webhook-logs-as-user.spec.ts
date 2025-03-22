import { getUrls, RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { randomUUID } from 'crypto';
import { get } from 'env-var';

import { setTimeout } from 'timers/promises';

describe('CRUD and business operations with WebhookLog as "User" role', () => {
  jest.setTimeout(60000);

  const appId = randomUUID();

  let endpoint: string;
  let wrongEndpoint: string;

  const user1 = new RestClientHelper();
  const admin = new RestClientHelper();

  let createEventName: string;
  let updateEventName: string;
  let deleteEventName: string;

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
    await admin.login({
      email: get('SERVER_AUTH_ADMIN_EMAIL').required().asString(),
      password: get('SERVER_AUTH_ADMIN_PASSWORD').required().asString(),
    });

    endpoint = getUrls().serverUrl + '/fake-endpoint';
    wrongEndpoint = 'http://localhost:17351/wrong-endpoint';

    const { data: webhooks } = await admin
      .getWebhookApi()
      .webhookControllerFindMany(1, 1000);
    for (const webhook of webhooks.webhooks) {
      if (webhook.enabled) {
        await admin
          .getWebhookApi()
          .webhookControllerUpdateOne(webhook.id, { enabled: false });
      }
    }
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
    const { data: events } = await user1
      .getWebhookApi()
      .webhookControllerEvents();
    createEventName =
      events.find((e) => e.eventName.includes('app-demo.create'))?.eventName ||
      'create';
    updateEventName =
      events.find((e) => e.eventName.includes('app-demo.update'))?.eventName ||
      'update';
    deleteEventName =
      events.find((e) => e.eventName.includes('app-demo.delete'))?.eventName ||
      'delete';

    expect(events.map((e) => e.eventName)).toEqual([
      'auth.user-create',
      'auth.user-update',
      'auth.user-delete',
      'files.delete',
      'app-demo.create',
      'app-demo.update',
      'app-demo.delete',
    ]);
  });

  it('should create new webhooks', async () => {
    const { data: newWebhook1 } = await user1
      .getWebhookApi()
      .webhookControllerCreateOne({
        enabled: true,
        endpoint,
        eventName: createEventName,
        headers: { 'app-id': appId, 'event-name': createEventName },
      });
    expect(newWebhook1).toMatchObject({
      enabled: true,
      endpoint,
      eventName: createEventName,
    });

    //////

    const { data: newWebhook2 } = await user1
      .getWebhookApi()
      .webhookControllerCreateOne({
        enabled: true,
        endpoint: wrongEndpoint,
        eventName: deleteEventName,
        headers: { 'app-id': appId, 'event-name': deleteEventName },
      });
    expect(newWebhook2).toMatchObject({
      enabled: true,
      endpoint: wrongEndpoint,
      eventName: deleteEventName,
    });
    //////

    const { data: newWebhook3 } = await user1
      .getWebhookApi()
      .webhookControllerCreateOne({
        enabled: true,
        endpoint,
        eventName: updateEventName,
        headers: { 'app-id': appId, 'event-name': updateEventName },
      });
    expect(newWebhook3).toMatchObject({
      enabled: true,
      endpoint,
      eventName: updateEventName,
    });
  });

  it('should create webhook log info after create app-demo', async () => {
    const { data } = await user1.getAppApi().appControllerDemoCreateOne();

    // wait event processing
    await setTimeout(4000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appHandlerLogs: any = (
      await user1
        .getFakeEndpointApi()
        .fakeEndpointControllerFakeEndpointLogs(appId)
    ).data;

    const my = appHandlerLogs.filter(
      (l) =>
        l.headers['event-name'] === createEventName &&
        l.headers['external-user-id'] ===
          user1.getWebhookProfile()?.externalUserId
    );
    expect(data).toMatchObject({
      ...my[0].body,
      // ignore date fields with tz
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    expect(my).toHaveLength(1);

    const { data: findMany } = await user1
      .getAppApi()
      .appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === my[0].body.id)).toHaveLength(1);
  });

  it('should create webhook log info after update app-demo', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let appHandlerLogs: any = (
      await user1
        .getFakeEndpointApi()
        .fakeEndpointControllerFakeEndpointLogs(appId)
    ).data;

    await user1
      .getAppApi()
      .appControllerDemoUpdateOne(appHandlerLogs[0].body.id);

    // wait event processing
    await setTimeout(4000);

    appHandlerLogs = (
      await user1
        .getFakeEndpointApi()
        .fakeEndpointControllerFakeEndpointLogs(appId)
    ).data;
    const my = appHandlerLogs.filter(
      (l) =>
        l.headers['event-name'] === updateEventName &&
        l.headers['external-user-id'] ===
          user1.getWebhookProfile()?.externalUserId
    );

    expect(my).toHaveLength(1);
  });

  it('should create webhook log info after delete app-demo', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let appHandlerLogs: any = (
      await user1
        .getFakeEndpointApi()
        .fakeEndpointControllerFakeEndpointLogs(appId)
    ).data;

    await user1
      .getAppApi()
      .appControllerDemoDeleteOne(appHandlerLogs[0].body.id);

    // wait event processing
    await setTimeout(4000);

    appHandlerLogs = (
      await user1
        .getFakeEndpointApi()
        .fakeEndpointControllerFakeEndpointLogs(appId)
    ).data;

    const my = appHandlerLogs.filter(
      (l) =>
        l.headers['event-name'] === deleteEventName &&
        l.headers['external-user-id'] ===
          user1.getWebhookProfile()?.externalUserId
    );

    expect(my).toHaveLength(0);

    const { data: findMany } = await user1
      .getAppApi()
      .appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === my[0]?.body?.id)).toHaveLength(0);
  });

  it('should read all created webhook logs for "create" event', async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    const { data: manyWebhookLogs } = await user1
      .getWebhookApi()
      .webhookControllerFindManyLogs(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id
      );

    expect({
      ...manyWebhookLogs,
      webhookLogs: manyWebhookLogs.webhookLogs.filter(
        (l) =>
          l.request?.['headers']?.['external-user-id'] ===
          user1.getWebhookProfile()?.externalUserId
      ),
    }).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'OK',
          webhookStatus: 'Success',
          webhookId: manyWebhooks.webhooks.find(
            (w) => w.eventName === createEventName
          )?.id,
        },
      ],
    });
  });

  it('should read all created webhook logs for "delete" event', async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    const { data: manyWebhookLogs } = await user1
      .getWebhookApi()
      .webhookControllerFindManyLogs(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === deleteEventName)!.id
      );

    expect({
      ...manyWebhookLogs,
      webhookLogs: manyWebhookLogs.webhookLogs.filter(
        (l) =>
          l.request?.['headers']?.['external-user-id'] ===
          user1.getWebhookProfile()?.externalUserId
      ),
    }).toMatchObject({
      webhookLogs: [
        {
          // response: 'connect ECONNREFUSED 127.0.0.1:17351',
          responseStatus: '',
          webhookStatus: 'Error',
          webhookId: manyWebhooks.webhooks.find(
            (w) => w.eventName === deleteEventName
          )?.id,
        },
      ],
    });
  });

  it('should read all created webhook logs for "update" event', async () => {
    const { data: manyWebhooks } = await user1
      .getWebhookApi()
      .webhookControllerFindMany();
    const { data: manyWebhookLogs } = await user1
      .getWebhookApi()
      .webhookControllerFindManyLogs(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === updateEventName)!.id
      );

    expect({
      ...manyWebhookLogs,
      webhookLogs: manyWebhookLogs.webhookLogs.filter(
        (l) =>
          l.request?.['headers']?.['external-user-id'] ===
          user1.getWebhookProfile()?.externalUserId
      ),
    }).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'OK',
          webhookStatus: 'Success',
          webhookId: manyWebhooks.webhooks.find(
            (w) => w.eventName === updateEventName
          )?.id,
        },
      ],
    });
  });
});
