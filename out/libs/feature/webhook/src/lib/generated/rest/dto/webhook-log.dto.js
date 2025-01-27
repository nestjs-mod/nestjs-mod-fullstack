"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookLogDto = void 0;
const tslib_1 = require("tslib");
const webhook_client_1 = require("../../../../../../../../node_modules/@prisma/webhook-client");
const swagger_1 = require("@nestjs/swagger");
class WebhookLogDto {
}
exports.WebhookLogDto = WebhookLogDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookLogDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Object,
    }),
    tslib_1.__metadata("design:type", Object)
], WebhookLogDto.prototype, "request", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookLogDto.prototype, "responseStatus", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Object,
        nullable: true,
    }),
    tslib_1.__metadata("design:type", Object)
], WebhookLogDto.prototype, "response", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        enum: webhook_client_1.WebhookStatus,
        enumName: 'WebhookStatus',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookLogDto.prototype, "webhookStatus", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookLogDto.prototype, "externalTenantId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", Date)
], WebhookLogDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", Date)
], WebhookLogDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=webhook-log.dto.js.map