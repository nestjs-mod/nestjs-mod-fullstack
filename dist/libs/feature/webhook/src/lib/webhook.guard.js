"use strict";
var WebhookGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookGuard = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
const prisma_1 = require("@nestjs-mod/prisma");
const common_2 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const webhook_client_1 = require("@prisma/webhook-client");
const class_validator_1 = require("class-validator");
const webhook_cache_service_1 = require("./services/webhook-cache.service");
const webhook_configuration_1 = require("./webhook.configuration");
const webhook_constants_1 = require("./webhook.constants");
const webhook_decorators_1 = require("./webhook.decorators");
const webhook_environments_1 = require("./webhook.environments");
const webhook_errors_1 = require("./webhook.errors");
let WebhookGuard = WebhookGuard_1 = class WebhookGuard {
    constructor(prismaClient, reflector, webhookEnvironments, webhookStaticConfiguration, webhookCacheService) {
        this.prismaClient = prismaClient;
        this.reflector = reflector;
        this.webhookEnvironments = webhookEnvironments;
        this.webhookStaticConfiguration = webhookStaticConfiguration;
        this.webhookCacheService = webhookCacheService;
        this.logger = new common_2.Logger(WebhookGuard_1.name);
    }
    async canActivate(context) {
        try {
            const { skipWebhookGuard, checkWebhookRole } = this.getHandlersReflectMetadata(context);
            if (skipWebhookGuard) {
                return true;
            }
            const req = this.getRequestFromExecutionContext(context);
            const externalUserId = this.getExternalUserIdFromRequest(req);
            const externalTenantId = this.getExternalTenantIdFromRequest(req);
            await this.tryGetCurrentSuperAdminUserWithExternalUserId(req, externalUserId);
            await this.tryGetOrCreateCurrentUserWithExternalUserId(req, externalTenantId, externalUserId);
            this.throwErrorIfCurrentUserNotSet(req);
            this.throwErrorIfCurrentUserNotHaveNeededRoles(checkWebhookRole, req);
        }
        catch (err) {
            this.throwAllGuardErrorsIfItNeeded(err);
        }
        return true;
    }
    throwAllGuardErrorsIfItNeeded(err) {
        if (!this.webhookEnvironments.skipGuardErrors) {
            throw err;
        }
        else {
            this.logger.error(err, err.stack);
        }
    }
    throwErrorIfCurrentUserNotHaveNeededRoles(checkWebhookRole, req) {
        if (checkWebhookRole &&
            req.webhookUser &&
            !checkWebhookRole?.includes(req.webhookUser.userRole)) {
            throw new webhook_errors_1.WebhookError(webhook_errors_1.WebhookErrorEnum.FORBIDDEN);
        }
    }
    throwErrorIfCurrentUserNotSet(req) {
        if (!req.webhookUser) {
            throw new webhook_errors_1.WebhookError(webhook_errors_1.WebhookErrorEnum.USER_NOT_FOUND);
        }
    }
    async tryGetOrCreateCurrentUserWithExternalUserId(req, externalTenantId, externalUserId) {
        if (!req.webhookUser) {
            if (!externalTenantId || !(0, class_validator_1.isUUID)(externalTenantId)) {
                throw new webhook_errors_1.WebhookError(webhook_errors_1.WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET);
            }
            if (this.webhookEnvironments.autoCreateUser) {
                req.webhookUser =
                    await this.webhookCacheService.getCachedUserByExternalUserId(externalUserId, externalTenantId);
                if (!req.webhookUser) {
                    await this.prismaClient.webhookUser.create({
                        data: { externalTenantId, externalUserId, userRole: 'User' },
                    });
                }
            }
            req.webhookUser =
                await this.webhookCacheService.getCachedUserByExternalUserId(externalUserId, externalTenantId);
        }
    }
    async tryGetCurrentSuperAdminUserWithExternalUserId(req, externalUserId) {
        if (!req.webhookUser &&
            this.webhookEnvironments.superAdminExternalUserId === externalUserId) {
            req.webhookUser =
                await this.webhookCacheService.getCachedUserByExternalUserId(externalUserId);
        }
    }
    getExternalTenantIdFromRequest(req) {
        const externalTenantId = req.externalTenantId || this.webhookEnvironments.checkHeaders
            ? this.webhookStaticConfiguration.externalTenantIdHeaderName &&
                req.headers?.[this.webhookStaticConfiguration.externalTenantIdHeaderName]
            : undefined;
        if (externalTenantId) {
            req.externalTenantId = externalTenantId;
        }
        return req.externalTenantId;
    }
    getExternalUserIdFromRequest(req) {
        const externalUserId = req.externalUserId || this.webhookEnvironments.checkHeaders
            ? this.webhookStaticConfiguration.externalUserIdHeaderName &&
                req.headers?.[this.webhookStaticConfiguration.externalUserIdHeaderName]
            : undefined;
        if (externalUserId) {
            req.externalUserId = externalUserId;
        }
        if (!req.externalUserId || !(0, class_validator_1.isUUID)(req.externalUserId)) {
            throw new webhook_errors_1.WebhookError(webhook_errors_1.WebhookErrorEnum.EXTERNAL_USER_ID_NOT_SET);
        }
        return req.externalUserId;
    }
    getRequestFromExecutionContext(context) {
        const req = (0, common_1.getRequestFromExecutionContext)(context);
        req.headers = req.headers || {};
        return req;
    }
    getHandlersReflectMetadata(context) {
        const skipWebhookGuard = (typeof context.getHandler === 'function' &&
            this.reflector.get(webhook_decorators_1.SkipWebhookGuard, context.getHandler())) ||
            (typeof context.getClass === 'function' &&
                this.reflector.get(webhook_decorators_1.SkipWebhookGuard, context.getClass())) ||
            undefined;
        const checkWebhookRole = (typeof context.getHandler === 'function' &&
            this.reflector.get(webhook_decorators_1.CheckWebhookRole, context.getHandler())) ||
            (typeof context.getClass === 'function' &&
                this.reflector.get(webhook_decorators_1.CheckWebhookRole, context.getClass())) ||
            undefined;
        return { skipWebhookGuard, checkWebhookRole };
    }
};
exports.WebhookGuard = WebhookGuard;
exports.WebhookGuard = WebhookGuard = WebhookGuard_1 = tslib_1.__decorate([
    (0, common_2.Injectable)(),
    tslib_1.__param(0, (0, prisma_1.InjectPrismaClient)(webhook_constants_1.WEBHOOK_FEATURE)),
    tslib_1.__metadata("design:paramtypes", [webhook_client_1.PrismaClient,
        core_1.Reflector,
        webhook_environments_1.WebhookEnvironments,
        webhook_configuration_1.WebhookStaticConfiguration,
        webhook_cache_service_1.WebhookCacheService])
], WebhookGuard);
//# sourceMappingURL=webhook.guard.js.map