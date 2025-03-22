import { searchIn } from '@nestjs-mod-fullstack/common';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { WebhookCacheService } from './services/webhook-cache.service';
import { WebhookRequest } from './types/webhook-request';
import { WebhookStaticConfiguration } from './webhook.configuration';
import { WEBHOOK_FEATURE } from './webhook.constants';
import { CheckWebhookRole } from './webhook.decorators';
import { WebhookStaticEnvironments } from './webhook.environments';
import { WebhookError, WebhookErrorEnum } from './webhook.errors';

@Injectable()
export class WebhookGuard implements CanActivate {
  private logger = new Logger(WebhookGuard.name);

  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly reflector: Reflector,
    private readonly webhookStaticEnvironments: WebhookStaticEnvironments,
    private readonly webhookStaticConfiguration: WebhookStaticConfiguration,
    private readonly webhookCacheService: WebhookCacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const { checkWebhookRole } = this.getHandlersReflectMetadata(context);

      const req = this.getRequestFromExecutionContext(context);
      const externalUserId = this.getExternalUserIdFromRequest(req);
      const externalTenantId = this.getExternalTenantIdFromRequest(req);

      await this.tryGetCurrentSuperAdminUserWithExternalUserId(
        req,
        externalUserId
      );
      await this.tryGetOrCreateCurrentUserWithExternalUserId(
        req,
        externalTenantId,
        externalUserId
      );

      this.throwErrorIfCurrentUserNotSet(req);
      this.throwErrorIfCurrentUserNotHaveNeededRoles(checkWebhookRole, req);
    } catch (err) {
      this.throwAllGuardErrorsIfItNeeded(err);
    }
    return true;
  }

  private throwAllGuardErrorsIfItNeeded(err: unknown) {
    if (!this.webhookStaticEnvironments.skipGuardErrors) {
      throw err;
    } else {
      this.logger.error(err, (err as Error).stack);
    }
  }

  private throwErrorIfCurrentUserNotHaveNeededRoles(
    checkWebhookRole: WebhookRole[] | undefined,
    req: WebhookRequest
  ) {
    if (
      checkWebhookRole &&
      req.webhookUser &&
      !searchIn(req.webhookUser.userRole, checkWebhookRole)
    ) {
      throw new WebhookError(WebhookErrorEnum.FORBIDDEN);
    }
  }

  private throwErrorIfCurrentUserNotSet(req: WebhookRequest) {
    if (!req.webhookUser) {
      throw new WebhookError(WebhookErrorEnum.USER_NOT_FOUND);
    }
  }

  private async tryGetOrCreateCurrentUserWithExternalUserId(
    req: WebhookRequest,
    externalTenantId: string | undefined,
    externalUserId: string
  ) {
    if (!req.webhookUser) {
      if (!externalTenantId || !isUUID(externalTenantId)) {
        throw new WebhookError(WebhookErrorEnum.FORBIDDEN);
      }
      if (this.webhookStaticEnvironments.autoCreateUser) {
        req.webhookUser =
          await this.webhookCacheService.getCachedUserByExternalUserId(
            externalUserId,
            externalTenantId
          );

        if (!req.webhookUser) {
          await this.prismaClient.webhookUser.create({
            data: {
              externalTenantId,
              externalUserId,
              userRole: WebhookRole.User,
            },
          });
        }
      }
      req.webhookUser =
        await this.webhookCacheService.getCachedUserByExternalUserId(
          externalUserId,
          externalTenantId
        );
    }
  }

  private async tryGetCurrentSuperAdminUserWithExternalUserId(
    req: WebhookRequest,
    externalUserId: string
  ) {
    if (
      !req.webhookUser &&
      this.webhookStaticEnvironments.superAdminExternalUserId === externalUserId
    ) {
      req.webhookUser =
        await this.webhookCacheService.getCachedUserByExternalUserId(
          externalUserId
        );
    }
  }

  private getExternalTenantIdFromRequest(req: WebhookRequest) {
    const externalTenantId =
      req.externalTenantId ||
      this.webhookStaticEnvironments.searchTenantIdInHeaders
        ? this.webhookStaticConfiguration.externalTenantIdHeaderName &&
          req.headers?.[
            this.webhookStaticConfiguration.externalTenantIdHeaderName
          ]
        : undefined;
    if (externalTenantId) {
      req.externalTenantId = externalTenantId;
    }
    return req.externalTenantId;
  }

  private getExternalUserIdFromRequest(req: WebhookRequest) {
    const externalUserId =
      req.externalUserId || this.webhookStaticEnvironments.searchUserIdInHeaders
        ? this.webhookStaticConfiguration.externalUserIdHeaderName &&
          req.headers?.[
            this.webhookStaticConfiguration.externalUserIdHeaderName
          ]
        : undefined;
    if (externalUserId) {
      req.externalUserId = externalUserId;
    }

    if (!req.externalUserId || !isUUID(req.externalUserId)) {
      throw new WebhookError(WebhookErrorEnum.FORBIDDEN);
    }
    return req.externalUserId;
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as WebhookRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const checkWebhookRole =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(CheckWebhookRole, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(CheckWebhookRole, context.getClass())) ||
      undefined;
    return { checkWebhookRole };
  }
}
