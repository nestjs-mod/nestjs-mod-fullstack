import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class TestingEnvironments {
  @EnvModelProperty({
    description: 'Environment name',
  })
  envName?: string;
}
