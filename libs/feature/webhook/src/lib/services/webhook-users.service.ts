import { CacheManagerService } from '@nestjs-mod/cache-manager';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient, WebhookUser } from '@prisma/webhook-client';
import { omit } from 'lodash/fp';
import { randomUUID } from 'node:crypto';
import {
  CreateWebhookUserArgs,
  WebhookUserObject,
} from '../types/webhook-user-object';
import { WEBHOOK_FEATURE } from '../webhook.constants';

@Injectable()
export class WebhookUsersService {
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

  async getUserByExternalUserId(
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

  async createUserIfNotExists(user: Omit<CreateWebhookUserArgs, 'id'>) {
    const data = {
      externalTenantId: randomUUID(),
      userRole: 'User',
      ...omit(
        [
          'id',
          'createdAt',
          'updatedAt',
          'Webhook_Webhook_createdByToWebhookUser',
          'Webhook_Webhook_updatedByToWebhookUser',
        ],
        user
      ),
    } as WebhookUserObject;
    const existsUser = await this.getUserByExternalUserId(
      data.externalUserId,
      data.externalTenantId
    );
    if (existsUser) {
      return existsUser;
    }
    await this.prismaClient.webhookUser.create({
      data,
    });
    return await this.getUserByExternalUserId(
      data.externalUserId,
      data.externalTenantId
    );
  }
}
