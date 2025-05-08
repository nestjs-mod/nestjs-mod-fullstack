import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
} from '@nestjs-mod/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SsoConfiguration } from './sso.configuration';
import { SUPABASE_FEATURE, SUPABASE_MODULE } from './sso.constants';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoExceptionsFilter } from './sso.filter';
import { SsoGuard } from './sso.guard';
import { SsoService } from './sso.service';

export const { SsoModule } = createNestModule({
  moduleName: SUPABASE_MODULE,
  moduleCategory: NestModuleCategory.core,
  moduleDescription: 'Universal javascript SDK for Sso API',
  configurationModel: SsoConfiguration,
  staticEnvironmentsModel: SsoStaticEnvironments,
  sharedProviders: [SsoService],
  providers: [
    { provide: APP_GUARD, useClass: SsoGuard },
    { provide: APP_FILTER, useClass: SsoExceptionsFilter },
  ],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass =
      getFeatureDotEnvPropertyNameFormatter(SUPABASE_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: SUPABASE_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
