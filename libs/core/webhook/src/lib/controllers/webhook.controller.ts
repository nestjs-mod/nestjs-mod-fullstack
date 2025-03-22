import { FindManyArgs, StatusResponse } from '@nestjs-mod-fullstack/common';

import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { ValidationError } from '@nestjs-mod-fullstack/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { Prisma, PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import {
  CurrentLocale,
  TranslatesService,
  TranslatesStorage,
} from 'nestjs-translates';
import { CreateWebhookDto } from '../generated/rest/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../generated/rest/dto/update-webhook.dto';
import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
import { Webhook } from '../generated/rest/dto/webhook.entity';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { WebhookService } from '../services/webhook.service';
import { FindManyWebhookLogResponse } from '../types/find-many-webhook-log-response';
import { FindManyWebhookResponse } from '../types/find-many-webhook-response';
import { WebhookEntities } from '../types/webhook-entities';
import { WebhookEvent } from '../types/webhook-event';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import {
  CheckWebhookRole,
  CurrentWebhookExternalTenantId,
  CurrentWebhookUser,
} from '../webhook.decorators';
import { WebhookError } from '../webhook.errors';

@ApiExtraModels(WebhookError, WebhookEntities, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(WebhookError, ValidationError) },
})
@ApiTags('Webhook')
@CheckWebhookRole([WebhookRole.User, WebhookRole.Admin])
@Controller('/webhook')
export class WebhookController {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly webhookToolsService: WebhookToolsService,
    private readonly webhookService: WebhookService,
    private readonly translatesService: TranslatesService,
    private readonly translatesStorage: TranslatesStorage
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: WebhookUser })
  async profile(@CurrentWebhookUser() webhookUser: WebhookUser) {
    return webhookUser;
  }

  @Get('events')
  @ApiOkResponse({ type: WebhookEvent, isArray: true })
  async events() {
    return this.webhookService.getAllEvents().map((e) => ({
      ...e,
      descriptionLocale: {
        ...Object.fromEntries(
          this.translatesStorage.locales.map((locale) => [
            locale,
            e.descriptionLocale?.[locale] ||
              this.translatesService.translate(e.description, locale),
          ])
        ),
        en: e.description,
      },
    }));
  }

  @Get()
  @ApiOkResponse({ type: FindManyWebhookResponse })
  async findMany(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Query() args: FindManyArgs
  ) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
        curPage: args.curPage,
        perPage: args.perPage,
      });
    const searchText = args.searchText;

    const orderBy = (args.sort || 'createdAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.WebhookScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        webhooks: await prisma.webhook.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [
                          { id: { equals: searchText } },
                          { externalTenantId: { equals: searchText } },
                        ]
                      : []),
                    { endpoint: { contains: searchText, mode: 'insensitive' } },
                    {
                      eventName: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(
              webhookUser,
              webhookUser.userRole === WebhookRole.Admin
                ? undefined
                : externalTenantId
            ),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.webhook.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [
                          { id: { equals: searchText } },
                          { externalTenantId: { equals: searchText } },
                        ]
                      : []),
                    { endpoint: { contains: searchText, mode: 'insensitive' } },
                    {
                      eventName: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(
              webhookUser,
              webhookUser.userRole === WebhookRole.Admin
                ? undefined
                : externalTenantId
            ),
          },
        }),
      };
    });
    return {
      webhooks: result.webhooks,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: Webhook })
  async createOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Body() args: CreateWebhookDto
  ) {
    return await this.prismaClient.webhook.create({
      data: {
        ...args,
        WebhookUser_Webhook_createdByToWebhookUser: {
          connect: { id: webhookUser.id },
        },
        WebhookUser_Webhook_updatedByToWebhookUser: {
          connect: { id: webhookUser.id },
        },
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          externalTenantId
        ),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: Webhook })
  async updateOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateWebhookDto
  ) {
    return await this.prismaClient.webhook.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === WebhookRole.Admin
            ? undefined
            : externalTenantId
        ),
      },
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    // todo: change to InjectTranslateFunction, after write all posts
    @CurrentLocale() locale: string
  ) {
    await this.prismaClient.webhook.delete({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === WebhookRole.Admin
            ? undefined
            : externalTenantId
        ),
      },
    });
    return { message: this.translatesService.translate('ok', locale) };
  }

  @Get(':id')
  @ApiOkResponse({ type: Webhook })
  async findOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return await this.prismaClient.webhook.findFirstOrThrow({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === WebhookRole.Admin
            ? undefined
            : externalTenantId
        ),
      },
    });
  }

  @Get(':id/logs')
  @ApiOkResponse({ type: FindManyWebhookLogResponse })
  async findManyLogs(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() args: FindManyArgs
  ) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
        curPage: args.curPage,
        perPage: args.perPage,
      });
    const searchText = args.searchText;

    const orderBy = (args.sort || 'createdAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.WebhookLogScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );

    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        webhookLogs: await prisma.webhookLog.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [
                          { id: { equals: searchText } },
                          { externalTenantId: { equals: searchText } },
                          { webhookId: { equals: searchText } },
                        ]
                      : []),
                    { response: { string_contains: searchText } },
                    { request: { string_contains: searchText } },
                    {
                      responseStatus: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(
              webhookUser,
              webhookUser.userRole === WebhookRole.Admin
                ? undefined
                : externalTenantId
            ),
            webhookId: id,
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.webhookLog.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [
                          { id: { equals: searchText } },
                          { externalTenantId: { equals: searchText } },
                          { webhookId: { equals: searchText } },
                        ]
                      : []),
                    { response: { string_contains: searchText } },
                    { request: { string_contains: searchText } },
                    {
                      responseStatus: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(
              webhookUser,
              webhookUser.userRole === WebhookRole.Admin
                ? undefined
                : externalTenantId
            ),
            webhookId: id,
          },
        }),
      };
    });
    return {
      webhookLogs: result.webhookLogs,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }
}
