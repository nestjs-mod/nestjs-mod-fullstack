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
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { WebhookUser } from '../generated/rest/dto/webhook_user';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { WebhookRequest } from '../types/webhook-request';
import {
  FindManyWebhookUserResponse,
  UpdateWebhookUserArgs,
  WebhookUserObject,
} from '../types/webhook-user-object';
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
@CheckWebhookRole([WebhookRole.Admin])
@Controller('/webhook/users')
export class WebhookUsersController {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly webhookToolsService: WebhookToolsService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyWebhookUserResponse })
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
        webhookUsers: await prisma.webhookUser.findMany({
          where: {
            ...(isUUID(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalTenantId: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
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
        totalResults: await prisma.webhookUser.count({
          where: {
            ...(isUUID(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalTenantId: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
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
      webhookUsers: result.webhookUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Put(':id')
  @ApiOkResponse({ type: WebhookUserObject })
  async updateOne(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateWebhookUserArgs
  ) {
    return await this.prismaClient.webhookUser.update({
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
    await this.prismaClient.webhookUser.delete({
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
  @ApiOkResponse({ type: WebhookUserObject })
  async findOne(
    @CurrentWebhookRequest() webhookRequest: WebhookRequest,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return await this.prismaClient.webhookUser.findFirstOrThrow({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookRequest.externalTenantId
        ),
      },
    });
  }
}
