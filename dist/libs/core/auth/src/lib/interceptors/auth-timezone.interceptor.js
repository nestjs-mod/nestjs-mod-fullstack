"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTimezoneInterceptor = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
const common_2 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const auth_cache_service_1 = require("../services/auth-cache.service");
const auth_timezone_service_1 = require("../services/auth-timezone.service");
const auth_environments_1 = require("../auth.environments");
const node_async_hooks_1 = require("node:async_hooks");
let AuthTimezoneInterceptor = class AuthTimezoneInterceptor {
    constructor(authTimezoneService, authCacheService, authEnvironments, asyncLocalStorage) {
        this.authTimezoneService = authTimezoneService;
        this.authCacheService = authCacheService;
        this.authEnvironments = authEnvironments;
        this.asyncLocalStorage = asyncLocalStorage;
    }
    intercept(context, next) {
        const req = (0, common_1.getRequestFromExecutionContext)(context);
        const userId = req.authUser?.externalUserId;
        if (!this.authEnvironments.useInterceptors) {
            return next.handle();
        }
        if (!userId) {
            return next.handle();
        }
        const run = () => {
            const result = next.handle();
            if ((0, rxjs_1.isObservable)(result)) {
                return result.pipe((0, operators_1.concatMap)(async (data) => {
                    const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
                    return this.authTimezoneService.convertObject(data, user?.timezone);
                }));
            }
            if (result instanceof Promise && typeof result?.then === 'function') {
                return result.then(async (data) => {
                    if ((0, rxjs_1.isObservable)(data)) {
                        return data.pipe((0, operators_1.concatMap)(async (data) => {
                            const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
                            return this.authTimezoneService.convertObject(data, user?.timezone);
                        }));
                    }
                    else {
                        const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
                        // need for correct map types with base method of NestInterceptor
                        return this.authTimezoneService.convertObject(data, user?.timezone);
                    }
                });
            }
            // need for correct map types with base method of NestInterceptor
            return this.authTimezoneService.convertObject(result, req.authUser?.timezone);
        };
        if (!this.authEnvironments.usePipes) {
            return run();
        }
        return this.asyncLocalStorage.run({ authTimezone: req.authUser?.timezone || 0 }, () => run());
    }
};
exports.AuthTimezoneInterceptor = AuthTimezoneInterceptor;
exports.AuthTimezoneInterceptor = AuthTimezoneInterceptor = tslib_1.__decorate([
    (0, common_2.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [auth_timezone_service_1.AuthTimezoneService,
        auth_cache_service_1.AuthCacheService,
        auth_environments_1.AuthEnvironments,
        node_async_hooks_1.AsyncLocalStorage])
], AuthTimezoneInterceptor);
//# sourceMappingURL=auth-timezone.interceptor.js.map