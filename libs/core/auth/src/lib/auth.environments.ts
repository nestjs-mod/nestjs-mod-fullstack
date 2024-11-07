import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class AuthEnvironments {
  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin@example.com',
  })
  adminEmail?: string;

  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin',
  })
  @IsNotEmpty()
  adminUsername?: string;

  @EnvModelProperty({
    description: 'Global admin password',
  })
  adminPassword?: string;
}
