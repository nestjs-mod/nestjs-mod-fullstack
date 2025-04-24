import { WebhookService } from '@nestjs-mod-fullstack/webhook';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { searchIn } from '@nestjs-mod/misc';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRole, PrismaClient } from '@prisma/auth-client';
import { ACCEPT_LANGUAGE, TranslatesStorage } from 'nestjs-translates';
import { AuthConfiguration } from './auth.configuration';
import { AUTH_FEATURE } from './auth.constants';
import {
  AllowEmptyAuthUser,
  CheckAuthRole,
  SkipAuthGuard,
} from './auth.decorators';
import { AuthStaticEnvironments } from './auth.environments';
import { AuthError, AuthErrorEnum } from './auth.errors';
import { AuthCacheService } from './services/auth-cache.service';
import { AuthRequest } from './types/auth-request';
import { AuthWebhookEvent } from './types/auth-webhooks';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly reflector: Reflector,
    private readonly authCacheService: AuthCacheService,
    private readonly authStaticEnvironments: AuthStaticEnvironments,
    private readonly authConfiguration: AuthConfiguration,
    private readonly translatesStorage: TranslatesStorage,
    private readonly webhookService: WebhookService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequestFromExecutionContext(context);

    const func = async () => {
      if (!this.authStaticEnvironments.useGuards) {
        return true;
      }

      try {
        const { skipAuthGuard, checkAuthRole, allowEmptyUserMetadata } =
          this.getHandlersReflectMetadata(context);

        if (skipAuthGuard) {
          return true;
        }

        // check access by custom logic
        if (this.authConfiguration.checkAccessValidator) {
          await this.authConfiguration.checkAccessValidator(
            req.authUser,
            context
          );
        }

        if (allowEmptyUserMetadata) {
          req.skipEmptyAuthUser = true;
        }

        if (req.externalUserId) {
          await this.tryGetOrCreateCurrentUserWithExternalUserId(
            req,
            req.externalUserId
          );
        }

        this.throwErrorIfCurrentUserNotSet(req);

        this.pathAdminRoles(req);

        this.throwErrorIfCurrentUserNotHaveNeededRoles(checkAuthRole, req);
      } catch (err) {
        this.logger.error(err, (err as Error).stack);
        throw err;
      }
      return true;
    };

    try {
      const result = await func();

      this.logger.debug(
        `${context.getClass().name}.${
          context.getHandler().name
        }: ${result}, authUser: ${JSON.stringify(
          req.authUser?.id
        )}, externalUser: ${JSON.stringify(
          req.externalUser
        )}, externalUserId: ${JSON.stringify(
          req.externalUserId
        )}, skipEmptyAuthUser: ${JSON.stringify(req.skipEmptyAuthUser)}`
      );

      return result;
    } catch (err) {
      this.logger.debug(
        `${context.getClass().name}.${context.getHandler().name}: ${String(
          err
        )}, authUser: ${JSON.stringify(
          req.authUser?.id
        )}, externalUser: ${JSON.stringify(
          req.externalUser
        )}, externalUserId: ${JSON.stringify(
          req.externalUserId
        )}, skipEmptyAuthUser: ${JSON.stringify(req.skipEmptyAuthUser)}`
      );
      throw err;
    }
  }

  private pathAdminRoles(req: AuthRequest) {
    if (
      this.authStaticEnvironments.adminEmail &&
      req.externalUser?.email === this.authStaticEnvironments.adminEmail
    ) {
      req.externalUser.roles = [AuthRole.Admin];
    }
  }

  private throwErrorIfCurrentUserNotHaveNeededRoles(
    checkAuthRole: AuthRole[] | undefined,
    req: AuthRequest
  ) {
    if (
      !req.skipEmptyAuthUser &&
      checkAuthRole &&
      req.authUser &&
      !searchIn(req.authUser.userRole, checkAuthRole)
    ) {
      throw new AuthError(AuthErrorEnum.FORBIDDEN);
    }
  }

  private throwErrorIfCurrentUserNotSet(req: AuthRequest) {
    if (!req.authUser && !req.skipEmptyAuthUser) {
      throw new AuthError(AuthErrorEnum.UNAUTHORIZED);
    }
  }

  private async tryGetOrCreateCurrentUserWithExternalUserId(
    req: AuthRequest,
    externalUserId: string
  ) {
    if (!req.authUser && externalUserId) {
      const authUser =
        await this.authCacheService.getCachedUserByExternalUserId(
          externalUserId
        );
      req.authUser = authUser;

      if (!req.authUser) {
        req.authUser = await this.prismaClient.authUser.create({
          data: {
            externalUserId,
            userRole: searchIn(AuthRole.Admin, req.externalUser?.roles)
              ? AuthRole.Admin
              : AuthRole.User,
          },
        });
        await this.webhookService.sendEvent({
          eventName: AuthWebhookEvent['auth.user-create'],
          eventBody: req.authUser,
          eventHeaders: { externalUserId },
        });
      }

      if (req.authUser.lang) {
        req.headers[ACCEPT_LANGUAGE] = req.authUser.lang;
      }
    }

    if (
      req.headers[ACCEPT_LANGUAGE] &&
      !this.translatesStorage.locales.includes(req.headers[ACCEPT_LANGUAGE])
    ) {
      req.headers[ACCEPT_LANGUAGE] = this.translatesStorage.defaultLocale;
    }
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as AuthRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const allowEmptyUserMetadata = Boolean(
      (typeof context.getHandler === 'function' &&
        this.reflector.get(AllowEmptyAuthUser, context.getHandler())) ||
        (typeof context.getClass === 'function' &&
          this.reflector.get(AllowEmptyAuthUser, context.getClass())) ||
        undefined
    );

    const skipAuthGuard = Boolean(
      (typeof context.getHandler === 'function' &&
        this.reflector.get(SkipAuthGuard, context.getHandler())) ||
        (typeof context.getClass === 'function' &&
          this.reflector.get(SkipAuthGuard, context.getClass())) ||
        undefined
    );

    const checkAuthRole =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(CheckAuthRole, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(CheckAuthRole, context.getClass())) ||
      undefined;

    return { allowEmptyUserMetadata, skipAuthGuard, checkAuthRole };
  }
}
