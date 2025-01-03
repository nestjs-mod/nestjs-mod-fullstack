import { AuthorizerRequest } from '@nestjs-mod/authorizer';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';

export type AuthRequest = {
  authUser?: AuthUser | null;
  headers: Record<string, string>;
} & AuthorizerRequest;
