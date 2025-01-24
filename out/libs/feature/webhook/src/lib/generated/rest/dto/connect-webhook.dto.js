'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ConnectWebhookDto = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class ConnectWebhookDto {}
exports.ConnectWebhookDto = ConnectWebhookDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  ConnectWebhookDto.prototype,
  'id',
  void 0
);
//# sourceMappingURL=connect-webhook.dto.js.map
