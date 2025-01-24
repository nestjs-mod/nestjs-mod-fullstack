'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookUsersController = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod-fullstack/common');
const webhook_client_1 = require('@prisma/webhook-client');
const prisma_tools_1 = require('@nestjs-mod-fullstack/prisma-tools');
const prisma_1 = require('@nestjs-mod/prisma');
const common_2 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
const update_webhook_user_dto_1 = require('../generated/rest/dto/update-webhook-user.dto');
const webhook_user_entity_1 = require('../generated/rest/dto/webhook-user.entity');
const webhook_cache_service_1 = require('../services/webhook-cache.service');
const webhook_tools_service_1 = require('../services/webhook-tools.service');
const find_many_webhook_user_response_1 = require('../types/find-many-webhook-user-response');
const webhook_constants_1 = require('../webhook.constants');
const webhook_decorators_1 = require('../webhook.decorators');
const webhook_errors_1 = require('../webhook.errors');
const validation_1 = require('@nestjs-mod-fullstack/validation');
const nestjs_translates_1 = require('nestjs-translates');
let WebhookUsersController = class WebhookUsersController {
  constructor(
    prismaClient,
    prismaToolsService,
    webhookToolsService,
    webhookCacheService
  ) {
    this.prismaClient = prismaClient;
    this.prismaToolsService = prismaToolsService;
    this.webhookToolsService = webhookToolsService;
    this.webhookCacheService = webhookCacheService;
  }
  async findMany(externalTenantId, webhookUser, args) {
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
          ...(key in webhook_client_1.Prisma.WebhookUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        webhookUsers: await prisma.webhookUser.findMany({
          where: {
            ...((0, class_validator_1.isUUID)(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalTenantId: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(
              webhookUser,
              webhookUser.userRole === 'Admin' ? undefined : externalTenantId
            ),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.webhookUser.count({
          where: {
            ...((0, class_validator_1.isUUID)(searchText)
              ? {
                  OR: [
                    { id: { equals: searchText } },
                    { externalTenantId: { equals: searchText } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(
              webhookUser,
              webhookUser.userRole === 'Admin' ? undefined : externalTenantId
            ),
          },
        }),
      };
    });
    return {
      webhookUsers: result.webhookUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }
  async updateOne(externalTenantId, webhookUser, id, args) {
    const result = await this.prismaClient.webhookUser.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === 'Admin' ? undefined : externalTenantId
        ),
      },
    });
    await this.webhookCacheService.clearCacheByExternalUserId(
      webhookUser.externalUserId
    );
    return result;
  }
  async deleteOne(externalTenantId, webhookUser, id, getText) {
    await this.prismaClient.webhookUser.delete({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === 'Admin' ? undefined : externalTenantId
        ),
      },
    });
    await this.webhookCacheService.clearCacheByExternalUserId(id);
    return { message: getText('ok') };
  }
  async findOne(externalTenantId, webhookUser, id) {
    return await this.prismaClient.webhookUser.findFirstOrThrow({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(
          webhookUser,
          webhookUser.userRole === 'Admin' ? undefined : externalTenantId
        ),
      },
    });
  }
};
exports.WebhookUsersController = WebhookUsersController;
tslib_1.__decorate(
  [
    (0, common_2.Get)(),
    (0, swagger_1.ApiOkResponse)({
      type: find_many_webhook_user_response_1.FindManyWebhookUserResponse,
    }),
    tslib_1.__param(
      0,
      (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()
    ),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Query)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      String,
      webhook_user_entity_1.WebhookUser,
      common_1.FindManyArgs,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  WebhookUsersController.prototype,
  'findMany',
  null
);
tslib_1.__decorate(
  [
    (0, common_2.Put)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: webhook_user_entity_1.WebhookUser }),
    tslib_1.__param(
      0,
      (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()
    ),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__param(3, (0, common_2.Body)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      String,
      webhook_user_entity_1.WebhookUser,
      String,
      update_webhook_user_dto_1.UpdateWebhookUserDto,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  WebhookUsersController.prototype,
  'updateOne',
  null
);
tslib_1.__decorate(
  [
    (0, common_2.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: common_1.StatusResponse }),
    tslib_1.__param(
      0,
      (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()
    ),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__param(3, (0, nestjs_translates_1.InjectTranslateFunction)()),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      String,
      webhook_user_entity_1.WebhookUser,
      String,
      Function,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  WebhookUsersController.prototype,
  'deleteOne',
  null
);
tslib_1.__decorate(
  [
    (0, common_2.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: webhook_user_entity_1.WebhookUser }),
    tslib_1.__param(
      0,
      (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()
    ),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__metadata('design:type', Function),
    tslib_1.__metadata('design:paramtypes', [
      String,
      webhook_user_entity_1.WebhookUser,
      String,
    ]),
    tslib_1.__metadata('design:returntype', Promise),
  ],
  WebhookUsersController.prototype,
  'findOne',
  null
);
exports.WebhookUsersController = WebhookUsersController = tslib_1.__decorate(
  [
    (0, swagger_1.ApiExtraModels)(
      webhook_errors_1.WebhookError,
      validation_1.ValidationError
    ),
    (0, swagger_1.ApiBadRequestResponse)({
      schema: {
        allOf: (0, swagger_1.refs)(
          webhook_errors_1.WebhookError,
          validation_1.ValidationError
        ),
      },
    }),
    (0, swagger_1.ApiTags)('Webhook'),
    (0, webhook_decorators_1.CheckWebhookRole)([
      webhook_client_1.WebhookRole.Admin,
    ]),
    (0, common_2.Controller)('/webhook/users'),
    tslib_1.__param(
      0,
      (0, prisma_1.InjectPrismaClient)(webhook_constants_1.WEBHOOK_FEATURE)
    ),
    tslib_1.__metadata('design:paramtypes', [
      webhook_client_1.PrismaClient,
      prisma_tools_1.PrismaToolsService,
      webhook_tools_service_1.WebhookToolsService,
      webhook_cache_service_1.WebhookCacheService,
    ]),
  ],
  WebhookUsersController
);
//# sourceMappingURL=webhook-users.controller.js.map
