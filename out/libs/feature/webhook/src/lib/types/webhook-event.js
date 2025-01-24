'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookEvent = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
class WebhookEvent {}
exports.WebhookEvent = WebhookEvent;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: String }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookEvent.prototype,
  'eventName',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: String }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookEvent.prototype,
  'description',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: Object }),
    tslib_1.__metadata('design:type', Object),
  ],
  WebhookEvent.prototype,
  'example',
  void 0
);
//# sourceMappingURL=webhook-event.js.map
