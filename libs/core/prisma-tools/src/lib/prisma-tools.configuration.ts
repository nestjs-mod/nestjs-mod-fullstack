import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class PrismaToolsConfiguration {
  @ConfigModelProperty({
    description: 'Config options name',
  })
  optionsName?: string;
}
