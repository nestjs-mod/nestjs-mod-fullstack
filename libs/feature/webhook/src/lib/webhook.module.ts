import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { WebhookConfiguration } from './webhook.configuration';
import { WebhookEnvironments } from './webhook.environments';
import { WEBHOOK_MODULE } from './webhook.constants';

export const { WebhookModule } = createNestModule({
  moduleName: WEBHOOK_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: WebhookConfiguration,
  environmentsModel: WebhookEnvironments,
  controllers: [],
  sharedProviders: [],
});
