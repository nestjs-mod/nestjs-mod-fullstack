import {
  AuthConfiguration,
  AuthError,
  AuthRequest,
  AuthUser,
} from '@nestjs-mod-fullstack/auth';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { SsoErrorEnum } from '@nestjs-mod/sso-rest-sdk';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthRole } from '@prisma/auth-client';
import { isAxiosError } from 'axios';
import { SsoService } from '../../sso/sso.service';

@Injectable()
export class SsoAuthConfiguration implements AuthConfiguration {
  private logger = new Logger(SsoAuthConfiguration.name);

  constructor(private readonly ssoService: SsoService) {}

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
    try {
      const signupUserResult = await this.ssoService
        .getSsoClient()
        .getSsoApi()
        .ssoControllerSignUp({
          username: user.username,
          password: user.password,
          confirmPassword: user.password,
          email: user.email.toLowerCase(),
          fingerprint: user.username || 'fingerprint',
        });
      await this.ssoService
        .getSsoClient(true)
        .getSsoApi()
        .ssoUsersControllerUpdateOne(signupUserResult.data.user.id, {
          roles: AuthRole.Admin.toLowerCase(),
        });

      await this.verifyUser({
        externalUserId: signupUserResult.data.user.id,
        email: signupUserResult.data.user.email,
      });

      this.logger.debug(
        `Admin with email: ${signupUserResult.data.user.email} successfully created!`
      );
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.data?.code !== SsoErrorEnum.Sso011) {
          this.logger.debug(err, err.stack);
          throw new AuthError('Failed to create a user');
        }
      }
    }
  }

  async verifyUser({
    externalUserId,
    email,
  }: {
    externalUserId: string;
    email: string;
  }) {
    await this.ssoService
      .getSsoClient(true)
      .getSsoApi()
      .ssoUsersControllerUpdateOne(externalUserId, {
        emailVerifiedAt: new Date().toISOString(),
        email,
      });
    return this;
  }
}
