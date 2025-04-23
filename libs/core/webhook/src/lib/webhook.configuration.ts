import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { WebhookEvent } from './types/webhook-event';

@ConfigModel()
export class WebhookConfiguration {
  @ConfigModelProperty({
    description: 'List of available events',
  })
  events?: WebhookEvent[];

  @ConfigModelProperty({
    description: 'TTL for cached data',
    default: 15_000,
  })
  cacheTTL?: number;

  @ConfigModelProperty({
    description:
      'When we run an application in a serverless environment, our background tasks do not have time to complete, to disable background tasks and process requests on demand, we need to switch this property to true',
    default: false,
  })
  syncMode?: boolean;
}

@ConfigModel()
export class WebhookFeatureConfiguration {
  @ConfigModelProperty({
    description: 'List of available events',
  })
  events?: WebhookEvent[];
}
