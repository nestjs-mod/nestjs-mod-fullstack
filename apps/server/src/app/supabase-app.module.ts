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
import { ServeStaticModule } from '@nestjs/serve-static';
import { getText, TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE, APP_MODULE } from './app.constants';
import { AuthorizerController } from './controllers/supabase/authorizer.controller';
import { AppController } from './controllers/supabase/supabase-app.controller';
import { FakeEndpointController } from './controllers/supabase/supabase-fake-endoint.controller';
import { TimeController } from './controllers/supabase/supabase-time.controller';
import { SupabaseAuthConfiguration } from './integrations/supabase/supabase-auth.configuration';
import { SupabaseWithMinioFilesConfiguration } from './integrations/supabase/supabase-with-minio-files.configuration';
import { WebhookWithAuthSupabaseConfiguration } from './integrations/supabase/webhook-with-auth-supabase.configuration';
import { AppService } from './services/app.service';
import { SupabaseModule } from './supabase/supabase.module';

export const { AppModule: SupabaseAppModule } = createNestModule({
  moduleName: APP_MODULE,
  moduleCategory: NestModuleCategory.feature,
  imports: [
    SupabaseModule.forRootAsync({
      imports: [
        WebhookModule.forFeature({ featureModuleName: AUTH_FEATURE }),
        AuthModule.forFeature({ featureModuleName: AUTH_FEATURE }),
      ],
      configurationClass: WebhookWithAuthSupabaseConfiguration,
    }),
    FilesModule.forRootAsync({
      imports: [SupabaseModule.forFeature(), MinioModule.forFeature()],
      configurationClass: SupabaseWithMinioFilesConfiguration,
    }),
    AuthModule.forRootAsync({
      imports: [SupabaseModule.forFeature()],
      configurationClass: SupabaseAuthConfiguration,
    }),
    SupabaseModule.forFeature({
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
  providers: [AppService, TimeController],
});
