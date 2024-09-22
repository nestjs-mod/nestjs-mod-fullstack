import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class WebhookConfiguration {
  @ConfigModelProperty({
    description: 'Config options name',
  })
  optionsName?: string;
}
