import { Test, TestingModule } from '@nestjs/testing';

import { WEBHOOK_FEATURE, WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { FakePrismaClient, PrismaModule } from '@nestjs-mod/prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  const appFeatureName = 'app';
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        WebhookModule.forFeature({
          featureModuleName: 'app',
        }),
        PrismaModule.forRoot({
          contextName: 'app',
          environments: { databaseUrl: 'fake' },
          staticConfiguration: {
            featureName: appFeatureName,
            prismaModule: { PrismaClient: FakePrismaClient },
          },
        }),
        PrismaModule.forRoot({
          contextName: WEBHOOK_FEATURE,
          environments: { databaseUrl: 'fake' },
          staticConfiguration: {
            featureName: appFeatureName,
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
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
