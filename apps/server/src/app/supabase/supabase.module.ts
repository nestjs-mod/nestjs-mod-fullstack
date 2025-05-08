import {
  NestModuleCategory,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
} from '@nestjs-mod/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SUPABASE_FEATURE, SUPABASE_MODULE } from './supabase.constants';
import { SupabaseStaticEnvironments } from './supabase.environments';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseService } from './supabase.service';
import { SupabaseConfiguration } from './supabase.configuration';
import { SupabaseExceptionsFilter } from './supabase.filter';

export const { SupabaseModule } = createNestModule({
  moduleName: SUPABASE_MODULE,
  moduleCategory: NestModuleCategory.core,
  moduleDescription: 'Universal javascript SDK for Supabase API',
  configurationModel: SupabaseConfiguration,
  staticEnvironmentsModel: SupabaseStaticEnvironments,
  sharedProviders: [SupabaseService],
  providers: [
    { provide: APP_GUARD, useClass: SupabaseGuard },
    { provide: APP_FILTER, useClass: SupabaseExceptionsFilter },
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
