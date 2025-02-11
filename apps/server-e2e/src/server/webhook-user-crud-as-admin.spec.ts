import { WebhookErrorEnum } from '@nestjs-mod-fullstack/app-rest-sdk';
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { get } from 'env-var';

describe('CRUD operations with WebhookUser as "Admin" role', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();
  const admin = new RestClientHelper();

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
    await admin.login({
      email: get('SERVER_AUTH_ADMIN_EMAIL').required().asString(),
      password: get('SERVER_AUTH_ADMIN_PASSWORD').required().asString(),
    });

    // on any request we create new user
    await admin.getWebhookApi().webhookControllerEvents();

    // on any request we create new user
    await user1.getWebhookApi().webhookControllerEvents();
  });

  // afterAll(async () => {
  //   const { data: manyWebhooks } = await admin
  //     .getWebhookApi()
  //     .webhookControllerFindMany();
  //   for (const webhook of manyWebhooks.webhooks) {
  //     if (webhook.endpoint.startsWith(admin.getGeneratedRandomUser().site)) {
  //       await admin.getWebhookApi().webhookControllerUpdateOne(webhook.id, {
  //         enabled: false,
  //       });
  //     }
  //   }
  // });

  it('should return error when we try read webhook users as user', async () => {
    await expect(
      user1.getWebhookApi().webhookUsersControllerFindMany()
    ).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum.Webhook001,
      message: 'Forbidden',
    });
  });

  it('should return error when we try update webhook user role to admin as user', async () => {
    const { data: userProfile } = await user1
      .getWebhookApi()
      .webhookControllerProfile();
    await expect(
      user1
        .getWebhookApi()
        .webhookUsersControllerUpdateOne(userProfile.id, { userRole: 'Admin' })
    ).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum.Webhook001,
      message: 'Forbidden',
    });
  });

  it('should update webhook user role to admin as admin', async () => {
    const { data: userProfile } = await user1
      .getWebhookApi()
      .webhookControllerProfile();
    const { data: newWebhook } = await admin
      .getWebhookApi()
      .webhookUsersControllerUpdateOne(userProfile.id, { userRole: 'Admin' });
    expect(newWebhook).toMatchObject({
      userRole: 'Admin',
    });
  });

  it('should read webhook users as user', async () => {
    const webhookUsersControllerFindManyResult = await user1
      .getWebhookApi()
      .webhookUsersControllerFindMany(undefined, undefined, 1, 10000);

    expect(
      webhookUsersControllerFindManyResult.data.webhookUsers.filter(
        (u) => u.externalUserId === user1.getWebhookProfile()?.externalUserId
      )[0]
    ).toMatchObject({
      userRole: 'Admin',
    });
  });
});
