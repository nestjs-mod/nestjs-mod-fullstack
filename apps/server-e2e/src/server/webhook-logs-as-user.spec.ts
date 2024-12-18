import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { randomUUID } from 'crypto';

import express, { Express } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { setTimeout } from 'timers/promises';

describe('CRUD and business operations with WebhookLog as "User" role', () => {
  jest.setTimeout(60000);

  const appId = randomUUID();

  const appHandler = '/api/callback-user';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appHandlerLogs: { body: any; headers: any }[] = [];

  let app: Express;
  let server: Server;
  let endpoint: string;
  let wrongEndpoint: string;

  const user1 = new RestClientHelper();

  let createEventName: string;
  let updateEventName: string;
  let deleteEventName: string;

  beforeAll(async () => {
    await user1.createAndLoginAsUser();

    app = express();
    app.use(express.json());
    app.post(appHandler, async (req, res) => {
      if (req.headers['app-id'] === appId) {
        appHandlerLogs.push({ body: req.body, headers: req.headers });
      }
      res.send(req.body);
    });
    server = app.listen(0);
    endpoint = `http://${
      process.env.IS_DOCKER_COMPOSE
        ? 'nestjs-mod-fullstack-e2e-tests'
        : 'localhost'
    }:${(server.address() as AddressInfo).port}${appHandler}`;
    wrongEndpoint = `http://${
      process.env.IS_DOCKER_COMPOSE
        ? 'nestjs-mod-fullstack-e2e-tests'
        : 'localhost'
    }:${(server.address() as AddressInfo).port}${appHandler}-is-wrong`;
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
    server.close();
  });

  it('should return a list of available event names', async () => {
    const { data: events } = await user1
      .getWebhookApi()
      .webhookControllerEvents();
    createEventName =
      events.find((e) => e.eventName.includes('create'))?.eventName || 'create';
    updateEventName =
      events.find((e) => e.eventName.includes('update'))?.eventName || 'update';
    deleteEventName =
      events.find((e) => e.eventName.includes('delete'))?.eventName || 'delete';

    expect(events.map((e) => e.eventName)).toEqual([
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
        endpoint,
        eventName: deleteEventName,
        headers: { 'app-id': appId, 'event-name': deleteEventName },
      });
    expect(newWebhook2).toMatchObject({
      enabled: true,
      endpoint,
      eventName: deleteEventName,
    });
    //////

    const { data: newWebhook3 } = await user1
      .getWebhookApi()
      .webhookControllerCreateOne({
        enabled: true,
        endpoint: wrongEndpoint,
        eventName: updateEventName,
        headers: { 'app-id': appId, 'event-name': updateEventName },
      });
    expect(newWebhook3).toMatchObject({
      enabled: true,
      endpoint: wrongEndpoint,
      eventName: updateEventName,
    });
  });

  it('should create webhook log info after create app-demo', async () => {
    const { data } = await user1.getAppApi().appControllerDemoCreateOne();

    // wait event processing
    await setTimeout(4000);

    const my = appHandlerLogs.filter(
      (l) =>
        l.headers['event-name'] === createEventName &&
        l.headers['external-user-id'] === user1.authorizationTokens?.user?.id
    );
    expect(data).toEqual(my[0].body);
    expect(my).toHaveLength(1);

    const { data: findMany } = await user1
      .getAppApi()
      .appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === my[0].body.id)).toHaveLength(1);
  });

  it('should create webhook log info after update app-demo', async () => {
    await user1
      .getAppApi()
      .appControllerDemoUpdateOne(appHandlerLogs[0].body.id);

    // wait event processing
    await setTimeout(4000);

    const my = appHandlerLogs.filter(
      (l) =>
        l.headers['event-name'] === updateEventName &&
        l.headers['external-user-id'] === user1.authorizationTokens?.user?.id
    );

    expect(my).toHaveLength(0);
  });

  it('should create webhook log info after delete app-demo', async () => {
    await user1
      .getAppApi()
      .appControllerDemoDeleteOne(appHandlerLogs[0].body.id);

    // wait event processing
    await setTimeout(4000);

    const my = appHandlerLogs.filter(
      (l) =>
        l.headers['event-name'] === deleteEventName &&
        l.headers['external-user-id'] === user1.authorizationTokens?.user?.id
    );

    expect(my).toHaveLength(1);

    const { data: findMany } = await user1
      .getAppApi()
      .appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === my[0].body.id)).toHaveLength(0);
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
          user1.authorizationTokens?.user?.id
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
          user1.authorizationTokens?.user?.id
      ),
    }).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'OK',
          webhookStatus: 'Success',
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
          user1.authorizationTokens?.user?.id
      ),
    }).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'Not Found',
          response:
            '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '<head>\n' +
            '<meta charset="utf-8">\n' +
            '<title>Error</title>\n' +
            '</head>\n' +
            '<body>\n' +
            '<pre>Cannot POST /api/callback-user-is-wrong</pre>\n' +
            '</body>\n' +
            '</html>\n',
          webhookStatus: 'Error',
          webhookId: manyWebhooks.webhooks.find(
            (w) => w.eventName === updateEventName
          )?.id,
        },
      ],
    });
  });
});
