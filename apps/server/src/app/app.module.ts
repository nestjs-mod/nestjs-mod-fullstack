import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-fullstack/validation';
import { WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeController } from './time.controller';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    WebhookModule.forFeature({
      featureModuleName: 'app',
    }),
    PrismaModule.forFeature({
      contextName: 'app',
      featureModuleName: 'app',
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
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'browser'),
          }),
        ]),
  ],
  controllers: [AppController, TimeController],
  providers: [AppService, TimeController],
});
