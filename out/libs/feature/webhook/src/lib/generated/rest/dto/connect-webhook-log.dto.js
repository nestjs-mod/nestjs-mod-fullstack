'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ConnectWebhookLogDto = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class ConnectWebhookLogDto {}
exports.ConnectWebhookLogDto = ConnectWebhookLogDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  ConnectWebhookLogDto.prototype,
  'id',
  void 0
);
//# sourceMappingURL=connect-webhook-log.dto.js.map
