import { ExecutionContext } from '@nestjs/common';
import {
  CheckAccessOptions,
  SupabaseRequest,
  SupabaseUser,
} from './supabase.types';
export declare const defaultSupabaseCheckAccessValidator: (
  supabaseUser?: SupabaseUser,
  options?: CheckAccessOptions
) => Promise<boolean>;
export declare const defaultSupabaseGetSupabaseUserFromExternalUserId: (
  externalUserId: string
) => {
  id: string;
};
export declare class SupabaseConfiguration {
  extraHeaders?: Record<string, string> | undefined;
  getRequestFromContext?: (ctx: ExecutionContext) => SupabaseRequest;
  checkAccessValidator?: (
    supabaseUser?: SupabaseUser,
    options?: CheckAccessOptions,
    ctx?: ExecutionContext
  ) => Promise<boolean>;
  externalUserIdHeaderName?: string;
  externalAppIdHeaderName?: string;
  getSupabaseUserFromExternalUserId?: (
    externalUserId: string,
    externalAppId?: string,
    ctx?: ExecutionContext
  ) => Promise<SupabaseUser>;
}
