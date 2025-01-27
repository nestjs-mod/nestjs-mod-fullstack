"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentWebhookExternalTenantId = exports.CurrentWebhookUser = exports.CurrentWebhookRequest = exports.CheckWebhookRole = exports.SkipWebhookGuard = void 0;
const common_1 = require("@nestjs-mod/common");
const common_2 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const webhook_client_1 = require("@prisma/webhook-client");
const webhook_errors_1 = require("./webhook.errors");
exports.SkipWebhookGuard = core_1.Reflector.createDecorator();
exports.CheckWebhookRole = core_1.Reflector.createDecorator();
exports.CurrentWebhookRequest = (0, common_2.createParamDecorator)((_data, ctx) => {
    const req = (0, common_1.getRequestFromExecutionContext)(ctx);
    return req;
});
exports.CurrentWebhookUser = (0, common_2.createParamDecorator)((_data, ctx) => {
    const req = (0, common_1.getRequestFromExecutionContext)(ctx);
    return req.webhookUser;
});
exports.CurrentWebhookExternalTenantId = (0, common_2.createParamDecorator)((_data, ctx) => {
    const req = (0, common_1.getRequestFromExecutionContext)(ctx);
    if (!req.externalTenantId &&
        req.webhookUser?.userRole !== webhook_client_1.WebhookRole.Admin) {
        throw new webhook_errors_1.WebhookError(webhook_errors_1.WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET);
    }
    return req.externalTenantId;
});
//# sourceMappingURL=webhook.decorators.js.map