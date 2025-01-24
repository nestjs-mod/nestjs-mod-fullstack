'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FindManyAuthUserResponse = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod-fullstack/common');
const swagger_1 = require('@nestjs/swagger');
const auth_user_entity_1 = require('../generated/rest/dto/auth-user.entity');
class FindManyAuthUserResponse {}
exports.FindManyAuthUserResponse = FindManyAuthUserResponse;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: () => [auth_user_entity_1.AuthUser] }),
    tslib_1.__metadata('design:type', Array),
  ],
  FindManyAuthUserResponse.prototype,
  'authUsers',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: () => common_1.FindManyResponseMeta }),
    tslib_1.__metadata('design:type', common_1.FindManyResponseMeta),
  ],
  FindManyAuthUserResponse.prototype,
  'meta',
  void 0
);
//# sourceMappingURL=find-many-auth-user-response.js.map
