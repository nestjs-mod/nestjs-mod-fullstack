import { StatusResponse } from '@nestjs-mod-fullstack/common';
import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-fullstack/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
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
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { AuthRole, PrismaClient } from '@prisma/auth-client';
import {
  InjectTranslateFunction,
  TranslateFunction,
  TranslatesStorage,
} from 'nestjs-translates';
import { AUTH_FEATURE } from '../auth.constants';
import { CheckAuthRole, CurrentAuthUser } from '../auth.decorators';
import { AuthError } from '../auth.errors';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthEntities } from '../types/auth-entities';
import { AuthProfileDto } from '../types/auth-profile.dto';
import { WebhookService } from '@nestjs-mod-fullstack/webhook';
import { AuthWebhookEvent } from '../types/auth-webhooks';

@ApiExtraModels(AuthError, AuthEntities, ValidationError)
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
    private readonly webhookService: WebhookService
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: AuthProfileDto })
  async profile(
    @CurrentAuthUser() authUser: AuthUser
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
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    if (args.lang && !this.translatesStorage.locales.includes(args.lang)) {
      throw new ValidationError(undefined, ValidationErrorEnum.COMMON, [
        {
          property: 'lang',
          constraints: {
            isWrongEnumValue: getText(
              'lang must have one of the values: {{values}}',
              { values: this.translatesStorage.locales.join(', ') }
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
      authUser.externalUserId
    );
    await this.webhookService.sendEvent({
      eventName: AuthWebhookEvent['auth.user-update'],
      eventBody: user,
      eventHeaders: { externalUserId: authUser.externalUserId },
    });
    return { message: getText('ok') };
  }
}
