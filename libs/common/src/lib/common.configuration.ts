import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class CommonConfiguration {
  @ConfigModelProperty({
    description: 'Config options name',
  })
  optionsName?: string;
}
