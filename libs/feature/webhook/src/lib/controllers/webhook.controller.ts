import { FindManyArgs, StatusResponse } from '@nestjs-mod-fullstack/common';

import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
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
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { WebhookUser } from '../generated/rest/dto/webhook_user';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { WebhookEvent } from '../types/webhook-event-object';
import { FindManyWebhookLogResponse } from '../types/webhook-log-object';
import {
  CreateWebhookArgs,
  FindManyWebhookResponse,
  UpdateWebhookArgs,
  WebhookObject,
} from '../types/webhook-object';
import { WebhookRequest } from '../types/webhook-request';
import { WebhookUserObject } from '../types/webhook-user-object';
import { WebhookConfiguration } from '../webhook.configuration';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import {
  CheckWebhookRole,
  CurrentWebhookRequest,
  CurrentWebhookUser,
} from '../webhook.decorators';
import { WebhookError } from '../webhook.errors';

@ApiExtraModels(WebhookError)
@ApiBadRequestResponse({
  schema: { allOf: refs(WebhookError) },
})
@ApiTags('webhook')
@CheckWebhookRole([WebhookRole.User, WebhookRole.Admin])
@Controller('/webhook')
export class WebhookController {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly webhookToolsService: WebhookToolsService
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: WebhookUserObject })
  async profile(@CurrentWebhookUser() webhookUser: WebhookUser) {
    return webhookUser;
  }

  @Get('events')
  @ApiOkResponse({ type: WebhookEvent, isArray: true })
  async events() {
    return this.webhookConfiguration.events;
  }

  @Get()
  @ApiOkResponse({ type: FindManyWebhookResponse })
  async findMany(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Query() args: FindManyArgs
  ) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
        curPage: args.curPage,
        perPage: args.perPage,
      });
    const searchText = args.searchText;

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
              webhookRequest.externalTenantId
            ),
          },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
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
              webhookRequest.externalTenantId
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
  @ApiCreatedResponse({ type: WebhookObject })
  async createOne(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Body() args: CreateWebhookArgs
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
          webhookRequest.externalTenantId
        ),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: WebhookObject })
  async updateOne(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateWebhookArgs
  ) {
    return await this.prismaClient.webhook.update({
      data: { ...args },
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookRequest.externalTenantId
        ),
      },
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    await this.prismaClient.webhook.delete({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookRequest.externalTenantId
        ),
      },
    });
    return { message: 'ok' };
  }

  @Get(':id')
  @ApiOkResponse({ type: WebhookObject })
  async findOne(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return await this.prismaClient.webhook.findFirstOrThrow({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookRequest.externalTenantId
        ),
      },
    });
  }

  @Get(':id/logs')
  @ApiOkResponse({ type: FindManyWebhookLogResponse, isArray: true })
  async findManyLogs(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
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
              webhookRequest.externalTenantId
            ),
            webhookId: id,
          },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
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
              webhookRequest.externalTenantId
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
