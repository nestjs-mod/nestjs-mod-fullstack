'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ValidationModule = void 0;
const common_1 = require('@nestjs-mod/common');
const common_2 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const validation_configuration_1 = require('./validation.configuration');
const validation_constants_1 = require('./validation.constants');
const validation_environments_1 = require('./validation.environments');
const validation_filter_1 = require('./validation.filter');
const validation_errors_1 = require('./validation.errors');
exports.ValidationModule = (0, common_1.createNestModule)({
  moduleName: validation_constants_1.VALIDATION_MODULE,
  moduleCategory: common_1.NestModuleCategory.feature,
  configurationModel: validation_configuration_1.ValidationConfiguration,
  staticEnvironmentsModel: validation_environments_1.ValidationEnvironments,
  providers: ({ staticEnvironments }) => {
    const providers = [];
    if (staticEnvironments.usePipes) {
      providers.push({
        provide: core_1.APP_PIPE,
        useValue: new common_2.ValidationPipe({
          transform: true,
          whitelist: true,
          validationError: {
            target: false,
            value: false,
          },
          exceptionFactory: (errors) =>
            new validation_errors_1.ValidationError(
              validation_errors_1.ValidationErrorEnum.COMMON,
              undefined,
              errors
            ),
        }),
      });
    }
    if (staticEnvironments.useFilters) {
      providers.push({
        provide: core_1.APP_FILTER,
        useClass: validation_filter_1.ValidationExceptionsFilter,
      });
    }
    return providers;
  },
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = (0, common_1.getFeatureDotEnvPropertyNameFormatter)(
      validation_constants_1.VALIDATION_FEATURE
    );
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: validation_constants_1.VALIDATION_FEATURE,
      },
    });
    return { asyncModuleOptions };
  },
}).ValidationModule;
//# sourceMappingURL=validation.module.js.map
