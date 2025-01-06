import { AllowEmptyUser } from '@nestjs-mod/authorizer';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
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
import { AUTH_FEATURE } from './auth.constants';
import { CheckAuthRole, SkipAuthGuard } from './auth.decorators';
import { AuthEnvironments } from './auth.environments';
import { AuthError, AuthErrorEnum } from './auth.errors';
import { AuthCacheService } from './services/auth-cache.service';
import { AuthRequest } from './types/auth-request';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly reflector: Reflector,
    private readonly authCacheService: AuthCacheService,
    private readonly authEnvironments: AuthEnvironments,
    private readonly translatesStorage: TranslatesStorage
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.authEnvironments.useGuards) {
      return true;
    }

    try {
      const { skipAuthGuard, checkAuthRole, allowEmptyUserMetadata } =
        this.getHandlersReflectMetadata(context);

      if (skipAuthGuard) {
        return true;
      }

      const req: AuthRequest = this.getRequestFromExecutionContext(context);

      if (req.authorizerUser?.id) {
        await this.tryGetOrCreateCurrentUserWithExternalUserId(
          req,
          req.authorizerUser.id
        );
      }

      this.throwErrorIfCurrentUserNotSet(req, allowEmptyUserMetadata);

      this.pathAuthorizerUserRoles(req);

      this.throwErrorIfCurrentUserNotHaveNeededRoles(checkAuthRole, req);
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
      throw err;
    }
    return true;
  }

  private pathAuthorizerUserRoles(req: AuthRequest) {
    if (
      this.authEnvironments.adminEmail &&
      req.authorizerUser?.email === this.authEnvironments.adminEmail
    ) {
      if (req.authUser) {
        req.authUser.userRole = 'Admin';
      }
      req.authorizerUser.roles = [
        ...new Set([...(req.authorizerUser.roles || []), 'admin']),
      ];
    }
  }

  private throwErrorIfCurrentUserNotHaveNeededRoles(
    checkAuthRole: AuthRole[] | undefined,
    req: AuthRequest
  ) {
    if (
      checkAuthRole &&
      req.authUser &&
      !checkAuthRole?.includes(req.authUser.userRole)
    ) {
      throw new AuthError(AuthErrorEnum.FORBIDDEN);
    }
  }

  private throwErrorIfCurrentUserNotSet(
    req: AuthRequest,
    allowEmptyUserMetadata?: boolean
  ) {
    if (!req.skippedByAuthorizer && !req.authUser && !allowEmptyUserMetadata) {
      throw new AuthError(AuthErrorEnum.USER_NOT_FOUND);
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
      req.authUser =
        authUser ||
        (await this.prismaClient.authUser.upsert({
          create: { externalUserId, userRole: 'User' },
          update: {},
          where: { externalUserId },
        }));

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
        this.reflector.get(AllowEmptyUser, context.getHandler())) ||
        (typeof context.getClass === 'function' &&
          this.reflector.get(AllowEmptyUser, context.getClass())) ||
        undefined
    );

    const skipAuthGuard =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(SkipAuthGuard, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(SkipAuthGuard, context.getClass())) ||
      undefined;

    const checkAuthRole =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(CheckAuthRole, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(CheckAuthRole, context.getClass())) ||
      undefined;
    return { allowEmptyUserMetadata, skipAuthGuard, checkAuthRole };
  }
}
