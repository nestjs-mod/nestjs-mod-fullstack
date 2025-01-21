import {
  ExecutionContext,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfiguration } from './supabase.configuration';
import { AllowEmptyUser, CheckAccess } from './supabase.decorators';
import { SupabaseEnvironments } from './supabase.environments';
import { SupabaseError } from './supabase.errors';
import { SupabaseUser } from './supabase.types';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private logger = new Logger(SupabaseService.name);
  private supabaseClient!: SupabaseClient;

  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseConfiguration: SupabaseConfiguration,
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
  ): Promise<SupabaseUser | undefined> {
    const req = this.supabaseConfiguration.getRequestFromContext?.(ctx) || {};

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

    if (!req.supabaseUser?.id) {
      const token = req.headers?.authorization?.split(' ')[1];

      if (token) {
        // check user in supabase
        try {
          const getProfileResult = await this.supabaseClient.auth.getUser(
            token
          );
          if (!getProfileResult.error) {
            req.supabaseUser = {
              email: getProfileResult.data.user.email,
              id: getProfileResult.data.user.id,
              created_at: (+new Date(
                getProfileResult.data.user.created_at
              )).toString(),
              updated_at: getProfileResult.data.user.updated_at
                ? (+new Date(getProfileResult.data.user.updated_at)).toString()
                : '0',
              role: 'user',
              picture: getProfileResult.data.user.user_metadata['picture'],
            };
          } else {
            this.logger.error(
              getProfileResult.error.message,
              getProfileResult.error.stack
            );
            throw new SupabaseError(getProfileResult.error.message);
          }
        } catch (err) {
          req.supabaseUser = { id: undefined };
        }
      }

      // check external user id
      if (!req.supabaseUser) {
        req.externalUserId =
          req?.headers?.[
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.supabaseConfiguration.externalUserIdHeaderName!
          ];
        req.externalAppId =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          req?.headers?.[this.supabaseConfiguration.externalAppIdHeaderName!];

        if (
          req.externalAppId &&
          !this.supabaseEnvironments.allowedExternalAppIds?.includes(
            req.externalAppId
          )
        ) {
          req.supabaseUser = {
            id: req.externalUserId
              ? (
                  await this.supabaseConfiguration.getSupabaseUserFromExternalUserId?.(
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

    req.supabaseUser = req.supabaseUser || { id: undefined };

    if (checkAccess) {
      // check access by custom logic
      const checkAccessValidatorResult = this.supabaseConfiguration
        .checkAccessValidator
        ? await this.supabaseConfiguration.checkAccessValidator(
            req.supabaseUser,
            checkAccessMetadata,
            ctx
          )
        : false;

      // check access by roles
      if (
        !allowEmptyUserMetadata &&
        !checkAccessValidatorResult &&
        !req.supabaseUser?.id
      ) {
        throw new SupabaseError('Unauthorized');
      }
    }

    if (
      req.supabaseUser?.id &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      !req?.headers?.[this.supabaseConfiguration.externalUserIdHeaderName!]
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      req.headers[this.supabaseConfiguration.externalUserIdHeaderName!] =
        req.supabaseUser?.id;
      req.externalUserId =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        req?.headers?.[this.supabaseConfiguration.externalUserIdHeaderName!];
    }

    req.skippedBySupabase =
      req.supabaseUser === undefined || req.supabaseUser?.id === undefined;
    return req.supabaseUser;
  }
}
