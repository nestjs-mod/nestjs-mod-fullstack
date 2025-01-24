'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookEntities = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const webhook_client_1 = require('@prisma/webhook-client');
class WebhookEntities {}
exports.WebhookEntities = WebhookEntities;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.Prisma.WebhookScalarFieldEnum,
      enumName: 'WebhookScalarFieldEnum',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookEntities.prototype,
  'webhook',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.Prisma.WebhookLogScalarFieldEnum,
      enumName: 'WebhookLogScalarFieldEnum',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookEntities.prototype,
  'webhookLog',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.Prisma.WebhookUserScalarFieldEnum,
      enumName: 'WebhookUserScalarFieldEnum',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookEntities.prototype,
  'webhookUser',
  void 0
);
//# sourceMappingURL=webhook-entities.js.map
