import { SupabaseService } from '@nestjs-mod-fullstack/common';
import { Injectable, Logger } from '@nestjs/common';
import { AuthError } from '../auth.errors';

@Injectable()
export class AuthAuthorizerService {
  private logger = new Logger(AuthAuthorizerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  authorizerClientID() {
    return 'empty';
  }

  async createAdmin(user: {
    username?: string;
    password: string;
    email: string;
  }) {
    const signupUserResult = await this.supabaseService
      .getSupabaseClient()
      .auth.signUp({
        password: user.password,
        email: user.email.toLowerCase(),
        options: {
          data: {
            nickname: user.username,
            roles: ['admin'],
          },
        },
      });
    if (signupUserResult.error) {
      if (signupUserResult.error.message !== 'User already registered') {
        this.logger.error(
          signupUserResult.error.message,
          signupUserResult.error.stack
        );
        throw new AuthError(signupUserResult.error.message);
      }
    } else {
      if (!signupUserResult.data?.user) {
        throw new AuthError('Failed to create a user');
      }
      if (!signupUserResult.data.user.email) {
        throw new AuthError('signupUserResult.data.user.email not set');
      }

      await this.verifyUser({
        externalUserId: signupUserResult.data.user.id,
        email: signupUserResult.data.user.email,
      });

      this.logger.debug(
        `Admin with email: ${signupUserResult.data.user.email} successfully created!`
      );
    }
  }

  async verifyUser({
    externalUserId,
    email,
  }: {
    externalUserId: string;
    email: string;
  }) {
    await this.updateUser(externalUserId, { email_verified: true, email });
    return this;
  }

  async updateUser(
    externalUserId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Partial<Record<string, any>>
  ) {
    if (Object.keys(params).length > 0) {
      const updateUserResult = await this.supabaseService
        .getSupabaseClient()
        .auth.updateUser({
          email: params['email'],
        });

      if (updateUserResult.error) {
        this.logger.error(
          updateUserResult.error.message,
          updateUserResult.error.stack
        );
        throw new AuthError(updateUserResult.error.message);
      }
    }
  }
}
