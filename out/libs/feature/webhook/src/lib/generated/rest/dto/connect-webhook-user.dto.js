'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ConnectWebhookUserDto =
  exports.WebhookUserExternalTenantIdExternalUserIdUniqueInputDto = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
class WebhookUserExternalTenantIdExternalUserIdUniqueInputDto {}
exports.WebhookUserExternalTenantIdExternalUserIdUniqueInputDto =
  WebhookUserExternalTenantIdExternalUserIdUniqueInputDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookUserExternalTenantIdExternalUserIdUniqueInputDto.prototype,
  'externalTenantId',
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
  WebhookUserExternalTenantIdExternalUserIdUniqueInputDto.prototype,
  'externalUserId',
  void 0
);
let ConnectWebhookUserDto = class ConnectWebhookUserDto {};
exports.ConnectWebhookUserDto = ConnectWebhookUserDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
      nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  ConnectWebhookUserDto.prototype,
  'id',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: WebhookUserExternalTenantIdExternalUserIdUniqueInputDto,
      required: false,
      nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(
      () => WebhookUserExternalTenantIdExternalUserIdUniqueInputDto
    ),
    tslib_1.__metadata(
      'design:type',
      WebhookUserExternalTenantIdExternalUserIdUniqueInputDto
    ),
  ],
  ConnectWebhookUserDto.prototype,
  'externalTenantId_externalUserId',
  void 0
);
exports.ConnectWebhookUserDto = ConnectWebhookUserDto = tslib_1.__decorate(
  [
    (0, swagger_1.ApiExtraModels)(
      WebhookUserExternalTenantIdExternalUserIdUniqueInputDto
    ),
  ],
  ConnectWebhookUserDto
);
//# sourceMappingURL=connect-webhook-user.dto.js.map
