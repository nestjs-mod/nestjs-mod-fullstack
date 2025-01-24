'use strict';
var SupabaseService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SupabaseService = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const supabase_js_1 = require('@supabase/supabase-js');
const supabase_configuration_1 = require('./supabase.configuration');
const supabase_decorators_1 = require('./supabase.decorators');
const supabase_environments_1 = require('./supabase.environments');
const supabase_errors_1 = require('./supabase.errors');
let SupabaseService = (SupabaseService_1 = class SupabaseService {
  constructor(reflector, supabaseConfiguration, supabaseEnvironments) {
    this.reflector = reflector;
    this.supabaseConfiguration = supabaseConfiguration;
    this.supabaseEnvironments = supabaseEnvironments;
    this.logger = new common_1.Logger(SupabaseService_1.name);
  }
  onModuleInit() {
    this.supabaseClient = new supabase_js_1.SupabaseClient(
      this.supabaseEnvironments.supabaseURL,
      this.supabaseEnvironments.supabaseKey
    );
  }
  getSupabaseClient() {
    return this.supabaseClient;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserFromRequest(ctx, checkAccess = true) {
    const req = this.supabaseConfiguration.getRequestFromContext?.(ctx) || {};
    const allowEmptyUserMetadata =
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(
          supabase_decorators_1.AllowEmptyUser,
          ctx.getHandler()
        )) ||
      (typeof ctx.getClass === 'function' &&
        this.reflector.get(
          supabase_decorators_1.AllowEmptyUser,
          ctx.getClass()
        )) ||
      undefined;
    const checkAccessMetadata =
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(
          supabase_decorators_1.CheckAccess,
          ctx.getHandler()
        )) ||
      (typeof ctx.getClass === 'function' &&
        this.reflector.get(
          supabase_decorators_1.CheckAccess,
          ctx.getClass()
        )) ||
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
            throw new supabase_errors_1.SupabaseError(
              getProfileResult.error.message
            );
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
            this.supabaseConfiguration.externalUserIdHeaderName
          ];
        req.externalAppId =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          req?.headers?.[this.supabaseConfiguration.externalAppIdHeaderName];
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
        throw new supabase_errors_1.SupabaseError('Unauthorized');
      }
    }
    if (
      req.supabaseUser?.id &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      !req?.headers?.[this.supabaseConfiguration.externalUserIdHeaderName]
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      req.headers[this.supabaseConfiguration.externalUserIdHeaderName] =
        req.supabaseUser?.id;
      req.externalUserId =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        req?.headers?.[this.supabaseConfiguration.externalUserIdHeaderName];
    }
    req.skippedBySupabase =
      req.supabaseUser === undefined || req.supabaseUser?.id === undefined;
    return req.supabaseUser;
  }
});
exports.SupabaseService = SupabaseService;
exports.SupabaseService =
  SupabaseService =
  SupabaseService_1 =
    tslib_1.__decorate(
      [
        (0, common_1.Injectable)(),
        tslib_1.__metadata('design:paramtypes', [
          core_1.Reflector,
          supabase_configuration_1.SupabaseConfiguration,
          supabase_environments_1.SupabaseEnvironments,
        ]),
      ],
      SupabaseService
    );
//# sourceMappingURL=supabase.service.js.map
