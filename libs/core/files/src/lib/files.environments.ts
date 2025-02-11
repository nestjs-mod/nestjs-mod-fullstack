import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class FilesEnvironments {
  @EnvModelProperty({
    description: 'Default user id',
    default: 'default',
    hidden: true,
  })
  minioDefaultUserId?: string;
}
