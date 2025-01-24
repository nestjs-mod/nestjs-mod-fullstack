'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateWebhookUserDto = void 0;
const tslib_1 = require('tslib');
const webhook_client_1 = require('../../../../../../../../node_modules/@prisma/webhook-client');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class CreateWebhookUserDto {}
exports.CreateWebhookUserDto = CreateWebhookUserDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateWebhookUserDto.prototype,
  'externalTenantId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateWebhookUserDto.prototype,
  'externalUserId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.WebhookRole,
      enumName: 'WebhookRole',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateWebhookUserDto.prototype,
  'userRole',
  void 0
);
//# sourceMappingURL=create-webhook-user.dto.js.map
