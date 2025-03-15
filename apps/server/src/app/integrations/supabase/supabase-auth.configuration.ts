import {
  AuthConfiguration,
  AuthError,
  AuthRequest,
  AuthUser,
} from '@nestjs-mod-fullstack/auth';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthRole } from '@prisma/auth-client';

@Injectable()
export class SupabaseAuthConfiguration implements AuthConfiguration {
  constructor(private readonly supabaseService: SupabaseService) {}

  async checkAccessValidator(
    authUser?: AuthUser | null,
    ctx?: ExecutionContext
  ) {
    const req: AuthRequest = ctx && getRequestFromExecutionContext(ctx);

    if (
      typeof ctx?.getClass === 'function' &&
      typeof ctx?.getHandler === 'function' &&
      ctx?.getClass().name === 'TerminusHealthCheckController' &&
      ctx?.getHandler().name === 'check'
    ) {
      req.skipEmptyAuthUser = true;
    }
  }

  async createAdmin(user: {
    username?: string;
    password: string;
    email: string;
  }): Promise<void | null> {
    const signupUserResult = await this.supabaseService
      .getSupabaseClient()
      .auth.signUp({
        password: user.password,
        email: user.email.toLowerCase(),
        options: {
          data: {
            nickname: user.username,
            roles: [AuthRole.Admin.toLowerCase()],
          },
        },
      });
    if (signupUserResult.error) {
      if (signupUserResult.error.message !== 'User already registered') {
        throw new AuthError(signupUserResult.error.message);
      }
    } else {
      if (!signupUserResult.data?.user) {
        throw new AuthError('Failed to create a user');
      }
      if (!signupUserResult.data.user.email) {
        throw new AuthError('signupUserResult.data.user.email not set');
      }

      if (Object.keys(user).length > 0) {
        const updateUserResult = await this.supabaseService
          .getSupabaseClient()
          .auth.updateUser({
            email: user['email'],
          });

        if (updateUserResult.error) {
          throw new AuthError(updateUserResult.error.message);
        }
      }
    }
  }
}
