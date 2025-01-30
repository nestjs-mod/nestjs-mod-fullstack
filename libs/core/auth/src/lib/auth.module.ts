import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { PrismaModule } from '@nestjs-mod/prisma';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TranslatesModule } from 'nestjs-translates';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthConfiguration } from './auth.configuration';
import { AUTH_FEATURE, AUTH_MODULE } from './auth.constants';
import { AuthEnvironments } from './auth.environments';
import { AuthExceptionsFilter } from './auth.filter';
import { AuthGuard } from './auth.guard';
import { AuthUsersController } from './controllers/auth-users.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthTimezoneInterceptor } from './interceptors/auth-timezone.interceptor';
import { AuthTimezonePipe } from './pipes/auth-timezone.pipe';
import { AuthCacheService } from './services/auth-cache.service';
import { AuthDefaultDataBootstrapService } from './services/auth-default-data-bootstrap.service';
import { AuthTimezoneService } from './services/auth-timezone.service';

export const { AuthModule } = createNestModule({
  moduleName: AUTH_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: AuthEnvironments,
  configurationModel: AuthConfiguration,
  imports: [
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
    }),
    KeyvModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
    TranslatesModule,
  ],
  controllers: [AuthController, AuthUsersController],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
    }),
    KeyvModule.forFeature({
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
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: AuthExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: AuthTimezoneInterceptor },
    { provide: APP_PIPE, useClass: AuthTimezonePipe },
    AuthDefaultDataBootstrapService,
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
