import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import {
  AUTH_FEATURE,
  AuthExceptionsFilter,
  AuthModule,
} from '@nestjs-mod-fullstack/auth';
import { FilesModule } from '@nestjs-mod/files';
import { ValidationError, ValidationErrorEnum } from '@nestjs-mod/validation';
import { WebhookModule } from '@nestjs-mod/webhook';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PrismaModule } from '@nestjs-mod/prisma';
import { SsoGuard, SsoModule } from '@nestjs-mod/sso';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { getText, TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE, APP_MODULE } from './app.constants';
import { AppExceptionsFilter } from './app.filter';
import { AppController } from './controllers/app.controller';
import { FakeEndpointController } from './controllers/fake-endoint.controller';
import { TimeController } from './controllers/time.controller';
import { SsoAuthConfiguration } from './integrations/sso-auth.configuration';
import { SsoWithMinioFilesConfiguration } from './integrations/sso-with-minio-files.configuration';
import { WebhookWithAuthSsoConfiguration } from './integrations/webhook-with-auth-sso.configuration';
import { AppService } from './services/app.service';

export const { AppModule } = createNestModule({
  moduleName: APP_MODULE,
  moduleCategory: NestModuleCategory.feature,
  imports: [
    SsoModule.forRootAsync({
      imports: [
        WebhookModule.forFeature({ featureModuleName: AUTH_FEATURE }),
        AuthModule.forFeature({ featureModuleName: AUTH_FEATURE }),
      ],
      configurationClass: WebhookWithAuthSsoConfiguration,
    }),
    FilesModule.forRootAsync({
      imports: [SsoModule.forFeature(), MinioModule.forFeature()],
      configurationClass: SsoWithMinioFilesConfiguration,
    }),
    AuthModule.forRootAsync({
      imports: [SsoModule.forFeature()],
      configurationClass: SsoAuthConfiguration,
    }),
    SsoModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    AuthModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    WebhookModule.forFeature({
      featureModuleName: APP_FEATURE,
      featureConfiguration: {
        events: [
          {
            eventName: 'app-demo.create',
            description: getText('Event that will be triggered after creation'),
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          },
          {
            eventName: 'app-demo.update',
            description: getText('Event that will trigger after the update'),
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          },
          {
            eventName: 'app-demo.delete',
            description: getText('Event that will fire after deletion'),
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          },
        ],
      },
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
        join(__dirname, 'assets', 'i18n', 'cv-messages'),
        join(__dirname, 'assets', 'i18n', 'nestjs-mod-prisma-tools'),
        join(__dirname, 'assets', 'i18n', 'nestjs-mod-validation'),
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
        exceptionFactory: (errors) => {
          console.log(errors);
          return new ValidationError(
            ValidationErrorEnum.COMMON,
            undefined,
            errors
          );
        },
      },
      usePipes: true,
      useInterceptors: true,
    }),
    KeyvModule.forFeature({ featureModuleName: APP_FEATURE }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 50,
          ttl: 24 * 60 * 60 * 1000,
        },
      ],
    }),
    ...(process.env.DISABLE_SERVE_STATIC === 'true'
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client-sso', 'browser'),
          }),
        ]),
  ],
  controllers: [AppController, TimeController, FakeEndpointController],
  providers: [
    { provide: APP_GUARD, useClass: SsoGuard },
    { provide: APP_FILTER, useClass: AuthExceptionsFilter },
    { provide: APP_FILTER, useClass: AppExceptionsFilter },
    AppService,
    TimeController,
  ],
});
