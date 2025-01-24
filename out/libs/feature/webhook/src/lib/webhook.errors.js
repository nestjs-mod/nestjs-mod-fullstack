'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookError =
  exports.WEBHOOK_ERROR_ENUM_TITLES =
  exports.WebhookErrorEnum =
    void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const nestjs_translates_1 = require('nestjs-translates');
var WebhookErrorEnum;
(function (WebhookErrorEnum) {
  WebhookErrorEnum['COMMON'] = 'WEBHOOK-000';
  WebhookErrorEnum['FORBIDDEN'] = 'WEBHOOK-001';
  WebhookErrorEnum['EXTERNAL_USER_ID_NOT_SET'] = 'WEBHOOK-002';
  WebhookErrorEnum['EXTERNAL_TENANT_ID_NOT_SET'] = 'WEBHOOK-003';
  WebhookErrorEnum['USER_NOT_FOUND'] = 'WEBHOOK-004';
  WebhookErrorEnum['EVENT_NOT_FOUND'] = 'WEBHOOK-005';
})(WebhookErrorEnum || (exports.WebhookErrorEnum = WebhookErrorEnum = {}));
exports.WEBHOOK_ERROR_ENUM_TITLES = {
  [WebhookErrorEnum.COMMON]: (0, nestjs_translates_1.getText)('Webhook error'),
  [WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET]: (0,
  nestjs_translates_1.getText)('Tenant ID not set'),
  [WebhookErrorEnum.EXTERNAL_USER_ID_NOT_SET]: (0, nestjs_translates_1.getText)(
    'User ID not set'
  ),
  [WebhookErrorEnum.FORBIDDEN]: (0, nestjs_translates_1.getText)('Forbidden'),
  [WebhookErrorEnum.USER_NOT_FOUND]: (0, nestjs_translates_1.getText)(
    'User not found'
  ),
  [WebhookErrorEnum.EVENT_NOT_FOUND]: (0, nestjs_translates_1.getText)(
    'Event not found'
  ),
};
class WebhookError extends Error {
  constructor(message, code, metadata) {
    const messageAsCode = Boolean(
      message && Object.values(WebhookErrorEnum).includes(message)
    );
    const preparedCode = messageAsCode ? message : code;
    const preparedMessage = preparedCode
      ? exports.WEBHOOK_ERROR_ENUM_TITLES[preparedCode]
      : message;
    code = preparedCode || WebhookErrorEnum.COMMON;
    message = preparedMessage || exports.WEBHOOK_ERROR_ENUM_TITLES[code];
    super(message);
    this.code = WebhookErrorEnum.COMMON;
    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
exports.WebhookError = WebhookError;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: String,
      description: Object.entries(exports.WEBHOOK_ERROR_ENUM_TITLES)
        .map(([key, value]) => `${value} (${key})`)
        .join(', '),
      example: exports.WEBHOOK_ERROR_ENUM_TITLES[WebhookErrorEnum.COMMON],
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookError.prototype,
  'message',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: WebhookErrorEnum,
      enumName: 'WebhookErrorEnum',
      example: WebhookErrorEnum.COMMON,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  WebhookError.prototype,
  'code',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: Object }),
    tslib_1.__metadata('design:type', Object),
  ],
  WebhookError.prototype,
  'metadata',
  void 0
);
//# sourceMappingURL=webhook.errors.js.map
