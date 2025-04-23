import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { HttpModule } from '@nestjs/axios';
import { UseGuards } from '@nestjs/common';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookServiceBootstrap } from './services/webhook-bootstrap.service';
import { WebhookToolsService } from './services/webhook-tools.service';
import { WebhookUsersService } from './services/webhook-users.service';
import { WebhookService } from './services/webhook.service';
import {
  WebhookConfiguration,
  WebhookFeatureConfiguration,
} from './webhook.configuration';
import { WEBHOOK_FEATURE, WEBHOOK_MODULE } from './webhook.constants';
import { WebhookStaticEnvironments } from './webhook.environments';
import { WebhookExceptionsFilter } from './webhook.filter';
import { WebhookGuard } from './webhook.guard';

import { KeyvModule } from '@nestjs-mod/keyv';
import { APP_FILTER } from '@nestjs/core';
import { TranslatesModule } from 'nestjs-translates';
import { WebhookLogsController } from './controllers/webhook-logs.controller';
import { WebhookCacheService } from './services/webhook-cache.service';

export const { WebhookModule } = createNestModule({
  moduleName: WEBHOOK_MODULE,
  moduleCategory: NestModuleCategory.core,
  staticEnvironmentsModel: WebhookStaticEnvironments,
  featureConfigurationModel: WebhookFeatureConfiguration,
  configurationModel: WebhookConfiguration,
  imports: [
    HttpModule,
    PrismaModule.forFeature({
      contextName: WEBHOOK_FEATURE,
      featureModuleName: WEBHOOK_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: WEBHOOK_FEATURE,
    }),
    KeyvModule.forFeature({
      featureModuleName: WEBHOOK_FEATURE,
    }),
    TranslatesModule,
  ],
  sharedImports: [
    HttpModule,
    PrismaModule.forFeature({
      contextName: WEBHOOK_FEATURE,
      featureModuleName: WEBHOOK_FEATURE,
    }),
  ],
  providers: (asyncModuleOptions) => [
    WebhookToolsService,
    WebhookServiceBootstrap,
    WebhookCacheService,
    ...(asyncModuleOptions.staticEnvironments.useFilters
      ? [{ provide: APP_FILTER, useClass: WebhookExceptionsFilter }]
      : []),
  ],
  controllers: (asyncModuleOptions) =>
    [WebhookLogsController, WebhookController].map((ctrl) => {
      if (asyncModuleOptions.staticEnvironments?.useGuards) {
        UseGuards(WebhookGuard)(ctrl);
      }
      return ctrl;
    }),
  sharedProviders: [WebhookService, WebhookUsersService],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass =
      getFeatureDotEnvPropertyNameFormatter(WEBHOOK_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: WEBHOOK_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
