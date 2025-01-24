'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthModule = void 0;
const common_1 = require('@nestjs-mod-fullstack/common');
const prisma_tools_1 = require('@nestjs-mod-fullstack/prisma-tools');
const common_2 = require('@nestjs-mod/common');
const keyv_1 = require('@nestjs-mod/keyv');
const prisma_1 = require('@nestjs-mod/prisma');
const core_1 = require('@nestjs/core');
const nestjs_translates_1 = require('nestjs-translates');
const node_async_hooks_1 = require('node:async_hooks');
const auth_constants_1 = require('./auth.constants');
const auth_environments_1 = require('./auth.environments');
const auth_filter_1 = require('./auth.filter');
const auth_guard_1 = require('./auth.guard');
const auth_users_controller_1 = require('./controllers/auth-users.controller');
const auth_controller_1 = require('./controllers/auth.controller');
const auth_timezone_interceptor_1 = require('./interceptors/auth-timezone.interceptor');
const auth_timezone_pipe_1 = require('./pipes/auth-timezone.pipe');
const auth_cache_service_1 = require('./services/auth-cache.service');
const auth_supabase_bootstrap_service_1 = require('./services/auth-supabase-bootstrap.service');
const auth_supabase_service_1 = require('./services/auth-supabase.service');
const auth_timezone_service_1 = require('./services/auth-timezone.service');
exports.AuthModule = (0, common_2.createNestModule)({
  moduleName: auth_constants_1.AUTH_MODULE,
  moduleCategory: common_2.NestModuleCategory.feature,
  staticEnvironmentsModel: auth_environments_1.AuthEnvironments,
  imports: [
    common_1.SupabaseModule.forFeature({
      featureModuleName: auth_constants_1.AUTH_FEATURE,
    }),
    common_1.SupabaseModule.forFeature({
      featureModuleName: auth_constants_1.AUTH_FEATURE,
    }),
    prisma_1.PrismaModule.forFeature({
      contextName: auth_constants_1.AUTH_FEATURE,
      featureModuleName: auth_constants_1.AUTH_FEATURE,
    }),
    keyv_1.KeyvModule.forFeature({
      featureModuleName: auth_constants_1.AUTH_FEATURE,
    }),
    prisma_tools_1.PrismaToolsModule.forFeature({
      featureModuleName: auth_constants_1.AUTH_FEATURE,
    }),
    nestjs_translates_1.TranslatesModule,
  ],
  controllers: [
    auth_controller_1.AuthController,
    auth_users_controller_1.AuthUsersController,
  ],
  sharedImports: [
    prisma_1.PrismaModule.forFeature({
      contextName: auth_constants_1.AUTH_FEATURE,
      featureModuleName: auth_constants_1.AUTH_FEATURE,
    }),
    keyv_1.KeyvModule.forFeature({
      featureModuleName: auth_constants_1.AUTH_FEATURE,
    }),
  ],
  sharedProviders: [
    {
      provide: node_async_hooks_1.AsyncLocalStorage,
      useValue: new node_async_hooks_1.AsyncLocalStorage(),
    },
    auth_timezone_service_1.AuthTimezoneService,
    auth_cache_service_1.AuthCacheService,
  ],
  providers: [
    { provide: core_1.APP_GUARD, useClass: auth_guard_1.AuthGuard },
    {
      provide: core_1.APP_FILTER,
      useClass: auth_filter_1.AuthExceptionsFilter,
    },
    {
      provide: core_1.APP_INTERCEPTOR,
      useClass: auth_timezone_interceptor_1.AuthTimezoneInterceptor,
    },
    {
      provide: core_1.APP_PIPE,
      useClass: auth_timezone_pipe_1.AuthTimezonePipe,
    },
    auth_supabase_service_1.AuthSupabaseService,
    auth_supabase_bootstrap_service_1.AuthSupabaseBootstrapService,
  ],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = (0, common_2.getFeatureDotEnvPropertyNameFormatter)(
      auth_constants_1.AUTH_FEATURE
    );
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: auth_constants_1.AUTH_FEATURE,
      },
    });
    return { asyncModuleOptions };
  },
}).AuthModule;
//# sourceMappingURL=auth.module.js.map
