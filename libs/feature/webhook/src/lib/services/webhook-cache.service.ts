import { CacheManagerService } from '@nestjs-mod/cache-manager';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient, WebhookUser } from '@prisma/webhook-client';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import { WebhookConfiguration } from '../webhook.configuration';

@Injectable()
export class WebhookCacheService {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly cacheManagerService: CacheManagerService
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const webhookUsers = await this.prismaClient.webhookUser.findMany({
      where: { externalUserId },
    });
    for (const webhookUser of webhookUsers) {
      await this.cacheManagerService.del(this.getUserCacheKey(webhookUser));
    }
  }

  async getCachedUserByExternalUserId(
    externalUserId: string,
    externalTenantId?: string
  ) {
    const cached = await this.cacheManagerService.get<WebhookUser | null>(
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
      await this.cacheManagerService.set(
        this.getUserCacheKey({ externalTenantId, externalUserId }),
        user,
        this.webhookConfiguration.cacheTTL
      );
      return user;
    }
    return null;
  }

  private getUserCacheKey({
    externalTenantId,
    externalUserId,
  }: {
    externalTenantId: string | undefined;
    externalUserId: string;
  }): string {
    return `${externalTenantId}_${externalUserId}`;
  }
}