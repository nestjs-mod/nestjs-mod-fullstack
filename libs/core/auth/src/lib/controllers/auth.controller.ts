import { StatusResponse } from '@nestjs-mod-fullstack/common';
import { ValidationError } from '@nestjs-mod-fullstack/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { AuthRole, PrismaClient } from '@prisma/auth-client';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { AUTH_FEATURE } from '../auth.constants';
import { CheckAuthRole, CurrentAuthUser } from '../auth.decorators';
import { AuthError } from '../auth.errors';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { AuthEntities } from '../types/auth-entities';
import { AuthProfileDto } from '../types/auth-profile.dto';

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
    private readonly prismaClient: PrismaClient
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: AuthProfileDto })
  async profile(
    @CurrentAuthUser() authUser: AuthUser
  ): Promise<AuthProfileDto> {
    return { timezone: authUser.timezone };
  }

  @Post('update-profile')
  @ApiOkResponse({ type: StatusResponse })
  async updateProfile(
    @CurrentAuthUser() authUser: AuthUser,
    @Body() args: AuthProfileDto,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    await this.prismaClient.authUser.update({
      where: { id: authUser.id, updatedAt: new Date() },
      data: {
        timezone: args.timezone,
        updatedAt: new Date(),
      },
    });
    return { message: getText('ok') };
  }
}
