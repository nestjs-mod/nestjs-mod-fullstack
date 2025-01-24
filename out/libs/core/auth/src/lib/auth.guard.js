'use strict';
var AuthGuard_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthGuard = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod-fullstack/common');
const common_2 = require('@nestjs-mod/common');
const prisma_1 = require('@nestjs-mod/prisma');
const common_3 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const auth_client_1 = require('@prisma/auth-client');
const nestjs_translates_1 = require('nestjs-translates');
const auth_constants_1 = require('./auth.constants');
const auth_decorators_1 = require('./auth.decorators');
const auth_environments_1 = require('./auth.environments');
const auth_errors_1 = require('./auth.errors');
const auth_cache_service_1 = require('./services/auth-cache.service');
let AuthGuard = (AuthGuard_1 = class AuthGuard {
  constructor(
    prismaClient,
    reflector,
    authCacheService,
    authEnvironments,
    translatesStorage
  ) {
    this.prismaClient = prismaClient;
    this.reflector = reflector;
    this.authCacheService = authCacheService;
    this.authEnvironments = authEnvironments;
    this.translatesStorage = translatesStorage;
    this.logger = new common_3.Logger(AuthGuard_1.name);
  }
  async canActivate(context) {
    if (!this.authEnvironments.useGuards) {
      return true;
    }
    try {
      const { skipAuthGuard, checkAuthRole, allowEmptyUserMetadata } =
        this.getHandlersReflectMetadata(context);
      if (skipAuthGuard) {
        return true;
      }
      const req = this.getRequestFromExecutionContext(context);
      if (req.supabaseUser?.id) {
        await this.tryGetOrCreateCurrentUserWithExternalUserId(
          req,
          req.supabaseUser.id
        );
      }
      this.throwErrorIfCurrentUserNotSet(req, allowEmptyUserMetadata);
      this.pathSupabaseUserRoles(req);
      this.throwErrorIfCurrentUserNotHaveNeededRoles(checkAuthRole, req);
    } catch (err) {
      this.logger.error(err, err.stack);
      throw err;
    }
    return true;
  }
  pathSupabaseUserRoles(req) {
    if (
      this.authEnvironments.adminEmail &&
      req.supabaseUser?.email === this.authEnvironments.adminEmail
    ) {
      if (req.authUser) {
        req.authUser.userRole = 'Admin';
      }
      req.supabaseUser.role = 'admin';
    }
  }
  throwErrorIfCurrentUserNotHaveNeededRoles(checkAuthRole, req) {
    if (
      checkAuthRole &&
      req.authUser &&
      !checkAuthRole?.includes(req.authUser.userRole)
    ) {
      throw new auth_errors_1.AuthError(auth_errors_1.AuthErrorEnum.FORBIDDEN);
    }
  }
  throwErrorIfCurrentUserNotSet(req, allowEmptyUserMetadata) {
    if (!req.skippedBySupabase && !req.authUser && !allowEmptyUserMetadata) {
      throw new auth_errors_1.AuthError(
        auth_errors_1.AuthErrorEnum.USER_NOT_FOUND
      );
    }
  }
  async tryGetOrCreateCurrentUserWithExternalUserId(req, externalUserId) {
    if (!req.authUser && externalUserId) {
      const authUser =
        await this.authCacheService.getCachedUserByExternalUserId(
          externalUserId
        );
      req.authUser =
        authUser ||
        (await this.prismaClient.authUser.upsert({
          create: { externalUserId, userRole: 'User' },
          update: {},
          where: { externalUserId },
        }));
      if (req.authUser.lang) {
        req.headers[nestjs_translates_1.ACCEPT_LANGUAGE] = req.authUser.lang;
      }
    }
    if (
      req.headers[nestjs_translates_1.ACCEPT_LANGUAGE] &&
      !this.translatesStorage.locales.includes(
        req.headers[nestjs_translates_1.ACCEPT_LANGUAGE]
      )
    ) {
      req.headers[nestjs_translates_1.ACCEPT_LANGUAGE] =
        this.translatesStorage.defaultLocale;
    }
  }
  getRequestFromExecutionContext(context) {
    const req = (0, common_2.getRequestFromExecutionContext)(context);
    req.headers = req.headers || {};
    return req;
  }
  getHandlersReflectMetadata(context) {
    const allowEmptyUserMetadata = Boolean(
      (typeof context.getHandler === 'function' &&
        this.reflector.get(common_1.AllowEmptyUser, context.getHandler())) ||
        (typeof context.getClass === 'function' &&
          this.reflector.get(common_1.AllowEmptyUser, context.getClass())) ||
        undefined
    );
    const skipAuthGuard =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(
          auth_decorators_1.SkipAuthGuard,
          context.getHandler()
        )) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(
          auth_decorators_1.SkipAuthGuard,
          context.getClass()
        )) ||
      undefined;
    const checkAuthRole =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(
          auth_decorators_1.CheckAuthRole,
          context.getHandler()
        )) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(
          auth_decorators_1.CheckAuthRole,
          context.getClass()
        )) ||
      undefined;
    return { allowEmptyUserMetadata, skipAuthGuard, checkAuthRole };
  }
});
exports.AuthGuard = AuthGuard;
exports.AuthGuard =
  AuthGuard =
  AuthGuard_1 =
    tslib_1.__decorate(
      [
        (0, common_3.Injectable)(),
        tslib_1.__param(
          0,
          (0, prisma_1.InjectPrismaClient)(auth_constants_1.AUTH_FEATURE)
        ),
        tslib_1.__metadata('design:paramtypes', [
          auth_client_1.PrismaClient,
          core_1.Reflector,
          auth_cache_service_1.AuthCacheService,
          auth_environments_1.AuthEnvironments,
          nestjs_translates_1.TranslatesStorage,
        ]),
      ],
      AuthGuard
    );
//# sourceMappingURL=auth.guard.js.map
