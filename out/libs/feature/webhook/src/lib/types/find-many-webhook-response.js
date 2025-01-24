'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FindManyWebhookResponse = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod-fullstack/common');
const swagger_1 = require('@nestjs/swagger');
const webhook_entity_1 = require('../generated/rest/dto/webhook.entity');
class FindManyWebhookResponse {}
exports.FindManyWebhookResponse = FindManyWebhookResponse;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: () => [webhook_entity_1.Webhook] }),
    tslib_1.__metadata('design:type', Array),
  ],
  FindManyWebhookResponse.prototype,
  'webhooks',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: () => common_1.FindManyResponseMeta }),
    tslib_1.__metadata('design:type', common_1.FindManyResponseMeta),
  ],
  FindManyWebhookResponse.prototype,
  'meta',
  void 0
);
//# sourceMappingURL=find-many-webhook-response.js.map
