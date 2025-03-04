import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  ExecutionContext,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfiguration } from './supabase.configuration';
import {
  AllowEmptySupabaseUser,
  CheckSupabaseAccess,
} from './supabase.decorators';
import { SupabaseStaticEnvironments } from './supabase.environments';
import { SupabaseError, SupabaseErrorEnum } from './supabase.errors';
import { SupabaseRequest, SupabaseUser } from './supabase.types';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private logger = new Logger(SupabaseService.name);
  private supabaseClient!: SupabaseClient;

  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseConfiguration: SupabaseConfiguration,
    private readonly supabaseStaticEnvironments: SupabaseStaticEnvironments
  ) {}

  onModuleInit() {
    this.supabaseClient = new SupabaseClient(
      this.supabaseStaticEnvironments.url,
      this.supabaseStaticEnvironments.key
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
    await this.tryGetOrCreateCurrentUserWithExternalUserId(ctx);

    await this.checkAccessValidator(checkAccess, ctx);

    const req = this.getRequestFromExecutionContext(ctx);

    this.setInfoOfExternalUserIdToRequest(req);

    this.setSkippedBySupabaseIfUserIsEmpty(req);

    return req.supabaseUser;
  }

  private setSkippedBySupabaseIfUserIsEmpty(req: SupabaseRequest) {
    req.skippedBySupabase =
      req.supabaseUser === undefined || req.supabaseUser?.id === undefined;
  }

  private setInfoOfExternalUserIdToRequest(req: SupabaseRequest) {
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
  }

  private async checkAccessValidator(
    checkAccess: boolean,
    ctx: ExecutionContext
  ) {
    const { checkAccessMetadata, allowEmptyUserMetadata } =
      this.getHandlersReflectMetadata(ctx);

    const req = this.getRequestFromExecutionContext(ctx);

    if (allowEmptyUserMetadata) {
      req.skipEmptySupabaseUser = true;
    }

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
        !req.skipEmptySupabaseUser &&
        !checkAccessValidatorResult &&
        !req.supabaseUser?.id
      ) {
        throw new SupabaseError(SupabaseErrorEnum.UNAUTHORIZED);
      }
    }
  }

  private async tryGetOrCreateCurrentUserWithExternalUserId(
    ctx: ExecutionContext
  ) {
    const req = this.getRequestFromExecutionContext(ctx);
    if (!req.supabaseUser?.id) {
      const token = req.headers?.authorization?.split(' ')[1];

      if (token && token !== 'undefined') {
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
            this.logger.debug({ token });
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
          !this.supabaseStaticEnvironments.allowedExternalAppIds?.includes(
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
  }

  private getRequestFromExecutionContext(ctx: ExecutionContext) {
    const req = getRequestFromExecutionContext(ctx) as SupabaseRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(ctx: ExecutionContext) {
    const allowEmptyUserMetadata = Boolean(
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(AllowEmptySupabaseUser, ctx.getHandler())) ||
        (typeof ctx.getClass === 'function' &&
          this.reflector.get(AllowEmptySupabaseUser, ctx.getClass())) ||
        undefined
    );
    const checkAccessMetadata =
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(CheckSupabaseAccess, ctx.getHandler())) ||
      (typeof ctx.getClass === 'function' &&
        this.reflector.get(CheckSupabaseAccess, ctx.getClass())) ||
      undefined;

    return {
      checkAccessMetadata,
      allowEmptyUserMetadata,
    };
  }
}
