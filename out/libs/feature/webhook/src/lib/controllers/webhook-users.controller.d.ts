import { FindManyArgs } from '@nestjs-mod-fullstack/common';
import { PrismaClient } from '@prisma/webhook-client';
import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { UpdateWebhookUserDto } from '../generated/rest/dto/update-webhook-user.dto';
import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
import { WebhookCacheService } from '../services/webhook-cache.service';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { TranslateFunction } from 'nestjs-translates';
export declare class WebhookUsersController {
  private readonly prismaClient;
  private readonly prismaToolsService;
  private readonly webhookToolsService;
  private readonly webhookCacheService;
  constructor(
    prismaClient: PrismaClient,
    prismaToolsService: PrismaToolsService,
    webhookToolsService: WebhookToolsService,
    webhookCacheService: WebhookCacheService
  );
  findMany(
    externalTenantId: string,
    webhookUser: WebhookUser,
    args: FindManyArgs
  ): Promise<{
    webhookUsers: {
      id: string;
      externalTenantId: string;
      createdAt: Date;
      updatedAt: Date;
      externalUserId: string;
      userRole: import('@prisma/webhook-client').$Enums.WebhookRole;
    }[];
    meta: {
      totalResults: number;
      curPage: number;
      perPage: number;
    };
  }>;
  updateOne(
    externalTenantId: string,
    webhookUser: WebhookUser,
    id: string,
    args: UpdateWebhookUserDto
  ): Promise<{
    id: string;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    externalUserId: string;
    userRole: import('@prisma/webhook-client').$Enums.WebhookRole;
  }>;
  deleteOne(
    externalTenantId: string,
    webhookUser: WebhookUser,
    id: string,
    getText: TranslateFunction
  ): Promise<{
    message: string;
  }>;
  findOne(
    externalTenantId: string,
    webhookUser: WebhookUser,
    id: string
  ): Promise<{
    id: string;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    externalUserId: string;
    userRole: import('@prisma/webhook-client').$Enums.WebhookRole;
  }>;
}
