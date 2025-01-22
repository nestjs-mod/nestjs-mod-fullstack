import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/webhook-client';
import { WebhookCacheService } from './services/webhook-cache.service';
import { WebhookStaticConfiguration } from './webhook.configuration';
import { WebhookEnvironments } from './webhook.environments';
export declare class WebhookGuard implements CanActivate {
    private readonly prismaClient;
    private readonly reflector;
    private readonly webhookEnvironments;
    private readonly webhookStaticConfiguration;
    private readonly webhookCacheService;
    private logger;
    constructor(prismaClient: PrismaClient, reflector: Reflector, webhookEnvironments: WebhookEnvironments, webhookStaticConfiguration: WebhookStaticConfiguration, webhookCacheService: WebhookCacheService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private throwAllGuardErrorsIfItNeeded;
    private throwErrorIfCurrentUserNotHaveNeededRoles;
    private throwErrorIfCurrentUserNotSet;
    private tryGetOrCreateCurrentUserWithExternalUserId;
    private tryGetCurrentSuperAdminUserWithExternalUserId;
    private getExternalTenantIdFromRequest;
    private getExternalUserIdFromRequest;
    private getRequestFromExecutionContext;
    private getHandlersReflectMetadata;
}
