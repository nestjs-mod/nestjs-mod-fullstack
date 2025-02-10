import { Test, TestingModule } from '@nestjs/testing';

import { WEBHOOK_FEATURE, WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { FakePrismaClient, PrismaModule } from '@nestjs-mod/prisma';
import { APP_FEATURE } from '../app.constants';
import { AppService } from '../services/app.service';
import { AppController } from './authorizer-app.controller';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
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
