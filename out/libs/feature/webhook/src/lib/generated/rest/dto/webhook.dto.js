'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookDto = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
class WebhookDto {}
exports.WebhookDto = WebhookDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookDto.prototype,
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
  WebhookDto.prototype,
  'eventName',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookDto.prototype,
  'endpoint',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'boolean',
    }),
    tslib_1.__metadata('design:type', Boolean),
  ],
  WebhookDto.prototype,
  'enabled',
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
  WebhookDto.prototype,
  'headers',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
      nullable: true,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  WebhookDto.prototype,
  'requestTimeout',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookDto.prototype,
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
  WebhookDto.prototype,
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
  WebhookDto.prototype,
  'updatedAt',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      format: 'date-time',
      nullable: true,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  WebhookDto.prototype,
  'workUntilDate',
  void 0
);
//# sourceMappingURL=webhook.dto.js.map
