import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationConfiguration } from './validation.configuration';
import { VALIDATION_FEATURE, VALIDATION_MODULE } from './validation.constants';
import { ValidationEnvironments } from './validation.environments';
import { ValidationExceptionsFilter } from './validation.filter';
import { ValidationError, ValidationErrorEnum } from './validation.errors';

export const { ValidationModule } = createNestModule({
  moduleName: VALIDATION_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: ValidationConfiguration,
  staticEnvironmentsModel: ValidationEnvironments,
  providers: ({ staticEnvironments }) => {
    const providers: Provider[] = [];
    if (staticEnvironments.usePipes) {
      providers.push({
        provide: APP_PIPE,
        useValue: new ValidationPipe({
          transform: true,
          whitelist: true,
          validationError: {
            target: false,
            value: false,
          },
          exceptionFactory: (errors) =>
            new ValidationError(ValidationErrorEnum.COMMON, undefined, errors),
        }),
      });
    }
    if (staticEnvironments.useFilters) {
      providers.push({
        provide: APP_FILTER,
        useClass: ValidationExceptionsFilter,
      });
    }
    return providers;
  },
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass =
      getFeatureDotEnvPropertyNameFormatter(VALIDATION_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: VALIDATION_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
