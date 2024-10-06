import {
  Configuration,
  DefaultApi,
  WebhookApi,
} from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';
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
  const appHandlerLogs: any[] = [];

  let app: Express;
  let server: Server;
  let endpoint: string;
  let wrongEndpoint: string;

  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const defaultApi = new DefaultApi(new Configuration({ basePath: '/api' }));

  const headers = getRandomExternalHeaders();

  let createEventName: string;
  let updateEventName: string;
  let deleteEventName: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post(appHandler, async (req, res) => {
      if (req.headers['app-id'] === appId) {
        appHandlerLogs.push(req.body);
      }
      res.send(req.body);
    });
    server = app.listen(0);
    endpoint = `http://localhost:${
      (server.address() as AddressInfo).port
    }${appHandler}`;
    wrongEndpoint = `http://localhost:${
      (server.address() as AddressInfo).port
    }${appHandler}-is-wrong`;
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
    for (const webhook of manyWebhooks.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        headers['x-external-user-id'],
        headers['x-external-tenant-id']
      );
    }
    server.close();
  });

  it('should return a list of available event names', async () => {
    const { data: events } = await webhookApi.webhookControllerEvents(
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
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
    const { data: newWebhook1 } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: true,
        endpoint,
        eventName: createEventName,
        headers: { 'app-id': appId },
      },
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
    expect(newWebhook1).toMatchObject({
      enabled: true,
      endpoint,
      eventName: createEventName,
    });

    //////

    const { data: newWebhook2 } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: true,
        endpoint,
        eventName: deleteEventName,
        headers: { 'app-id': appId },
      },
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
    expect(newWebhook2).toMatchObject({
      enabled: true,
      endpoint,
      eventName: deleteEventName,
    });
    //////

    const { data: newWebhook3 } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: true,
        endpoint: wrongEndpoint,
        eventName: updateEventName,
        headers: { 'app-id': appId },
      },
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
    expect(newWebhook3).toMatchObject({
      enabled: true,
      endpoint: wrongEndpoint,
      eventName: updateEventName,
    });
  });

  it('should create webhook log info after create app-demo', async () => {
    const { data } = await defaultApi.appControllerDemoCreateOne();

    // wait event processing
    await setTimeout(1000);

    expect(data).toEqual(appHandlerLogs[0]);
    expect(appHandlerLogs).toHaveLength(1);

    const { data: findMany } = await defaultApi.appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === appHandlerLogs[0].id)).toHaveLength(
      1
    );
  });

  it('should create webhook log info after update app-demo', async () => {
    await defaultApi.appControllerDemoUpdateOne(appHandlerLogs[0].id);

    // wait event processing
    await setTimeout(1000);

    expect(appHandlerLogs).toHaveLength(1);

    const { data: findMany } = await defaultApi.appControllerDemoFindMany();

    // wait event processing
    await setTimeout(1000);

    expect(findMany.filter((d) => d.id === appHandlerLogs[0].id)).toHaveLength(
      1
    );
  });

  it('should create webhook log info after delete app-demo', async () => {
    const { data } = await defaultApi.appControllerDemoDeleteOne(
      appHandlerLogs[0].id
    );

    // wait event processing
    await setTimeout(1000);

    expect(data).not.toEqual(appHandlerLogs[0]);
    expect(appHandlerLogs).toHaveLength(2);

    const { data: findMany } = await defaultApi.appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === appHandlerLogs[0].id)).toHaveLength(
      0
    );
  });

  it('should read all created webhook logs for "create" event', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
    const { data: manyWebhookLogs } =
      await webhookApi.webhookControllerFindManyLogs(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
        headers['x-external-user-id'],
        headers['x-external-tenant-id']
      );

    expect(manyWebhookLogs).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'OK',
          webhookStatus: 'Success',
          webhookId: manyWebhooks.webhooks.find(
            (w) => w.eventName === createEventName
          )?.id,
          externalTenantId: headers['x-external-tenant-id'],
        },
      ],
      meta: { totalResults: 1, curPage: 1, perPage: 5 },
    });
  });

  it('should read all created webhook logs for "delete" event', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
    const { data: manyWebhookLogs } =
      await webhookApi.webhookControllerFindManyLogs(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === deleteEventName)!.id,
        headers['x-external-user-id'],
        headers['x-external-tenant-id']
      );

    expect(manyWebhookLogs).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'OK',
          webhookStatus: 'Success',
          webhookId: manyWebhooks.webhooks.find(
            (w) => w.eventName === deleteEventName
          )?.id,
          externalTenantId: headers['x-external-tenant-id'],
        },
      ],
      meta: { totalResults: 1, curPage: 1, perPage: 5 },
    });
  });
  it('should read all created webhook logs for "update" event', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      headers['x-external-user-id'],
      headers['x-external-tenant-id']
    );
    const { data: manyWebhookLogs } =
      await webhookApi.webhookControllerFindManyLogs(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        manyWebhooks.webhooks.find((w) => w.eventName === updateEventName)!.id,
        headers['x-external-user-id'],
        headers['x-external-tenant-id']
      );

    expect(manyWebhookLogs).toMatchObject({
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
          externalTenantId: headers['x-external-tenant-id'],
        },
      ],
      meta: { totalResults: 1, curPage: 1, perPage: 5 },
    });
  });
});
