'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UpdateWebhookUserDto = void 0;
const tslib_1 = require('tslib');
const webhook_client_1 = require('../../../../../../../../node_modules/@prisma/webhook-client');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class UpdateWebhookUserDto {}
exports.UpdateWebhookUserDto = UpdateWebhookUserDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  UpdateWebhookUserDto.prototype,
  'externalTenantId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  UpdateWebhookUserDto.prototype,
  'externalUserId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.WebhookRole,
      enumName: 'WebhookRole',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata('design:type', String),
  ],
  UpdateWebhookUserDto.prototype,
  'userRole',
  void 0
);
//# sourceMappingURL=update-webhook-user.dto.js.map
