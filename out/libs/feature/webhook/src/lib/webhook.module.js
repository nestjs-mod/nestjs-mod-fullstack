'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookModule = void 0;
const prisma_tools_1 = require('@nestjs-mod-fullstack/prisma-tools');
const common_1 = require('@nestjs-mod/common');
const prisma_1 = require('@nestjs-mod/prisma');
const axios_1 = require('@nestjs/axios');
const common_2 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const webhook_users_controller_1 = require('./controllers/webhook-users.controller');
const webhook_controller_1 = require('./controllers/webhook.controller');
const webhook_bootstrap_service_1 = require('./services/webhook-bootstrap.service');
const webhook_tools_service_1 = require('./services/webhook-tools.service');
const webhook_users_service_1 = require('./services/webhook-users.service');
const webhook_service_1 = require('./services/webhook.service');
const webhook_configuration_1 = require('./webhook.configuration');
const webhook_constants_1 = require('./webhook.constants');
const webhook_environments_1 = require('./webhook.environments');
const webhook_filter_1 = require('./webhook.filter');
const webhook_guard_1 = require('./webhook.guard');
const keyv_1 = require('@nestjs-mod/keyv');
const nestjs_translates_1 = require('nestjs-translates');
const webhook_cache_service_1 = require('./services/webhook-cache.service');
exports.WebhookModule = (0, common_1.createNestModule)({
  moduleName: webhook_constants_1.WEBHOOK_MODULE,
  moduleCategory: common_1.NestModuleCategory.feature,
  staticEnvironmentsModel: webhook_environments_1.WebhookEnvironments,
  staticConfigurationModel: webhook_configuration_1.WebhookStaticConfiguration,
  configurationModel: webhook_configuration_1.WebhookConfiguration,
  imports: [
    axios_1.HttpModule,
    prisma_1.PrismaModule.forFeature({
      contextName: webhook_constants_1.WEBHOOK_FEATURE,
      featureModuleName: webhook_constants_1.WEBHOOK_FEATURE,
    }),
    prisma_tools_1.PrismaToolsModule.forFeature({
      featureModuleName: webhook_constants_1.WEBHOOK_FEATURE,
    }),
    keyv_1.KeyvModule.forFeature({
      featureModuleName: webhook_constants_1.WEBHOOK_FEATURE,
    }),
    nestjs_translates_1.TranslatesModule,
  ],
  sharedImports: [
    prisma_1.PrismaModule.forFeature({
      contextName: webhook_constants_1.WEBHOOK_FEATURE,
      featureModuleName: webhook_constants_1.WEBHOOK_FEATURE,
    }),
  ],
  providers: [
    webhook_tools_service_1.WebhookToolsService,
    webhook_bootstrap_service_1.WebhookServiceBootstrap,
    webhook_cache_service_1.WebhookCacheService,
  ],
  controllers: [
    webhook_users_controller_1.WebhookUsersController,
    webhook_controller_1.WebhookController,
  ],
  sharedProviders: [
    webhook_service_1.WebhookService,
    webhook_users_service_1.WebhookUsersService,
  ],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = (0, common_1.getFeatureDotEnvPropertyNameFormatter)(
      webhook_constants_1.WEBHOOK_FEATURE
    );
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: webhook_constants_1.WEBHOOK_FEATURE,
      },
    });
    return { asyncModuleOptions };
  },
  preWrapApplication: async ({ current }) => {
    const staticEnvironments = current.staticEnvironments;
    const staticConfiguration = current.staticConfiguration;
    for (const ctrl of [
      webhook_controller_1.WebhookController,
      webhook_users_controller_1.WebhookUsersController,
    ]) {
      if (staticEnvironments.useFilters) {
        (0, common_2.UseFilters)(webhook_filter_1.WebhookExceptionsFilter)(
          ctrl
        );
      }
      if (staticEnvironments.useGuards) {
        (0, common_2.UseGuards)(webhook_guard_1.WebhookGuard)(ctrl);
      }
      if (
        staticConfiguration.externalUserIdHeaderName &&
        staticConfiguration.externalTenantIdHeaderName
      ) {
        (0, swagger_1.ApiHeaders)([
          {
            name: staticConfiguration.externalUserIdHeaderName,
            allowEmptyValue: true,
          },
          {
            name: staticConfiguration.externalTenantIdHeaderName,
            allowEmptyValue: true,
          },
        ])(ctrl);
      }
    }
  },
}).WebhookModule;
//# sourceMappingURL=webhook.module.js.map
