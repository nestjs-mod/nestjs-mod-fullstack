"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = void 0;
const tslib_1 = require("tslib");
const swagger_1 = require("@nestjs/swagger");
const webhook_user_entity_1 = require("./webhook-user.entity");
const webhook_log_entity_1 = require("./webhook-log.entity");
class Webhook {
}
exports.Webhook = Webhook;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "eventName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "endpoint", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'boolean',
    }),
    tslib_1.__metadata("design:type", Boolean)
], Webhook.prototype, "enabled", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Object,
        nullable: true,
    }),
    tslib_1.__metadata("design:type", Object)
], Webhook.prototype, "headers", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'integer',
        format: 'int32',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", Object)
], Webhook.prototype, "requestTimeout", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "externalTenantId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "createdBy", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "updatedBy", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", Date)
], Webhook.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", Date)
], Webhook.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", Object)
], Webhook.prototype, "workUntilDate", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => webhook_user_entity_1.WebhookUser,
        required: false,
    }),
    tslib_1.__metadata("design:type", webhook_user_entity_1.WebhookUser)
], Webhook.prototype, "WebhookUser_Webhook_createdByToWebhookUser", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => webhook_user_entity_1.WebhookUser,
        required: false,
    }),
    tslib_1.__metadata("design:type", webhook_user_entity_1.WebhookUser)
], Webhook.prototype, "WebhookUser_Webhook_updatedByToWebhookUser", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => webhook_log_entity_1.WebhookLog,
        isArray: true,
        required: false,
    }),
    tslib_1.__metadata("design:type", Array)
], Webhook.prototype, "WebhookLog", void 0);
//# sourceMappingURL=webhook.entity.js.map