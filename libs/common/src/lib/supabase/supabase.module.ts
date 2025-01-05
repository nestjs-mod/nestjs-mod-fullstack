import { NestModuleCategory, createNestModule } from '@nestjs-mod/common';
import { SUPABASE_MODULE } from './supabase.constants';
import { SupabaseEnvironments } from './supabase.environments';
import { SupabaseService } from './supabase.service';
import { AuthorizerModule } from '@nestjs-mod/authorizer';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseGuard } from './supabase.guard';

export const { SupabaseModule } = createNestModule({
  moduleName: SUPABASE_MODULE,
  moduleCategory: NestModuleCategory.core,
  moduleDescription: 'Universal javaScript SDK for Supabase API',
  staticEnvironmentsModel: SupabaseEnvironments,
  sharedImports: [
    AuthorizerModule.forFeature({ featureModuleName: SUPABASE_MODULE }),
  ],
  sharedProviders: [SupabaseService],
  providers: [{ provide: APP_GUARD, useClass: SupabaseGuard }],
});
