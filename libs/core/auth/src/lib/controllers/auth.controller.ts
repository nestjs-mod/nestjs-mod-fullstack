import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError, ValidationErrorEnum } from '@nestjs-mod/validation';
import { WebhookService } from '@nestjs-mod/webhook';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import {
  InjectTranslateFunction,
  TranslateFunction,
  TranslatesStorage,
} from 'nestjs-translates';
import { AUTH_FEATURE } from '../auth.constants';
import { CheckAuthRole, CurrentAuthUser } from '../auth.decorators';
import { AuthError } from '../auth.errors';
import { AuthRole } from '../auth.prisma-sdk';
import { PrismaClient } from '../generated/prisma-client';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthProfileDto } from '../types/auth-profile.dto';
import { AuthWebhookEvent } from '../types/auth-webhooks';

@ApiBadRequestResponse({
  schema: { allOf: refs(AuthError, ValidationError) },
})
@ApiTags('Auth')
@CheckAuthRole([AuthRole.User, AuthRole.Admin])
@Controller('/auth')
export class AuthController {
  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly authCacheService: AuthCacheService,
    private readonly translatesStorage: TranslatesStorage,
    private readonly webhookService: WebhookService,
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: AuthProfileDto })
  async profile(
    @CurrentAuthUser() authUser: AuthUser,
  ): Promise<AuthProfileDto> {
    return {
      lang: authUser.lang,
      timezone: authUser.timezone,
      userRole: authUser.userRole,
    };
  }

  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StatusResponse })
  async updateProfile(
    @CurrentAuthUser() authUser: AuthUser,
    @Body() args: AuthProfileDto,
    @InjectTranslateFunction() getText: TranslateFunction,
  ) {
    if (args.lang && !this.translatesStorage.locales.includes(args.lang)) {
      throw new ValidationError(undefined, ValidationErrorEnum.COMMON, [
        {
          property: 'lang',
          constraints: {
            isWrongEnumValue: getText(
              'lang must have one of the values: {{values}}',
              { values: this.translatesStorage.locales.join(', ') },
            ),
          },
        },
      ]);
    }
    const user = await this.prismaClient.authUser.update({
      where: { id: authUser.id },
      data: {
        ...(args.lang === undefined
          ? {}
          : {
              lang: args.lang,
            }),
        ...(args.timezone === undefined
          ? {}
          : {
              timezone: args.timezone,
            }),
        updatedAt: new Date(),
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(
      authUser.externalUserId,
    );
    await this.webhookService.sendEvent({
      eventName: AuthWebhookEvent['auth.user-update'],
      eventBody: user,
      eventHeaders: { externalUserId: authUser.externalUserId },
    });
    return { message: getText('ok') };
  }
}
