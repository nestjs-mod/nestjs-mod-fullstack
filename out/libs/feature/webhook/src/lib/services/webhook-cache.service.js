'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookCacheService = void 0;
const tslib_1 = require('tslib');
const keyv_1 = require('@nestjs-mod/keyv');
const prisma_1 = require('@nestjs-mod/prisma');
const common_1 = require('@nestjs/common');
const webhook_client_1 = require('@prisma/webhook-client');
const webhook_configuration_1 = require('../webhook.configuration');
const webhook_constants_1 = require('../webhook.constants');
let WebhookCacheService = class WebhookCacheService {
  constructor(prismaClient, webhookConfiguration, keyvService) {
    this.prismaClient = prismaClient;
    this.webhookConfiguration = webhookConfiguration;
    this.keyvService = keyvService;
  }
  async clearCacheByExternalUserId(externalUserId) {
    const webhookUsers = await this.prismaClient.webhookUser.findMany({
      where: { externalUserId },
    });
    for (const webhookUser of webhookUsers) {
      await this.keyvService.delete(this.getUserCacheKey(webhookUser));
    }
  }
  async getCachedUserByExternalUserId(externalUserId, externalTenantId) {
    const cached = await this.keyvService.get(
      this.getUserCacheKey({
        externalUserId,
        externalTenantId,
      })
    );
    if (cached) {
      return cached;
    }
    const user = await this.prismaClient.webhookUser.findFirst({
      where: {
        externalUserId,
        ...(externalTenantId ? { externalTenantId } : {}),
      },
    });
    if (user) {
      await this.keyvService.set(
        this.getUserCacheKey({ externalTenantId, externalUserId }),
        user,
        this.webhookConfiguration.cacheTTL
      );
      return user;
    }
    return null;
  }
  getUserCacheKey({ externalTenantId, externalUserId }) {
    return `webhookUser.${externalTenantId}_${externalUserId}`;
  }
};
exports.WebhookCacheService = WebhookCacheService;
exports.WebhookCacheService = WebhookCacheService = tslib_1.__decorate(
  [
    (0, common_1.Injectable)(),
    tslib_1.__param(
      0,
      (0, prisma_1.InjectPrismaClient)(webhook_constants_1.WEBHOOK_FEATURE)
    ),
    tslib_1.__metadata('design:paramtypes', [
      webhook_client_1.PrismaClient,
      webhook_configuration_1.WebhookConfiguration,
      keyv_1.KeyvService,
    ]),
  ],
  WebhookCacheService
);
//# sourceMappingURL=webhook-cache.service.js.map
