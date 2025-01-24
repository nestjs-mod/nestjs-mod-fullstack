'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthUserDto = void 0;
const tslib_1 = require('tslib');
const auth_client_1 = require('../../../../../../../../node_modules/@prisma/auth-client');
const swagger_1 = require('@nestjs/swagger');
class AuthUserDto {}
exports.AuthUserDto = AuthUserDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  AuthUserDto.prototype,
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
  AuthUserDto.prototype,
  'externalUserId',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: auth_client_1.AuthRole,
      enumName: 'AuthRole',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  AuthUserDto.prototype,
  'userRole',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'number',
      format: 'float',
      nullable: true,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  AuthUserDto.prototype,
  'timezone',
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
  AuthUserDto.prototype,
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
  AuthUserDto.prototype,
  'updatedAt',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      nullable: true,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  AuthUserDto.prototype,
  'lang',
  void 0
);
//# sourceMappingURL=auth-user.dto.js.map
