import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { WebhookUsersService } from './services/webhook-users.service';
import { WebhookRequest } from './types/webhook-request';
import { WebhookStaticConfiguration } from './webhook.configuration';
import { CheckWebhookRole, SkipWebhookGuard } from './webhook.decorators';
import { WebhookEnvironments } from './webhook.environments';
import { WebhookError, WebhookErrorEnum } from './webhook.errors';

@Injectable()
export class WebhookGuard implements CanActivate {
  private logger = new Logger(WebhookGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly webhookEnvironments: WebhookEnvironments,
    private readonly webhookStaticConfiguration: WebhookStaticConfiguration,
    private readonly webhookUsersService: WebhookUsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const { skipWebhookGuard, checkWebhookRole } =
        this.getHandlersReflectMetadata(context);

      if (skipWebhookGuard) {
        return true;
      }

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
    if (!this.webhookEnvironments.skipGuardErrors) {
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
      !checkWebhookRole?.includes(req.webhookUser.userRole)
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
        throw new WebhookError(WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET);
      }
      if (this.webhookEnvironments.autoCreateUser) {
        req.webhookUser = await this.webhookUsersService.createUserIfNotExists({
          externalTenantId,
          externalUserId,
          userRole: 'User',
        });
      } else {
        req.webhookUser =
          await this.webhookUsersService.getUserByExternalUserId(
            externalUserId,
            externalTenantId
          );
      }
    }
  }

  private async tryGetCurrentSuperAdminUserWithExternalUserId(
    req: WebhookRequest,
    externalUserId: string
  ) {
    if (this.webhookEnvironments.superAdminExternalUserId) {
      const webhookUser =
        await this.webhookUsersService.getUserByExternalUserId(externalUserId);
      if (
        webhookUser?.externalUserId ===
          this.webhookEnvironments.superAdminExternalUserId &&
        webhookUser.userRole === 'Admin'
      ) {
        req.webhookUser = webhookUser;
      }
    }
  }

  private getExternalTenantIdFromRequest(req: WebhookRequest) {
    const externalTenantId =
      req.externalTenantId || this.webhookEnvironments.checkHeaders
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
      req.externalUserId || this.webhookEnvironments.checkHeaders
        ? this.webhookStaticConfiguration.externalUserIdHeaderName &&
          req.headers?.[
            this.webhookStaticConfiguration.externalUserIdHeaderName
          ]
        : undefined;
    if (externalUserId) {
      req.externalUserId = externalUserId;
    }

    if (!req.externalUserId || !isUUID(req.externalUserId)) {
      throw new WebhookError(WebhookErrorEnum.EXTERNAL_USER_ID_NOT_SET);
    }
    return req.externalUserId;
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as WebhookRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const skipWebhookGuard =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(SkipWebhookGuard, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(SkipWebhookGuard, context.getClass())) ||
      undefined;

    const checkWebhookRole =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(CheckWebhookRole, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(CheckWebhookRole, context.getClass())) ||
      undefined;
    return { skipWebhookGuard, checkWebhookRole };
  }
}
