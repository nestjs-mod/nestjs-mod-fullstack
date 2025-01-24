'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookUser = void 0;
const tslib_1 = require('tslib');
const webhook_client_1 = require('../../../../../../../../node_modules/@prisma/webhook-client');
const swagger_1 = require('@nestjs/swagger');
const webhook_entity_1 = require('./webhook.entity');
class WebhookUser {}
exports.WebhookUser = WebhookUser;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookUser.prototype,
  'id',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookUser.prototype,
  'externalTenantId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookUser.prototype,
  'externalUserId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.WebhookRole,
      enumName: 'WebhookRole',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookUser.prototype,
  'userRole',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      format: 'date-time',
    }),
    tslib_1.__metadata('design:type', Date),
  ],
  WebhookUser.prototype,
  'createdAt',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      format: 'date-time',
    }),
    tslib_1.__metadata('design:type', Date),
  ],
  WebhookUser.prototype,
  'updatedAt',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => webhook_entity_1.Webhook,
      isArray: true,
      required: false,
    }),
    tslib_1.__metadata('design:type', Array),
  ],
  WebhookUser.prototype,
  'Webhook_Webhook_createdByToWebhookUser',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => webhook_entity_1.Webhook,
      isArray: true,
      required: false,
    }),
    tslib_1.__metadata('design:type', Array),
  ],
  WebhookUser.prototype,
  'Webhook_Webhook_updatedByToWebhookUser',
  void 0
);
//# sourceMappingURL=webhook-user.entity.js.map
