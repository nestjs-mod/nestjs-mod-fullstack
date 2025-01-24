'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookLog = void 0;
const tslib_1 = require('tslib');
const webhook_client_1 = require('../../../../../../../../node_modules/@prisma/webhook-client');
const swagger_1 = require('@nestjs/swagger');
const webhook_entity_1 = require('./webhook.entity');
class WebhookLog {}
exports.WebhookLog = WebhookLog;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookLog.prototype,
  'id',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => Object,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  WebhookLog.prototype,
  'request',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookLog.prototype,
  'responseStatus',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => Object,
      nullable: true,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  WebhookLog.prototype,
  'response',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: webhook_client_1.WebhookStatus,
      enumName: 'WebhookStatus',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookLog.prototype,
  'webhookStatus',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookLog.prototype,
  'webhookId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookLog.prototype,
  'externalTenantId',
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
  WebhookLog.prototype,
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
  WebhookLog.prototype,
  'updatedAt',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => webhook_entity_1.Webhook,
      required: false,
    }),
    tslib_1.__metadata('design:type', webhook_entity_1.Webhook),
  ],
  WebhookLog.prototype,
  'Webhook',
  void 0
);
//# sourceMappingURL=webhook-log.entity.js.map
