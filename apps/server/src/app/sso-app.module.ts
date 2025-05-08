import { AUTH_FEATURE, AuthModule } from '@nestjs-mod-fullstack/auth';
import { FilesModule } from '@nestjs-mod-fullstack/files';
import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-fullstack/validation';
import { WebhookModule } from '@nestjs-mod-fullstack/webhook';
import {
  createNestModule,
  getRequestFromExecutionContext,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PrismaModule } from '@nestjs-mod/prisma';
import { ExecutionContext } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { getText, TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE, APP_MODULE } from './app.constants';
import { AppExceptionsFilter } from './app.filter';
import { AuthorizerController } from './controllers/sso/authorizer.controller';
import { AppController } from './controllers/sso/sso-app.controller';
import { FakeEndpointController } from './controllers/sso/sso-fake-endoint.controller';
import { TimeController } from './controllers/sso/sso-time.controller';
import { SsoAuthConfiguration } from './integrations/sso/sso-auth.configuration';
import { SsoWithMinioFilesConfiguration } from './integrations/sso/sso-with-minio-files.configuration';
import { WebhookWithAuthSsoConfiguration } from './integrations/sso/webhook-with-auth-sso.configuration';
import { AppService } from './services/app.service';
import { SsoModule } from './sso/sso.module';

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
        join(process.cwd(), 'dist', 'apps', 'server', 'assets', 'i18n'),
        join(
          process.cwd(),
          'dist',
          'apps',
          'server',
          'assets',
          'i18n',
          'getText'
        ),
        join(
          process.cwd(),
          'dist',
          'apps',
          'server',
          'assets',
          'i18n',
          'class-validator-messages'
        ),
      ],
      vendorLocalePaths: [
        join(process.cwd(), 'dist', 'apps', 'server', 'assets', 'i18n'),
      ],
      contextRequestDetector: (ctx: ExecutionContext) =>
        getRequestFromExecutionContext(ctx),
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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 50,
          ttl: 24 * 60 * 60 * 1000,
        },
      ],
    }),
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(
              join(process.cwd(), 'dist', 'apps', 'server'),
              '..',
              'client',
              'browser'
            ),
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
    AppService,
    TimeController,
    { provide: APP_FILTER, useClass: AppExceptionsFilter },
  ],
});
