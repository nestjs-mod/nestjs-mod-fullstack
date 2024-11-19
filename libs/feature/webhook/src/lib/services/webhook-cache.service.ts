import { CacheManagerService } from '@nestjs-mod/cache-manager';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient, WebhookUser } from '@prisma/webhook-client';
import { WEBHOOK_FEATURE } from '../webhook.constants';

@Injectable()
export class WebhookCacheService {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly cacheManagerService: CacheManagerService
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const webhookUsers = await this.prismaClient.webhookUser.findMany({
      where: { externalUserId },
    });
    for (const webhookUser of webhookUsers) {
      await this.cacheManagerService.del(
        `${webhookUser.externalTenantId}_${webhookUser.externalUserId}`
      );
    }
  }

  async getCachedUserByExternalUserId(
    externalUserId: string,
    externalTenantId?: string
  ) {
    const cached = await this.cacheManagerService.get<WebhookUser | null>(
      `${externalTenantId}_${externalUserId}`
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
      await this.cacheManagerService.set(
        `${user.externalTenantId}_${user.externalUserId}`,
        user,
        15_000 // 15 seconds
      );
      return user;
    }
    return null;
  }
}
