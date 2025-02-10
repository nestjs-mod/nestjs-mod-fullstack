import { FindManyArgs, StatusResponse } from '@nestjs-mod-fullstack/common';
import { Prisma, PrismaClient, WebhookRole } from '@prisma/webhook-client';

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
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { UpdateWebhookUserDto } from '../generated/rest/dto/update-webhook-user.dto';
import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
import { WebhookCacheService } from '../services/webhook-cache.service';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { FindManyWebhookUserResponse } from '../types/find-many-webhook-user-response';
import { WebhookRequest } from '../types/webhook-request';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import {
  CheckWebhookRole,
  CurrentWebhookExternalTenantId,
  CurrentWebhookRequest,
  CurrentWebhookUser,
} from '../webhook.decorators';
import { WebhookError } from '../webhook.errors';

@ApiExtraModels(WebhookError, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(WebhookError, ValidationError) },
})
@ApiTags('Webhook')
@CheckWebhookRole([WebhookRole.Admin])
@Controller('/webhook/users')
export class WebhookUsersController {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly webhookToolsService: WebhookToolsService,
    private readonly webhookCacheService: WebhookCacheService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyWebhookUserResponse })
  async findMany(
    @CurrentWebhookRequest() req: WebhookRequest,
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
          ...(key in Prisma.WebhookUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );

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
              webhookUser.userRole === 'Admin' ? undefined : externalTenantId
            ),
          },
          take,
          skip,
          orderBy,
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
              webhookUser.userRole === 'Admin' ? undefined : externalTenantId
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
  @ApiOkResponse({ type: WebhookUser })
  async updateOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateWebhookUserDto
  ) {
    const result = await this.prismaClient.webhookUser.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === 'Admin' ? undefined : externalTenantId
        ),
      },
    });
    await this.webhookCacheService.clearCacheByExternalUserId(
      webhookUser.externalUserId
    );
    return result;
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    await this.prismaClient.webhookUser.delete({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === 'Admin' ? undefined : externalTenantId
        ),
      },
    });
    await this.webhookCacheService.clearCacheByExternalUserId(id);
    return { message: getText('ok') };
  }

  @Get(':id')
  @ApiOkResponse({ type: WebhookUser })
  async findOne(
    @CurrentWebhookExternalTenantId() externalTenantId: string,
    @CurrentWebhookUser() webhookUser: WebhookUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return await this.prismaClient.webhookUser.findFirstOrThrow({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === 'Admin' ? undefined : externalTenantId
        ),
      },
    });
  }
}
