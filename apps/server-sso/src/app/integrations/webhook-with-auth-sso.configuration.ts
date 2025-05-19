import {
  AuthError,
  AuthErrorEnum,
  AuthRequest,
  AuthStaticEnvironments,
} from '@nestjs-mod-fullstack/auth';
import { FilesRequest, FilesRole } from '@nestjs-mod-fullstack/files';
import {
  WebhookRequest,
  WebhookUsersService,
} from '@nestjs-mod-fullstack/webhook';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { splitIn } from '@nestjs-mod/misc';
import {
  CheckAccessOptions,
  SsoConfiguration,
  SsoRequest,
  defaultSsoCheckAccessValidator,
} from '@nestjs-mod/sso';
import { SsoUserDto } from '@nestjs-mod/sso-rest-sdk';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRole } from '@prisma/auth-client';
import { WebhookRole } from '@prisma/webhook-client';

@Injectable()
export class WebhookWithAuthSsoConfiguration implements SsoConfiguration {
  constructor(
    private readonly webhookUsersService: WebhookUsersService,
    private readonly authStaticEnvironments: AuthStaticEnvironments
  ) {}

  async checkAccessValidator(
    ssoUser?: SsoUserDto,
    options?: CheckAccessOptions,
    ctx?: ExecutionContext
  ) {
    const req: WebhookRequest & FilesRequest & AuthRequest & SsoRequest =
      ctx && getRequestFromExecutionContext(ctx);

    if (
      typeof ctx?.getClass === 'function' &&
      typeof ctx?.getHandler === 'function' &&
      ctx?.getClass().name === 'TerminusHealthCheckController' &&
      ctx?.getHandler().name === 'check'
    ) {
      req.skipEmptyAuthUser = true;
      req.skipEmptySsoUser = true;
      return true;
    }

    const result = await defaultSsoCheckAccessValidator(ssoUser, options);

    if (req?.ssoUser?.id) {
      // webhook
      req.webhookUser = await this.webhookUsersService.createUserIfNotExists({
        externalUserId: req?.ssoUser?.id,
        externalTenantId: req?.ssoUser?.id,
        userRole:
          req.authUser?.userRole === AuthRole.Admin
            ? WebhookRole.Admin
            : WebhookRole.User,
      });
      if (req.authUser?.userRole === AuthRole.Admin) {
        req.webhookUser.userRole = WebhookRole.Admin;
      }

      if (req.webhookUser) {
        req.externalTenantId = req.webhookUser.externalTenantId;
      }

      if (
        this.authStaticEnvironments.adminEmail &&
        req.ssoUser?.email === this.authStaticEnvironments.adminEmail
      ) {
        req.webhookUser.userRole = WebhookRole.Admin;

        req.ssoUser.roles = AuthRole.Admin.toLowerCase();
      }

      // files
      req.filesUser = {
        userRole:
          req.webhookUser?.userRole === WebhookRole.Admin
            ? FilesRole.Admin
            : FilesRole.User,
      };

      if (ssoUser?.email && ssoUser?.roles) {
        req.externalUser = {
          email: ssoUser?.email,
          roles: splitIn(ssoUser?.roles),
        };
      }
    }

    if (result) {
      req.skipEmptyAuthUser = true;
      req.skipEmptySsoUser = true;
      return true;
    }

    if (
      !req.skipEmptyAuthUser &&
      !req.skipEmptySsoUser &&
      !result &&
      !req.ssoUser?.id
    ) {
      throw new AuthError(AuthErrorEnum.UNAUTHORIZED);
    }

    return result;
  }
}
