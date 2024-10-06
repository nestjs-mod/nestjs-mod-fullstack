import {
  Configuration,
  WebhookApi,
  WebhookErrorEnum,
} from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';

describe('CRUD operations with WebhookUser as "Admin" role', () => {
  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const user1Headers = getRandomExternalHeaders();
  const adminHeaders = {
    ...getRandomExternalHeaders(),
    ['x-external-user-id']:
      process.env.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID,
  };

  beforeAll(async () => {
    // on any request we create new user
    await webhookApi.webhookControllerEvents(
      adminHeaders['x-external-user-id'],
      adminHeaders['x-external-tenant-id']
    );

    // on any request we create new user
    await webhookApi.webhookControllerEvents(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(
      adminHeaders['x-external-user-id'],
      adminHeaders['x-external-tenant-id']
    );
    for (const webhook of manyWebhooks.webhooks) {
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

  it('should return error when we try read webhook users as user', async () => {
    await expect(
      webhookApi.webhookUsersControllerFindMany(
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id']
      )
    ).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum._001,
      message: 'Forbidden',
    });
  });

  it('should update webhook user role to admin as admin', async () => {
    const { data: userProfile } = await webhookApi.webhookControllerProfile(
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id']
    );
    const { data: newWebhook } =
      await webhookApi.webhookUsersControllerUpdateOne(
        userProfile.id,
        { userRole: 'Admin' },
        adminHeaders['x-external-user-id']
      );
    expect(newWebhook).toMatchObject({
      userRole: 'Admin',
    });
  });

  it('should read webhook users as user', async () => {
    const webhookUsersControllerFindManyResult =
      await webhookApi.webhookUsersControllerFindMany(
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id']
      );
    expect(
      webhookUsersControllerFindManyResult.data.webhookUsers[0]
    ).toMatchObject({
      userRole: 'Admin',
    });
  });
});
