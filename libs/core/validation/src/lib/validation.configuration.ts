import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { ValidationPipeOptions } from '@nestjs/common';

@ConfigModel()
export class ValidationConfiguration {
  @ConfigModelProperty({
    description: 'Validation pipe options',
  })
  pipeOptions?: ValidationPipeOptions;
}
