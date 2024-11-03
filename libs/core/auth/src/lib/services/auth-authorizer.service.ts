import { AuthorizerRequest, AuthorizerService } from '@nestjs-mod/authorizer';
import { Injectable, Logger } from '@nestjs/common';
import { AuthError } from '../auth.errors';

@Injectable()
export class AuthAuthorizerService {
  private logger = new Logger(AuthAuthorizerService.name);

  constructor(private readonly authorizerService: AuthorizerService) {}

  authorizerClientID() {
    return this.authorizerService.config.clientID;
  }

  async validateUserPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const result = await this.authorizerService.login({
      email,
      password,
    });

    if (result.errors.length > 0) {
      this.logger.error(result.errors[0].message, result.errors[0].stack);
      throw new AuthError(result.errors[0].message);
    }

    return true;
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

  async revokeAccess(externalUserId: string) {
    const revokeAccessResult = await this.authorizerService.graphqlQuery({
      query: `mutation {
  _revoke_access(param: { user_id: "${externalUserId}" }) {
    message
  }
}`,
    });
    if (revokeAccessResult.errors.length > 0) {
      this.logger.error(
        revokeAccessResult.errors[0].message,
        revokeAccessResult.errors[0].stack
      );
      throw new AuthError(revokeAccessResult.errors[0].message);
    }
  }

  async enableAccess(externalUserId: string) {
    const _enableAccessUserResult = await this.authorizerService.graphqlQuery({
      query: `mutation {
_enable_access(param: { user_id: "${externalUserId}" }) {
message
}
}`,
    });
    if (_enableAccessUserResult.errors.length > 0) {
      this.logger.error(
        _enableAccessUserResult.errors[0].message,
        _enableAccessUserResult.errors[0].stack
      );
      throw new AuthError(_enableAccessUserResult.errors[0].message);
    }
  }

  async getUserByExternalUserId(externalUserId: string) {
    const result = await this.authorizerService.graphqlQuery({
      query: `query {
        _user(params: {
    id: "${externalUserId}"
  }) {
    id
    email
    given_name
    family_name
    roles
    middle_name
    nickname
    phone_number
    app_data
  }
}`,
    });
    if (result.errors.length > 0) {
      this.logger.error(result.errors[0].message, result.errors[0].stack);
      throw new AuthError(result.errors[0].message);
    }
    return result.data?._user;
  }

  async createAdmin(user: {
    username?: string;
    password: string;
    email: string;
  }) {
    const signupUserResult = await this.authorizerService.signup({
      nickname: user.username,
      password: user.password,
      confirm_password: user.password,
      email: user.email.toLowerCase(),
      roles: ['admin'],
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

  async signup(user: {
    username?: string;
    password: string;
    email?: string;
    companyId: string;
    departmentId?: string;
    externalCreatedBy?: string | null;
    computerSessionId?: string;
  }) {
    const signupUserResult = await this.authorizerService.signup({
      nickname: user.username,
      password: user.password,
      confirm_password: user.password,
      email: user.email?.toLowerCase(),
      app_data: {
        companyId: user.companyId,
        departmentId: user.departmentId,
        externalCreatedBy: user.externalCreatedBy,
        ...(user.externalCreatedBy ? { isEmployee: true } : {}),
        ...(user.computerSessionId
          ? { computerSessionId: user.computerSessionId }
          : {}),
      },
    });
    if (signupUserResult.errors.length > 0) {
      this.logger.error(
        signupUserResult.errors[0].message,
        signupUserResult.errors[0].stack
      );
      throw new AuthError(signupUserResult.errors[0].message);
    }
    if (!signupUserResult.data?.user) {
      throw new AuthError('Failed to create a user');
    }
    return signupUserResult.data;
  }

  async logout(req: AuthorizerRequest) {
    await this.authorizerService.logout(req.headers);
  }
}
