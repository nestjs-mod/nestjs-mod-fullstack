'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthUsersController = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod-fullstack/common');
const auth_client_1 = require('@prisma/auth-client');
const prisma_tools_1 = require('@nestjs-mod-fullstack/prisma-tools');
const validation_1 = require('@nestjs-mod-fullstack/validation');
const prisma_1 = require('@nestjs-mod/prisma');
const common_2 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
const nestjs_translates_1 = require('nestjs-translates');
const auth_constants_1 = require('../auth.constants');
const auth_decorators_1 = require('../auth.decorators');
const auth_errors_1 = require('../auth.errors');
const auth_user_entity_1 = require('../generated/rest/dto/auth-user.entity');
const update_auth_user_dto_1 = require('../generated/rest/dto/update-auth-user.dto');
const auth_cache_service_1 = require('../services/auth-cache.service');
const find_many_auth_user_response_1 = require('../types/find-many-auth-user-response');
let AuthUsersController = class AuthUsersController {
  constructor(prismaClient, prismaToolsService, authCacheService) {
    this.prismaClient = prismaClient;
    this.prismaToolsService = prismaToolsService;
    this.authCacheService = authCacheService;
  }
  async findMany(authUser, args) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
        curPage: args.curPage,
        perPage: args.perPage,
      });
    const searchText = args.searchText;
    const orderBy = (args.sort || 'createdAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in auth_client_1.Prisma.AuthUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        authUsers: await prisma.authUser.findMany({
          where: {
            ...((0, class_validator_1.isUUID)(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.authUser.count({
          where: {
            ...((0, class_validator_1.isUUID)(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),
          },
        }),
      };
    });
    return {
      authUsers: result.authUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }
  async updateOne(authUser, id, args) {
    const result = await this.prismaClient.authUser.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(
      authUser.externalUserId
    );
    return result;
  }
  async deleteOne(authUser, id, getText) {
    await this.prismaClient.authUser.delete({
      where: {
        id,
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(id);
    return { message: getText('ok') };
  }
  async findOne(authUser, id) {
    return await this.prismaClient.authUser.findFirstOrThrow({
      where: {
        id,
      },
    });
  }
};
exports.AuthUsersController = AuthUsersController;
tslib_1.__decorate(
  [
    (0, common_2.Get)(),
    (0, swagger_1.ApiOkResponse)({
      type: find_many_auth_user_response_1.FindManyAuthUserResponse,
    }),
    tslib_1.__param(0, (0, auth_decorators_1.CurrentAuthUser)()),
    tslib_1.__param(1, (0, common_2.Query)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      auth_user_entity_1.AuthUser,
      common_1.FindManyArgs,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  AuthUsersController.prototype,
  'findMany',
  null
);
tslib_1.__decorate(
  [
    (0, common_2.Put)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: auth_user_entity_1.AuthUser }),
    tslib_1.__param(0, (0, auth_decorators_1.CurrentAuthUser)()),
    tslib_1.__param(1, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__param(2, (0, common_2.Body)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      auth_user_entity_1.AuthUser,
      String,
      update_auth_user_dto_1.UpdateAuthUserDto,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  AuthUsersController.prototype,
  'updateOne',
  null
);
tslib_1.__decorate(
  [
    (0, common_2.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: common_1.StatusResponse }),
    tslib_1.__param(0, (0, auth_decorators_1.CurrentAuthUser)()),
    tslib_1.__param(1, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__param(2, (0, nestjs_translates_1.InjectTranslateFunction)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      auth_user_entity_1.AuthUser,
      String,
      Function,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  AuthUsersController.prototype,
  'deleteOne',
  null
);
tslib_1.__decorate(
  [
    (0, common_2.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: auth_user_entity_1.AuthUser }),
    tslib_1.__param(0, (0, auth_decorators_1.CurrentAuthUser)()),
    tslib_1.__param(1, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      auth_user_entity_1.AuthUser,
      String,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  AuthUsersController.prototype,
  'findOne',
  null
);
exports.AuthUsersController = AuthUsersController = tslib_1.__decorate(
  [
    (0, swagger_1.ApiExtraModels)(
      auth_errors_1.AuthError,
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
    (0, auth_decorators_1.CheckAuthRole)([auth_client_1.AuthRole.Admin]),
    (0, common_2.Controller)('/auth/users'),
    tslib_1.__param(
      0,
      (0, prisma_1.InjectPrismaClient)(auth_constants_1.AUTH_FEATURE)
    ),
    tslib_1.__metadata('design:paramtypes', [
      auth_client_1.PrismaClient,
      prisma_tools_1.PrismaToolsService,
      auth_cache_service_1.AuthCacheService,
    ]),
  ],
  AuthUsersController
);
//# sourceMappingURL=auth-users.controller.js.map
