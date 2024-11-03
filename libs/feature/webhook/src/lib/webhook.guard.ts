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
import { WebhookRequest } from './types/webhook-request';
import { WebhookStaticConfiguration } from './webhook.configuration';
import { WEBHOOK_FEATURE } from './webhook.constants';
import { CheckWebhookRole, SkipWebhookGuard } from './webhook.decorators';
import { WebhookEnvironments } from './webhook.environments';
import { WebhookError, WebhookErrorEnum } from './webhook.errors';

@Injectable()
export class WebhookGuard implements CanActivate {
  private logger = new Logger(WebhookGuard.name);

  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly reflector: Reflector,
    private readonly webhookEnvironments: WebhookEnvironments,
    private readonly webhookStaticConfiguration: WebhookStaticConfiguration
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
    this.logger.debug({ checkWebhookRole });
    this.logger.debug({ webhookUser: req.webhookUser });
    if (
      checkWebhookRole &&
      req.webhookUser &&
      !checkWebhookRole?.includes(req.webhookUser.userRole)
    ) {
      this.logger.debug({ result: false });
      throw new WebhookError(WebhookErrorEnum.FORBIDDEN);
    }
    this.logger.debug({ result: true });
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
        req.webhookUser = await this.prismaClient.webhookUser.upsert({
          create: { externalTenantId, externalUserId, userRole: 'User' },
          update: {},
          where: {
            externalTenantId_externalUserId: {
              externalTenantId,
              externalUserId,
            },
          },
        });
      } else {
        req.webhookUser = await this.prismaClient.webhookUser.findFirst({
          where: {
            externalTenantId,
            externalUserId,
          },
        });
      }
    }
  }

  private async tryGetCurrentSuperAdminUserWithExternalUserId(
    req: WebhookRequest,
    externalUserId: string
  ) {
    if (this.webhookEnvironments.superAdminExternalUserId) {
      req.webhookUser = await this.prismaClient.webhookUser.findFirst({
        where: {
          AND: [
            { externalUserId },
            {
              externalUserId: this.webhookEnvironments.superAdminExternalUserId,
            },
          ],
          userRole: 'Admin',
        },
      });
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
