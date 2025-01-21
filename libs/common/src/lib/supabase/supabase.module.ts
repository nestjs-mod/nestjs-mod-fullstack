import { NestModuleCategory, createNestModule } from '@nestjs-mod/common';
import { APP_GUARD } from '@nestjs/core';
import { SUPABASE_MODULE } from './supabase.constants';
import { SupabaseEnvironments } from './supabase.environments';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseService } from './supabase.service';
import { SupabaseConfiguration } from './supabase.configuration';

export const { SupabaseModule } = createNestModule({
  moduleName: SUPABASE_MODULE,
  moduleCategory: NestModuleCategory.core,
  moduleDescription: 'Universal javaScript SDK for Supabase API',
  configurationModel: SupabaseConfiguration,
  environmentsModel: SupabaseEnvironments,
  sharedProviders: [SupabaseService],
  providers: [{ provide: APP_GUARD, useClass: SupabaseGuard }],
});
