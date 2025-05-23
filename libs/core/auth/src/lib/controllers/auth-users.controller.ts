import { FindManyArgs, StatusResponse } from '@nestjs-mod/swagger';
import { AuthRole, Prisma, PrismaClient } from '@prisma/auth-client';

import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { ValidationError } from '@nestjs-mod-fullstack/validation';
import { WebhookService } from '@nestjs-mod-fullstack/webhook';
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
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { AUTH_FEATURE } from '../auth.constants';
import { CheckAuthRole, CurrentAuthUser } from '../auth.decorators';
import { AuthError } from '../auth.errors';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { UpdateAuthUserDto } from '../generated/rest/dto/update-auth-user.dto';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthWebhookEvent } from '../types/auth-webhooks';
import { FindManyAuthUserResponse } from '../types/find-many-auth-user-response';

@ApiBadRequestResponse({
  schema: { allOf: refs(AuthError, ValidationError) },
})
@ApiTags('Auth')
@CheckAuthRole([AuthRole.Admin])
@Controller('/auth/users')
export class AuthUsersController {
  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly authCacheService: AuthCacheService,
    private readonly webhookService: WebhookService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyAuthUserResponse })
  async findMany(
    @CurrentAuthUser() authUser: AuthUser,
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
          ...(key in Prisma.AuthUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );

    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        authUsers: await prisma.authUser.findMany({
          where: {
            ...(isUUID(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.authUser.count({
          where: {
            ...(isUUID(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),
          },
        }),
      };
    });
    return {
      authUsers: result.authUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Put(':id')
  @ApiOkResponse({ type: AuthUser })
  async updateOne(
    @CurrentAuthUser() authUser: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateAuthUserDto
  ) {
    const result = await this.prismaClient.authUser.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(
      authUser.externalUserId
    );
    await this.webhookService.sendEvent({
      eventName: AuthWebhookEvent['auth.user-update'],
      eventBody: result,
      eventHeaders: { externalUserId: authUser.externalUserId },
    });
    return result;
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @CurrentAuthUser() authUser: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    const user = await this.prismaClient.authUser.findFirstOrThrow({
      where: {
        id,
      },
    });
    await this.prismaClient.authUser.delete({
      where: {
        id: user.id,
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(id);
    await this.webhookService.sendEvent({
      eventName: AuthWebhookEvent['auth.user-delete'],
      eventBody: user,
      eventHeaders: { externalUserId: authUser.externalUserId },
    });
    return { message: getText('ok') };
  }

  @Get(':id')
  @ApiOkResponse({ type: AuthUser })
  async findOne(
    @CurrentAuthUser() authUser: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return await this.prismaClient.authUser.findFirstOrThrow({
      where: {
        id,
      },
    });
  }
}
