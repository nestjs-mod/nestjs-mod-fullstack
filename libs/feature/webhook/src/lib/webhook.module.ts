import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { HttpModule } from '@nestjs/axios';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ApiHeaders } from '@nestjs/swagger';
import { WebhookUsersController } from './controllers/webhook-users.controller';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookServiceBootstrap } from './services/webhook-bootstrap.service';
import { WebhookService } from './services/webhook.service';
import { WebhookConfiguration } from './webhook.configuration';
import { WEBHOOK_FEATURE, WEBHOOK_MODULE } from './webhook.constants';
import { WebhookEnvironments } from './webhook.environments';
import { WebhookExceptionsFilter } from './webhook.filter';
import { WebhookGuard } from './webhook.guard';
import { WebhookToolsService } from './services/webhook-tools.service';

export const { WebhookModule } = createNestModule({
  moduleName: WEBHOOK_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: WebhookEnvironments,
  staticConfigurationModel: WebhookConfiguration,
  imports: [
    HttpModule,
    PrismaModule.forFeature({
      contextName: WEBHOOK_FEATURE,
      featureModuleName: WEBHOOK_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: WEBHOOK_FEATURE,
    }),
  ],
  providers: [WebhookToolsService, WebhookServiceBootstrap],
  controllers: [WebhookUsersController, WebhookController],
  sharedProviders: [WebhookService],
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
  preWrapApplication: async ({ current }) => {
    const staticEnvironments =
      current.staticEnvironments as WebhookEnvironments;
    const staticConfiguration =
      current.staticConfiguration as WebhookConfiguration;

    for (const ctrl of [WebhookController, WebhookUsersController]) {
      if (staticEnvironments.useFilters) {
        UseFilters(WebhookExceptionsFilter)(ctrl);
      }
      if (staticEnvironments.useGuards) {
        UseGuards(WebhookGuard)(ctrl);
      }
      if (
        staticEnvironments.checkHeaders &&
        staticConfiguration.externalUserIdHeaderName &&
        staticConfiguration.externalTenantIdHeaderName
      ) {
        ApiHeaders([
          {
            name: staticConfiguration.externalUserIdHeaderName,
            allowEmptyValue: true,
          },
          {
            name: staticConfiguration.externalTenantIdHeaderName,
            allowEmptyValue: true,
          },
        ])(ctrl);
      }
    }
  },
});
