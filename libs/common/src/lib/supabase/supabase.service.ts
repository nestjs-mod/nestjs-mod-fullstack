import {
  AllowEmptyUser,
  AuthorizerConfiguration,
  AuthorizerEnvironments,
  AuthorizerError,
  AuthorizerUser,
  CheckAccess,
} from '@nestjs-mod/authorizer';
import {
  ExecutionContext,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseEnvironments } from './supabase.environments';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private logger = new Logger(SupabaseService.name);
  private supabaseClient!: SupabaseClient;

  constructor(
    private readonly reflector: Reflector,
    private readonly authorizerConfiguration: AuthorizerConfiguration,
    private readonly authorizerEnvironments: AuthorizerEnvironments,
    private readonly supabaseEnvironments: SupabaseEnvironments
  ) {}

  onModuleInit() {
    this.supabaseClient = new SupabaseClient(
      this.supabaseEnvironments.supabaseURL,
      this.supabaseEnvironments.supabaseKey
    );
  }

  getSupabaseClient() {
    return this.supabaseClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserFromRequest(
    ctx: ExecutionContext,
    checkAccess = true
  ): Promise<AuthorizerUser | undefined> {
    const req = this.authorizerConfiguration.getRequestFromContext?.(ctx) || {};

    const allowEmptyUserMetadata =
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(AllowEmptyUser, ctx.getHandler())) ||
      (typeof ctx.getClass === 'function' &&
        this.reflector.get(AllowEmptyUser, ctx.getClass())) ||
      undefined;

    const checkAccessMetadata =
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(CheckAccess, ctx.getHandler())) ||
      (typeof ctx.getClass === 'function' &&
        this.reflector.get(CheckAccess, ctx.getClass())) ||
      undefined;

    if (!req.authorizerUser?.id) {
      const token = req.headers?.authorization?.split(' ')[1];

      if (token) {
        // check user in authorizer
        try {
          const getProfileResult = await this.supabaseClient.auth.getUser(
            token
          );
          if (!getProfileResult.error) {
            req.authorizerUser = {
              email: getProfileResult.data.user.email,
              email_verified: true,
              id: getProfileResult.data.user.id,
              preferred_username: 'empty',
              signup_methods: 'empty',
              created_at: +new Date(getProfileResult.data.user.created_at),
              updated_at: getProfileResult.data.user.updated_at
                ? +new Date(getProfileResult.data.user.updated_at)
                : 0,
              roles: ['user'],
              picture: getProfileResult.data.user.user_metadata['picture'],
            };
          } else {
            this.logger.error(
              getProfileResult.error.message,
              getProfileResult.error.stack
            );
            throw new AuthorizerError(getProfileResult.error.message);
          }
        } catch (err) {
          req.authorizerUser = { id: undefined };
        }
      }

      // check external user id
      if (!req.authorizerUser) {
        req.externalUserId =
          req?.headers?.[
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.authorizerConfiguration.externalUserIdHeaderName!
          ];
        req.externalAppId =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          req?.headers?.[this.authorizerConfiguration.externalAppIdHeaderName!];

        if (
          req.externalAppId &&
          !this.authorizerEnvironments.allowedExternalAppIds?.includes(
            req.externalAppId
          )
        ) {
          req.authorizerUser = {
            id: req.externalUserId
              ? (
                  await this.authorizerConfiguration.getAuthorizerUserFromExternalUserId?.(
                    req.externalUserId,
                    req.externalAppId,
                    ctx
                  )
                )?.id
              : undefined,
          };
        }
      }
    }

    if (checkAccess) {
      // check access by custom logic
      const checkAccessValidatorResult = this.authorizerConfiguration
        .checkAccessValidator
        ? await this.authorizerConfiguration.checkAccessValidator(
            req.authorizerUser,
            checkAccessMetadata,
            ctx
          )
        : false;

      // check access by roles
      if (allowEmptyUserMetadata) {
        req.authorizerUser = req.authorizerUser || { id: undefined };
      } else {
        if (!checkAccessValidatorResult && !req.authorizerUser?.id) {
          throw new AuthorizerError('Unauthorized');
        }
      }
    }

    if (
      req.authorizerUser?.id &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      !req?.headers?.[this.authorizerConfiguration.externalUserIdHeaderName!]
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      req.headers[this.authorizerConfiguration.externalUserIdHeaderName!] =
        req.authorizerUser?.id;
      req.externalUserId =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        req?.headers?.[this.authorizerConfiguration.externalUserIdHeaderName!];
    }

    req.skippedByAuthorizer =
      req.authorizerUser === undefined || req.authorizerUser?.id === undefined;
    return req.authorizerUser;
  }
}
