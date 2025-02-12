import { Test, TestingModule } from '@nestjs/testing';

import { WEBHOOK_FEATURE, WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { FakePrismaClient, PrismaModule } from '@nestjs-mod/prisma';
import { APP_FEATURE } from '../app.constants';
import { AppService } from '../services/app.service';
import { AppController } from './supabase-app.controller';
import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-fullstack/validation';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { ExecutionContext } from '@nestjs/common';
import { TranslatesModule } from 'nestjs-translates';
import { join } from 'path';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TranslatesModule.forRootDefault({
          localePaths: [
            join(__dirname, '../..', 'assets', 'i18n'),
            join(__dirname, '../..', 'assets', 'i18n', 'getText'),
            join(
              __dirname,
              '../..',
              'assets',
              'i18n',
              'class-validator-messages'
            ),
          ],
          vendorLocalePaths: [join(__dirname, '../..', 'assets', 'i18n')],
          contextRequestDetector: (ctx: ExecutionContext) =>
            getRequestFromExecutionContext(ctx),
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
              new ValidationError(
                ValidationErrorEnum.COMMON,
                undefined,
                errors
              ),
          },
          usePipes: true,
          useInterceptors: true,
        }),
        WebhookModule.forFeature({
          featureModuleName: APP_FEATURE,
        }),
        PrismaModule.forRoot({
          contextName: APP_FEATURE,
          environments: { databaseUrl: 'fake' },
          staticConfiguration: {
            featureName: APP_FEATURE,
            prismaModule: { PrismaClient: FakePrismaClient },
          },
        }),
        PrismaModule.forRoot({
          contextName: WEBHOOK_FEATURE,
          environments: { databaseUrl: 'fake' },
          staticConfiguration: {
            featureName: APP_FEATURE,
            prismaModule: { PrismaClient: FakePrismaClient },
          },
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData((word) => word)).toEqual({
        message: 'Hello API',
      });
    });
  });
});
