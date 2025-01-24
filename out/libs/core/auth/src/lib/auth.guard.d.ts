import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/auth-client';
import { TranslatesStorage } from 'nestjs-translates';
import { AuthEnvironments } from './auth.environments';
import { AuthCacheService } from './services/auth-cache.service';
export declare class AuthGuard implements CanActivate {
  private readonly prismaClient;
  private readonly reflector;
  private readonly authCacheService;
  private readonly authEnvironments;
  private readonly translatesStorage;
  private logger;
  constructor(
    prismaClient: PrismaClient,
    reflector: Reflector,
    authCacheService: AuthCacheService,
    authEnvironments: AuthEnvironments,
    translatesStorage: TranslatesStorage
  );
  canActivate(context: ExecutionContext): Promise<boolean>;
  private pathSupabaseUserRoles;
  private throwErrorIfCurrentUserNotHaveNeededRoles;
  private throwErrorIfCurrentUserNotSet;
  private tryGetOrCreateCurrentUserWithExternalUserId;
  private getRequestFromExecutionContext;
  private getHandlersReflectMetadata;
}
