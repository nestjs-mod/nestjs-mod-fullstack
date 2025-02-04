import { AUTH_FEATURE, AuthModule } from '@nestjs-mod-fullstack/auth';
import { FilesModule } from '@nestjs-mod-fullstack/files';
import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-fullstack/validation';
import { WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE, APP_MODULE } from './app.constants';
import { AppController } from './controllers/supabase-app.controller';
import { FakeEndpointController } from './controllers/supabase-fake-endoint.controller';
import { TimeController } from './controllers/supabase-time.controller';
import { SupabaseAuthConfiguration } from './integrations/supabase-auth.configuration';
import { SupabaseWithMinioFilesConfiguration } from './integrations/supabase-with-minio-files.configuration';
import { WebhookWithAuthSupabaseConfiguration } from './integrations/webhook-with-auth-supabase.configuration';
import { AppService } from './services/app.service';
import { SupabaseModule } from './supabase/supabase.module';

export const { AppModule } = createNestModule({
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
        validatorPackage: require('class-validator'),
        transformerPackage: require('class-transformer'),
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
  controllers: [AppController, TimeController, FakeEndpointController],
  providers: [AppService, TimeController, FakeEndpointController],
});
