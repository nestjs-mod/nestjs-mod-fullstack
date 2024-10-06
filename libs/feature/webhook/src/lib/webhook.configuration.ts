import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { WebhookEvent } from './types/webhook-event-object';

@ConfigModel()
export class WebhookConfiguration {
  @ConfigModelProperty({
    description: 'List of available events.',
  })
  events!: WebhookEvent[];

  @ConfigModelProperty({
    description: 'The name of the header key that stores the external user ID.',
    default: 'x-external-user-id',
  })
  externalUserIdHeaderName?: string;

  @ConfigModelProperty({
    description:
      'The name of the header key that stores the external tenant ID.',
    default: 'x-external-tenant-id',
  })
  externalTenantIdHeaderName?: string;
}
