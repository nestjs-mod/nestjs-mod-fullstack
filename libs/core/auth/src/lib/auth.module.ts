import { AuthorizerGuard, AuthorizerModule } from '@nestjs-mod/authorizer';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AUTH_FEATURE, AUTH_MODULE } from './auth.constants';
import { AuthEnvironments } from './auth.environments';
import { AuthExceptionsFilter } from './auth.filter';
import { AuthGuard } from './auth.guard';
import { AuthController } from './controllers/auth.controller';
import { AuthorizerController } from './controllers/authorizer.controller';
import { AuthTimezoneInterceptor } from './interceptors/auth-timezone.interceptor';
import { AuthAuthorizerBootstrapService } from './services/auth-authorizer-bootstrap.service';
import { AuthAuthorizerService } from './services/auth-authorizer.service';
import { AuthTimezoneService } from './services/auth-timezone.service';
import { CacheManagerModule } from '@nestjs-mod/cache-manager';
import { AuthCacheService } from './services/auth-cache.service';
import { TranslatesModule } from 'nestjs-translates';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthTimezonePipe } from './pipes/auth-timezone.pipe';

export const { AuthModule } = createNestModule({
  moduleName: AUTH_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: AuthEnvironments,
  imports: [
    AuthorizerModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
    }),
    CacheManagerModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
    TranslatesModule,
  ],
  controllers: [AuthorizerController, AuthController],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
    }),
    CacheManagerModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
  ],
  sharedProviders: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    AuthTimezoneService,
    AuthCacheService,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthorizerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: AuthExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: AuthTimezoneInterceptor },
    { provide: APP_PIPE, useClass: AuthTimezonePipe },
    AuthAuthorizerService,
    AuthAuthorizerBootstrapService,
  ],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(AUTH_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: AUTH_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
