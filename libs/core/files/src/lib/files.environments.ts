import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class FilesStaticEnvironments {
  @EnvModelProperty({
    description: 'Default user id',
    default: 'default',
    hidden: true,
  })
  filesDefaultUserId?: string;
}
