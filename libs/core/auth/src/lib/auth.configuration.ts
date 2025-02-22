import {
  ConfigModel,
  ConfigModelProperty,
  getRequestFromExecutionContext,
} from '@nestjs-mod/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthUser } from './generated/rest/dto/auth-user.entity';
import { AuthRequest } from './types/auth-request';

@ConfigModel()
export class AuthConfiguration {
  @ConfigModelProperty({
    description: 'Function for create default admin.',
  })
  createAdmin!: (user: {
    username?: string;
    password: string;
    email: string;
  }) => Promise<void | null>;

  @ConfigModelProperty({
    description: 'Function for resolve request from execution context',
    default: getRequestFromExecutionContext,
  })
  getRequestFromContext?: (ctx: ExecutionContext) => AuthRequest;

  @ConfigModelProperty({
    description: 'External function for validate permissions',
  })
  checkAccessValidator?: (
    authUser?: AuthUser | null,
    ctx?: ExecutionContext
  ) => Promise<void>;
}
