import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class WebhookEnvironments {
  @EnvModelProperty({
    description: 'Environment name',
  })
  envName?: string;
}
