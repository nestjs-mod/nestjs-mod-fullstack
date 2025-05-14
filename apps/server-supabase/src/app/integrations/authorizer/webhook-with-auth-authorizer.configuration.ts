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
import {
  AuthorizerConfiguration,
  AuthorizerRequest,
  AuthorizerUser,
  CheckAccessOptions,
  defaultAuthorizerCheckAccessValidator,
} from '@nestjs-mod/authorizer';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRole } from '@prisma/auth-client';
import { WebhookRole } from '@prisma/webhook-client';

@Injectable()
export class WebhookWithAuthAuthorizerConfiguration
  implements AuthorizerConfiguration
{
  constructor(
    private readonly webhookUsersService: WebhookUsersService,
    private readonly authStaticEnvironments: AuthStaticEnvironments
  ) {}

  async checkAccessValidator(
    authorizerUser?: AuthorizerUser,
    options?: CheckAccessOptions,
    ctx?: ExecutionContext
  ) {
    const req: WebhookRequest & FilesRequest & AuthRequest & AuthorizerRequest =
      ctx && getRequestFromExecutionContext(ctx);

    if (
      typeof ctx?.getClass === 'function' &&
      typeof ctx?.getHandler === 'function' &&
      ctx?.getClass().name === 'TerminusHealthCheckController' &&
      ctx?.getHandler().name === 'check'
    ) {
      req.skipEmptyAuthUser = true;
      req.skipEmptyAuthorizerUser = true;
      return true;
    }

    const result = await defaultAuthorizerCheckAccessValidator(
      authorizerUser,
      options
    );

    if (req?.authorizerUser?.id) {
      // webhook
      req.webhookUser = await this.webhookUsersService.createUserIfNotExists({
        externalUserId: req?.authorizerUser?.id,
        externalTenantId: req?.authorizerUser?.id,
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
        req.authorizerUser?.email === this.authStaticEnvironments.adminEmail
      ) {
        req.webhookUser.userRole = WebhookRole.Admin;

        req.authorizerUser.roles = [AuthRole.Admin.toLowerCase()];
      }

      // files
      req.filesUser = {
        userRole:
          req.webhookUser?.userRole === WebhookRole.Admin
            ? FilesRole.Admin
            : FilesRole.User,
      };

      if (authorizerUser?.email && authorizerUser?.roles) {
        req.externalUser = {
          email: authorizerUser?.email,
          roles: authorizerUser?.roles,
        };
      }
    }

    if (result) {
      req.skipEmptyAuthUser = true;
      req.skipEmptyAuthorizerUser = true;
      return true;
    }

    if (
      !req.skipEmptyAuthUser &&
      !req.skipEmptyAuthorizerUser &&
      !result &&
      !req.authorizerUser?.id
    ) {
      throw new AuthError(AuthErrorEnum.UNAUTHORIZED);
    }

    return result;
  }
}
