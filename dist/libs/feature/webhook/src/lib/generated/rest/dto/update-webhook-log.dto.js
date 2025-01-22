"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWebhookLogDto = void 0;
const tslib_1 = require("tslib");
const webhook_client_1 = require("../../../../../../../../node_modules/@prisma/webhook-client");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateWebhookLogDto {
}
exports.UpdateWebhookLogDto = UpdateWebhookLogDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Object,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], UpdateWebhookLogDto.prototype, "request", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateWebhookLogDto.prototype, "responseStatus", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Object,
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], UpdateWebhookLogDto.prototype, "response", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        enum: webhook_client_1.WebhookStatus,
        enumName: 'WebhookStatus',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateWebhookLogDto.prototype, "webhookStatus", void 0);
//# sourceMappingURL=update-webhook-log.dto.js.map