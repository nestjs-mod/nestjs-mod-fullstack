import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import {
  AUTH_FEATURE,
  AuthExceptionsFilter,
  AuthModule,
} from '@nestjs-mod-fullstack/auth';
import { FilesModule } from '@nestjs-mod-fullstack/files';
import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-fullstack/validation';
import { WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { AuthorizerGuard, AuthorizerModule } from '@nestjs-mod/authorizer';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PrismaModule } from '@nestjs-mod/prisma';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE } from './app.constants';
import { AppController } from './controllers/authorizer-app.controller';
import { FakeEndpointController } from './controllers/authorizer-fake-endoint.controller';
import { TimeController } from './controllers/authorizer-time.controller';
import { AuthorizerController } from './controllers/authorizer.controller';
import { AuthorizerAuthConfiguration } from './integrations/authorizer-auth.configuration';
import { AuthorizerWithMinioFilesConfiguration } from './integrations/authorizer-with-minio-files.configuration';
import { WebhookWithAuthAuthorizerConfiguration } from './integrations/webhook-with-auth-authorizer.configuration';
import { AppService } from './services/app.service';

export const { AppModule: AuthorizerAppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    AuthorizerModule.forRootAsync({
      imports: [
        WebhookModule.forFeature({ featureModuleName: AUTH_FEATURE }),
        AuthModule.forFeature({ featureModuleName: AUTH_FEATURE }),
      ],
      configurationClass: WebhookWithAuthAuthorizerConfiguration,
    }),
    FilesModule.forRootAsync({
      imports: [AuthorizerModule.forFeature(), MinioModule.forFeature()],
      configurationClass: AuthorizerWithMinioFilesConfiguration,
    }),
    AuthModule.forRootAsync({
      imports: [AuthorizerModule.forFeature()],
      configurationClass: AuthorizerAuthConfiguration,
    }),
    AuthorizerModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    AuthModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    WebhookModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    PrismaModule.forFeature({
      contextName: APP_FEATURE,
      featureModuleName: APP_FEATURE,
    }),
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: APP_FEATURE,
    }),
    TranslatesModule.forRootDefault({
      localePaths: [
        join(__dirname, 'assets', 'i18n'),
        join(__dirname, 'assets', 'i18n', 'getText'),
        join(__dirname, 'assets', 'i18n', 'class-validator-messages'),
      ],
      vendorLocalePaths: [join(__dirname, 'assets', 'i18n')],
      locales: ['en', 'ru'],
      validationPipeOptions: {
        transform: true,
        whitelist: true,
        validationError: {
          target: false,
          value: false,
        },
        exceptionFactory: (errors) =>
          new ValidationError(ValidationErrorEnum.COMMON, undefined, errors),
      },
      usePipes: true,
      useInterceptors: true,
    }),
    KeyvModule.forFeature({ featureModuleName: APP_FEATURE }),
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'browser'),
          }),
        ]),
  ],
  controllers: [
    AppController,
    TimeController,
    FakeEndpointController,
    AuthorizerController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthorizerGuard },
    { provide: APP_FILTER, useClass: AuthExceptionsFilter },
    AppService,
    TimeController,
  ],
});
