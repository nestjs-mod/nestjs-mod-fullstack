import { KeyvService } from '@nestjs-mod/keyv';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient, WebhookUser } from '@prisma/webhook-client';
import { WebhookConfiguration } from '../webhook.configuration';
import { WEBHOOK_FEATURE } from '../webhook.constants';

@Injectable()
export class WebhookCacheService {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly keyvService: KeyvService
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const webhookUsers = await this.prismaClient.webhookUser.findMany({
      where: { externalUserId },
    });
    for (const webhookUser of webhookUsers) {
      await this.keyvService.delete(this.getUserCacheKey(webhookUser));
    }
  }

  async getCachedUserByExternalUserId(
    externalUserId: string,
    externalTenantId?: string
  ) {
    const cached = await this.keyvService.get<WebhookUser>(
      this.getUserCacheKey({
        externalUserId,
        externalTenantId,
      })
    );
    if (cached) {
      return cached as WebhookUser;
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

  private getUserCacheKey({
    externalTenantId,
    externalUserId,
  }: {
    externalTenantId: string | undefined;
    externalUserId: string;
  }): string {
    return `webhookUser.${externalTenantId}_${externalUserId}`;
  }
}
