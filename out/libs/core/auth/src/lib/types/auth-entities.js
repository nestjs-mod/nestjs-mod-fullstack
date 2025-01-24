'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthEntities = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const auth_client_1 = require('@prisma/auth-client');
class AuthEntities {}
exports.AuthEntities = AuthEntities;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: auth_client_1.Prisma.AuthUserScalarFieldEnum,
      enumName: 'AuthUserScalarFieldEnum',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  AuthEntities.prototype,
  'authUser',
  void 0
);
//# sourceMappingURL=auth-entities.js.map
