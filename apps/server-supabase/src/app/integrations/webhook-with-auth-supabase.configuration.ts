import {
  AuthError,
  AuthErrorEnum,
  AuthRequest,
  AuthRole,
  AuthStaticEnvironments,
} from '@nestjs-mod-fullstack/auth';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { FilesRequest, FilesRole } from '@nestjs-mod/files';
import { splitIn } from '@nestjs-mod/misc';
import {
  CheckAccessOptions,
  SupabaseConfiguration,
  SupabaseRequest,
  SupabaseUser,
  defaultSupabaseCheckAccessValidator,
} from '@nestjs-mod/supabase';
import {
  WebhookRequest,
  WebhookRole,
  WebhookUsersService,
} from '@nestjs-mod/webhook';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WebhookWithAuthSupabaseConfiguration
  implements SupabaseConfiguration
{
  constructor(
    private readonly webhookUsersService: WebhookUsersService,
    private readonly authStaticEnvironments: AuthStaticEnvironments
  ) {}

  async checkAccessValidator(
    supabaseUser?: SupabaseUser,
    options?: CheckAccessOptions,
    ctx?: ExecutionContext
  ) {
    const req: WebhookRequest & FilesRequest & AuthRequest & SupabaseRequest =
      ctx && getRequestFromExecutionContext(ctx);

    if (
      typeof ctx?.getClass === 'function' &&
      typeof ctx?.getHandler === 'function' &&
      ctx?.getClass().name === 'TerminusHealthCheckController' &&
      ctx?.getHandler().name === 'check'
    ) {
      req.skipEmptyAuthUser = true;
      req.skipEmptySupabaseUser = true;
      return true;
    }

    const result = await defaultSupabaseCheckAccessValidator(
      supabaseUser,
      options
    );

    if (req?.supabaseUser?.id) {
      // webhook
      req.webhookUser = await this.webhookUsersService.createUserIfNotExists({
        externalUserId: req?.supabaseUser?.id,
        externalTenantId: req?.supabaseUser?.id,
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
        req.supabaseUser?.email === this.authStaticEnvironments.adminEmail
      ) {
        req.webhookUser.userRole = WebhookRole.Admin;

        req.supabaseUser.role = AuthRole.Admin.toLowerCase();
      }

      // files
      req.filesUser = {
        userRole:
          req.webhookUser?.userRole === WebhookRole.Admin
            ? FilesRole.Admin
            : FilesRole.User,
      };

      if (supabaseUser?.email && supabaseUser?.role) {
        req.externalUser = {
          email: supabaseUser?.email,
          roles: splitIn(supabaseUser?.role),
        };
      }
    }

    if (result) {
      req.skipEmptyAuthUser = true;
      req.skipEmptySupabaseUser = true;
      return true;
    }

    if (
      !req.skipEmptyAuthUser &&
      !req.skipEmptySupabaseUser &&
      !result &&
      !req.supabaseUser?.id
    ) {
      throw new AuthError(AuthErrorEnum.UNAUTHORIZED);
    }

    return result;
  }
}
