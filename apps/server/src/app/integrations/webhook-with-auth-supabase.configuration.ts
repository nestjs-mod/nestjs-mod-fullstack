import {
  AUTH_ADMIN_ROLE,
  AuthEnvironments,
  AuthError,
  AuthErrorEnum,
  AuthRequest,
} from '@nestjs-mod-fullstack/auth';
import { FilesRequest, FilesRole } from '@nestjs-mod-fullstack/files';
import {
  WebhookRequest,
  WebhookUsersService,
} from '@nestjs-mod-fullstack/webhook';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  SupabaseConfiguration,
  defaultSupabaseCheckAccessValidator,
} from '../supabase/supabase.configuration';
import {
  CheckAccessOptions,
  SupabaseRequest,
  SupabaseUser,
} from '../supabase/supabase.types';

@Injectable()
export class WebhookWithAuthSupabaseConfiguration
  implements SupabaseConfiguration
{
  constructor(
    private readonly webhookUsersService: WebhookUsersService,
    private readonly authEnvironments: AuthEnvironments
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
        userRole: req.authUser?.userRole === 'Admin' ? 'Admin' : 'User',
      });

      if (req.authUser?.userRole === 'Admin') {
        req.webhookUser.userRole = 'Admin';
      }

      if (req.webhookUser) {
        req.externalTenantId = req.webhookUser.externalTenantId;
      }

      if (
        this.authEnvironments.adminEmail &&
        req.supabaseUser?.email === this.authEnvironments.adminEmail
      ) {
        req.webhookUser.userRole = 'Admin';

        req.supabaseUser.role = AUTH_ADMIN_ROLE;
      }

      // files
      req.filesUser = {
        userRole:
          req.webhookUser?.userRole === 'Admin'
            ? FilesRole.Admin
            : FilesRole.User,
      };

      if (supabaseUser?.email && supabaseUser?.role) {
        req.externalUser = {
          email: supabaseUser?.email,
          role: supabaseUser?.role,
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
