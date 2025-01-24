'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookUsersService = void 0;
const tslib_1 = require('tslib');
const prisma_1 = require('@nestjs-mod/prisma');
const common_1 = require('@nestjs/common');
const webhook_client_1 = require('@prisma/webhook-client');
const fp_1 = require('lodash/fp');
const node_crypto_1 = require('node:crypto');
const webhook_constants_1 = require('../webhook.constants');
let WebhookUsersService = class WebhookUsersService {
  constructor(prismaClient) {
    this.prismaClient = prismaClient;
  }
  async createUserIfNotExists(user) {
    const data = {
      externalTenantId: (0, node_crypto_1.randomUUID)(),
      userRole: 'User',
      ...(0, fp_1.omit)(
        [
          'id',
          'createdAt',
          'updatedAt',
          'Webhook_Webhook_createdByToWebhookUser',
          'Webhook_Webhook_updatedByToWebhookUser',
        ],
        user
      ),
    };
    const existsUser = await this.prismaClient.webhookUser.findFirst({
      where: {
        externalTenantId: user.externalTenantId,
        externalUserId: user.externalUserId,
      },
    });
    if (!existsUser) {
      return await this.prismaClient.webhookUser.create({
        data,
      });
    }
    return existsUser;
  }
};
exports.WebhookUsersService = WebhookUsersService;
exports.WebhookUsersService = WebhookUsersService = tslib_1.__decorate(
  [
    (0, common_1.Injectable)(),
    tslib_1.__param(
      0,
      (0, prisma_1.InjectPrismaClient)(webhook_constants_1.WEBHOOK_FEATURE)
    ),
    tslib_1.__metadata('design:paramtypes', [webhook_client_1.PrismaClient]),
  ],
  WebhookUsersService
);
//# sourceMappingURL=webhook-users.service.js.map
