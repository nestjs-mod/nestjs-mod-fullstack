import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class PrismaToolsEnvironments {
  @EnvModelProperty({
    description: 'Environment name',
  })
  envName?: string;
}
