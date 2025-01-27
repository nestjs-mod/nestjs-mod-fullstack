"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWebhookDto = void 0;
const tslib_1 = require("tslib");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateWebhookDto {
}
exports.UpdateWebhookDto = UpdateWebhookDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateWebhookDto.prototype, "eventName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateWebhookDto.prototype, "endpoint", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'boolean',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateWebhookDto.prototype, "enabled", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => Object,
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], UpdateWebhookDto.prototype, "headers", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'integer',
        format: 'int32',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    tslib_1.__metadata("design:type", Object)
], UpdateWebhookDto.prototype, "requestTimeout", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", Object)
], UpdateWebhookDto.prototype, "workUntilDate", void 0);
//# sourceMappingURL=update-webhook.dto.js.map