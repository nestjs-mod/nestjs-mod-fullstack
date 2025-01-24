'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthCacheService = void 0;
const tslib_1 = require('tslib');
const keyv_1 = require('@nestjs-mod/keyv');
const prisma_1 = require('@nestjs-mod/prisma');
const common_1 = require('@nestjs/common');
const auth_client_1 = require('@prisma/auth-client');
const auth_constants_1 = require('../auth.constants');
const auth_environments_1 = require('../auth.environments');
let AuthCacheService = class AuthCacheService {
  constructor(prismaClient, keyvService, authEnvironments) {
    this.prismaClient = prismaClient;
    this.keyvService = keyvService;
    this.authEnvironments = authEnvironments;
  }
  async clearCacheByExternalUserId(externalUserId) {
    const authUsers = await this.prismaClient.authUser.findMany({
      where: { externalUserId },
    });
    for (const authUser of authUsers) {
      await this.keyvService.delete(this.getUserCacheKey(authUser));
    }
  }
  async getCachedUserByExternalUserId(externalUserId) {
    const cached = await this.keyvService.get(
      this.getUserCacheKey({
        externalUserId,
      })
    );
    if (cached) {
      return cached;
    }
    const user = await this.prismaClient.authUser.findFirst({
      where: {
        externalUserId,
      },
    });
    if (user) {
      await this.keyvService.set(
        this.getUserCacheKey({ externalUserId }),
        user,
        this.authEnvironments.cacheTTL
      );
      return user;
    }
    return null;
  }
  getUserCacheKey({ externalUserId }) {
    return `authUser.${externalUserId}`;
  }
};
exports.AuthCacheService = AuthCacheService;
exports.AuthCacheService = AuthCacheService = tslib_1.__decorate(
  [
    (0, common_1.Injectable)(),
    tslib_1.__param(
      0,
      (0, prisma_1.InjectPrismaClient)(auth_constants_1.AUTH_FEATURE)
    ),
    tslib_1.__metadata('design:paramtypes', [
      auth_client_1.PrismaClient,
      keyv_1.KeyvService,
      auth_environments_1.AuthEnvironments,
    ]),
  ],
  AuthCacheService
);
//# sourceMappingURL=auth-cache.service.js.map
