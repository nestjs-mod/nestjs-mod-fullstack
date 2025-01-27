"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookUserDto = void 0;
const tslib_1 = require("tslib");
const webhook_client_1 = require("../../../../../../../../node_modules/@prisma/webhook-client");
const swagger_1 = require("@nestjs/swagger");
class WebhookUserDto {
}
exports.WebhookUserDto = WebhookUserDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookUserDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookUserDto.prototype, "externalTenantId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookUserDto.prototype, "externalUserId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        enum: webhook_client_1.WebhookRole,
        enumName: 'WebhookRole',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookUserDto.prototype, "userRole", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", Date)
], WebhookUserDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", Date)
], WebhookUserDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=webhook-user.dto.js.map