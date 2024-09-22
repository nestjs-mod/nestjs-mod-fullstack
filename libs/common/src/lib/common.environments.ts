import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class CommonEnvironments {
  @EnvModelProperty({
    description: 'Environment name',
  })
  envName?: string;
}
