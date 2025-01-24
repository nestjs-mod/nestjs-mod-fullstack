'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateWebhookLogDto = void 0;
const tslib_1 = require('tslib');
const webhook_client_1 = require('../../../../../../../../node_modules/@prisma/webhook-client');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class CreateWebhookLogDto {}
exports.CreateWebhookLogDto = CreateWebhookLogDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => Object,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata('design:type', Object),
  ],
  CreateWebhookLogDto.prototype,
  'request',
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
  CreateWebhookLogDto.prototype,
  'responseStatus',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => Object,
      required: false,
      nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata('design:type', Object),
  ],
  CreateWebhookLogDto.prototype,
  'response',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.WebhookStatus,
      enumName: 'WebhookStatus',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateWebhookLogDto.prototype,
  'webhookStatus',
  void 0
);
//# sourceMappingURL=create-webhook-log.dto.js.map
