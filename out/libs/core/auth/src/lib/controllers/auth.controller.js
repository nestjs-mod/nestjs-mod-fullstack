'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthController = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod-fullstack/common');
const validation_1 = require('@nestjs-mod-fullstack/validation');
const prisma_1 = require('@nestjs-mod/prisma');
const common_2 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const auth_client_1 = require('@prisma/auth-client');
const nestjs_translates_1 = require('nestjs-translates');
const auth_constants_1 = require('../auth.constants');
const auth_decorators_1 = require('../auth.decorators');
const auth_errors_1 = require('../auth.errors');
const auth_user_entity_1 = require('../generated/rest/dto/auth-user.entity');
const auth_cache_service_1 = require('../services/auth-cache.service');
const auth_entities_1 = require('../types/auth-entities');
const auth_profile_dto_1 = require('../types/auth-profile.dto');
let AuthController = class AuthController {
  constructor(prismaClient, authCacheService, translatesStorage) {
    this.prismaClient = prismaClient;
    this.authCacheService = authCacheService;
    this.translatesStorage = translatesStorage;
  }
  async profile(authUser) {
    return {
      lang: authUser.lang,
      timezone: authUser.timezone,
      userRole: authUser.userRole,
    };
  }
  async updateProfile(authUser, args, getText) {
    if (args.lang && !this.translatesStorage.locales.includes(args.lang)) {
      throw new validation_1.ValidationError(
        undefined,
        validation_1.ValidationErrorEnum.COMMON,
        [
          {
            property: 'lang',
            constraints: {
              isWrongEnumValue: getText(
                'lang must have one of the values: {{values}}',
                { values: this.translatesStorage.locales.join(', ') }
              ),
            },
          },
        ]
      );
    }
    await this.prismaClient.authUser.update({
      where: { id: authUser.id },
      data: {
        ...(args.lang === undefined
          ? {}
          : {
              lang: args.lang,
            }),
        ...(args.timezone === undefined
          ? {}
          : {
              timezone: args.timezone,
            }),
        updatedAt: new Date(),
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(
      authUser.externalUserId
    );
    return { message: getText('ok') };
  }
};
exports.AuthController = AuthController;
tslib_1.__decorate(
  [
    (0, common_2.Get)('profile'),
    (0, swagger_1.ApiOkResponse)({ type: auth_profile_dto_1.AuthProfileDto }),
    tslib_1.__param(0, (0, auth_decorators_1.CurrentAuthUser)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [auth_user_entity_1.AuthUser]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'profile',
  null
);
tslib_1.__decorate(
  [
    (0, common_2.Post)('update-profile'),
    (0, swagger_1.ApiOkResponse)({ type: common_1.StatusResponse }),
    tslib_1.__param(0, (0, auth_decorators_1.CurrentAuthUser)()),
    tslib_1.__param(1, (0, common_2.Body)()),
    tslib_1.__param(2, (0, nestjs_translates_1.InjectTranslateFunction)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      auth_user_entity_1.AuthUser,
      auth_profile_dto_1.AuthProfileDto,
      Function,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'updateProfile',
  null
);
exports.AuthController = AuthController = tslib_1.__decorate(
  [
    (0, swagger_1.ApiExtraModels)(
      auth_errors_1.AuthError,
      auth_entities_1.AuthEntities,
      validation_1.ValidationError
    ),
    (0, swagger_1.ApiBadRequestResponse)({
      schema: {
        allOf: (0, swagger_1.refs)(
          auth_errors_1.AuthError,
          validation_1.ValidationError
        ),
      },
    }),
    (0, swagger_1.ApiTags)('Auth'),
    (0, auth_decorators_1.CheckAuthRole)([
      auth_client_1.AuthRole.User,
      auth_client_1.AuthRole.Admin,
    ]),
    (0, common_2.Controller)('/auth'),
    tslib_1.__param(
      0,
      (0, prisma_1.InjectPrismaClient)(auth_constants_1.AUTH_FEATURE)
    ),
    tslib_1.__metadata('design:paramtypes', [
      auth_client_1.PrismaClient,
      auth_cache_service_1.AuthCacheService,
      nestjs_translates_1.TranslatesStorage,
    ]),
  ],
  AuthController
);
//# sourceMappingURL=auth.controller.js.map
