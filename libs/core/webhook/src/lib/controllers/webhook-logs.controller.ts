import { StatusResponse } from '@nestjs-mod-fullstack/common';

import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { ValidationError } from '@nestjs-mod-fullstack/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { Prisma, PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { CurrentLocale, TranslatesService } from 'nestjs-translates';
import { WebhookLog } from '../generated/rest/dto/webhook-log.entity';
import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { FindManyWebhookLogArgs } from '../types/find-many-webhook-log-args';
import { FindManyWebhookLogResponse } from '../types/find-many-webhook-log-response';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import {
  CheckWebhookRole,
  CurrentWebhookExternalTenantId,
  CurrentWebhookUser,
} from '../webhook.decorators';
import { WebhookError } from '../webhook.errors';

@ApiBadRequestResponse({
  schema: { allOf: refs(WebhookError, ValidationError) },
})
@ApiTags('Webhook')
@CheckWebhookRole([WebhookRole.User, WebhookRole.Admin])
@Controller('/webhook/logs')
export class WebhookLogsController {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly webhookToolsService: WebhookToolsService,
    private readonly translatesService: TranslatesService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyWebhookLogResponse })
  async findManyLogs(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Query() args: FindManyWebhookLogArgs
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
            webhookId: args.webhookId,
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
            webhookId: args.webhookId,
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

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    // todo: change to InjectTranslateFunction, after write all posts
    @CurrentLocale() locale: string
  ) {
    await this.prismaClient.webhookLog.delete({
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
  @ApiOkResponse({ type: WebhookLog })
  async findOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return await this.prismaClient.webhookLog.findFirstOrThrow({
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
}
