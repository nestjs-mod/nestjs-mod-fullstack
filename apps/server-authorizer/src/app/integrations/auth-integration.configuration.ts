import {
  AuthConfiguration,
  AuthError,
  AuthRequest,
  AuthUser,
} from '@nestjs-mod-fullstack/auth';
import { AuthorizerService } from '@nestjs-mod/authorizer';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthRole } from '@prisma/auth-client';
@Injectable()
export class AuthIntegrationConfiguration implements AuthConfiguration {
  private logger = new Logger(AuthIntegrationConfiguration.name);

  constructor(private readonly authorizerService: AuthorizerService) {}

  extraHeaders = {
    'x-authorizer-url': `http://localhost:${process.env.SERVER_AUTHORIZER_EXTERNAL_CLIENT_PORT}`,
  };

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
    const signupUserResult = await this.authorizerService.signup({
      nickname: user.username,
      password: user.password,
      confirm_password: user.password,
      email: user.email.toLowerCase(),
      roles: [AuthRole.Admin.toLowerCase()],
    });
    if (signupUserResult.errors.length > 0) {
      this.logger.error(
        signupUserResult.errors[0].message,
        signupUserResult.errors[0].stack
      );
      if (
        !signupUserResult.errors[0].message.includes('has already signed up')
      ) {
        throw new AuthError(signupUserResult.errors[0].message);
      }
    } else {
      if (!signupUserResult.data?.user) {
        throw new AuthError('Failed to create a user');
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
      const paramsForUpdate = Object.entries(params)
        .map(([key, value]) =>
          typeof value === 'boolean' ? `${key}: ${value}` : `${key}: "${value}"`
        )
        .join(',');
      const updateUserResult = await this.authorizerService.graphqlQuery({
        query: `mutation {
  _update_user(params: { 
      id: "${externalUserId}", ${paramsForUpdate} }) {
    id
  }
}`,
      });

      if (updateUserResult.errors.length > 0) {
        this.logger.error(
          updateUserResult.errors[0].message,
          updateUserResult.errors[0].stack
        );
        throw new AuthError(updateUserResult.errors[0].message);
      }
    }
  }
}
