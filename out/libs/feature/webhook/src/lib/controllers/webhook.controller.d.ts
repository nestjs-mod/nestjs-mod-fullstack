import { FindManyArgs } from '@nestjs-mod-fullstack/common';
import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { Prisma, PrismaClient } from '@prisma/webhook-client';
import { TranslatesService } from 'nestjs-translates';
import { CreateWebhookDto } from '../generated/rest/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../generated/rest/dto/update-webhook.dto';
import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { WebhookConfiguration } from '../webhook.configuration';
export declare class WebhookController {
  private readonly prismaClient;
  private readonly webhookConfiguration;
  private readonly prismaToolsService;
  private readonly webhookToolsService;
  private readonly translatesService;
  constructor(
    prismaClient: PrismaClient,
    webhookConfiguration: WebhookConfiguration,
    prismaToolsService: PrismaToolsService,
    webhookToolsService: WebhookToolsService,
    translatesService: TranslatesService
  );
  profile(webhookUser: WebhookUser): Promise<WebhookUser>;
  events(): Promise<
    {
      descriptionLocale: {
        en: string;
      };
      eventName: string;
      description: string;
      example: object;
    }[]
  >;
  findMany(
    externalTenantId: string,
    webhookUser: WebhookUser,
    args: FindManyArgs
  ): Promise<{
    webhooks: {
      eventName: string;
      id: string;
      externalTenantId: string;
      createdAt: Date;
      updatedAt: Date;
      endpoint: string;
      enabled: boolean;
      headers: Prisma.JsonValue | null;
      requestTimeout: number | null;
      createdBy: string;
      updatedBy: string;
      workUntilDate: Date | null;
    }[];
    meta: {
      totalResults: number;
      curPage: number;
      perPage: number;
    };
  }>;
  createOne(
    externalTenantId: string,
    webhookUser: WebhookUser,
    args: CreateWebhookDto
  ): Promise<{
    eventName: string;
    id: string;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    endpoint: string;
    enabled: boolean;
    headers: Prisma.JsonValue | null;
    requestTimeout: number | null;
    createdBy: string;
    updatedBy: string;
    workUntilDate: Date | null;
  }>;
  updateOne(
    externalTenantId: string,
    webhookUser: WebhookUser,
    id: string,
    args: UpdateWebhookDto
  ): Promise<{
    eventName: string;
    id: string;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    endpoint: string;
    enabled: boolean;
    headers: Prisma.JsonValue | null;
    requestTimeout: number | null;
    createdBy: string;
    updatedBy: string;
    workUntilDate: Date | null;
  }>;
  deleteOne(
    externalTenantId: string,
    webhookUser: WebhookUser,
    id: string,
    locale: string
  ): Promise<{
    message: string;
  }>;
  findOne(
    externalTenantId: string,
    webhookUser: WebhookUser,
    id: string
  ): Promise<{
    eventName: string;
    id: string;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    endpoint: string;
    enabled: boolean;
    headers: Prisma.JsonValue | null;
    requestTimeout: number | null;
    createdBy: string;
    updatedBy: string;
    workUntilDate: Date | null;
  }>;
  findManyLogs(
    externalTenantId: string,
    webhookUser: WebhookUser,
    id: string,
    args: FindManyArgs
  ): Promise<{
    webhookLogs: {
      id: string;
      request: Prisma.JsonValue;
      responseStatus: string;
      response: Prisma.JsonValue | null;
      webhookStatus: import('@prisma/webhook-client').$Enums.WebhookStatus;
      webhookId: string;
      externalTenantId: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
    meta: {
      totalResults: number;
      curPage: number;
      perPage: number;
    };
  }>;
}
