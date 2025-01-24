import { KeyvService } from '@nestjs-mod/keyv';
import { PrismaClient } from '@prisma/webhook-client';
import { WebhookConfiguration } from '../webhook.configuration';
export declare class WebhookCacheService {
  private readonly prismaClient;
  private readonly webhookConfiguration;
  private readonly keyvService;
  constructor(
    prismaClient: PrismaClient,
    webhookConfiguration: WebhookConfiguration,
    keyvService: KeyvService
  );
  clearCacheByExternalUserId(externalUserId: string): Promise<void>;
  getCachedUserByExternalUserId(
    externalUserId: string,
    externalTenantId?: string
  ): Promise<{
    id: string;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    externalUserId: string;
    userRole: import('@prisma/webhook-client').$Enums.WebhookRole;
  } | null>;
  private getUserCacheKey;
}
