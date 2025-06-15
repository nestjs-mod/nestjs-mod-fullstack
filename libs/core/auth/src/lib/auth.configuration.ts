import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthUser } from './generated/rest/dto/auth-user.entity';

@ConfigModel()
export class AuthConfiguration {
  @ConfigModelProperty({
    description: 'Function for create default admin',
  })
  createAdmin!: (user: {
    username?: string;
    password: string;
    email: string;
  }) => Promise<void | null>;

  @ConfigModelProperty({
    description: 'External function for validate permissions',
  })
  checkAccessValidator?: (
    authUser?: AuthUser | null,
    ctx?: ExecutionContext,
  ) => Promise<void>;
}
