import {
  ConfigModel,
  ConfigModelProperty,
  getRequestFromExecutionContext,
} from '@nestjs-mod/common';
import { ExecutionContext } from '@nestjs/common';
import {
  CheckAccessOptions,
  SupabaseRequest,
  SupabaseUser,
} from './supabase.types';

export const defaultSupabaseCheckAccessValidator = async (
  supabaseUser?: SupabaseUser,
  options?: CheckAccessOptions
) => {
  return Boolean(
    supabaseUser?.role && options?.roles?.includes(supabaseUser?.role)
  );
};

export const defaultSupabaseGetSupabaseUserFromExternalUserId = (
  externalUserId: string
) => ({
  id: externalUserId,
});

@ConfigModel()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SupabaseConfiguration {
  @ConfigModelProperty({
    description: 'Extra headers',
  })
  extraHeaders?: Record<string, string> | undefined;

  @ConfigModelProperty({
    description: 'Function for resolve request from execution context',
    default: getRequestFromExecutionContext,
  })
  getRequestFromContext?: (ctx: ExecutionContext) => SupabaseRequest;

  @ConfigModelProperty({
    description: 'External function for validate permissions',
    default: defaultSupabaseCheckAccessValidator,
  })
  checkAccessValidator?: (
    supabaseUser?: SupabaseUser,
    options?: CheckAccessOptions,
    ctx?: ExecutionContext
  ) => Promise<boolean>;

  @ConfigModelProperty({
    description:
      'A header for searching for an external user ID, if you have logged in previously and do not need to log in again in the authorization service, can be used during testing.',
    default: 'x-external-user-id',
  })
  externalUserIdHeaderName?: string;

  @ConfigModelProperty({
    description:
      'Header for searching for external application identifiers, if you have logged in previously and do not need to log in again in the authorization service, these identifiers must be private and can be used for testing.',
    default: 'x-external-app-id',
  })
  externalAppIdHeaderName?: string;

  @ConfigModelProperty({
    description: 'Function for resolve supabase user by externalUserId',
    default: defaultSupabaseGetSupabaseUserFromExternalUserId,
  })
  getSupabaseUserFromExternalUserId?: (
    externalUserId: string,
    externalAppId?: string,
    ctx?: ExecutionContext
  ) => Promise<SupabaseUser>;
}
