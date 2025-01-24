'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthTimezonePipe = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod-fullstack/common');
const common_2 = require('@nestjs/common');
const node_async_hooks_1 = require('node:async_hooks');
const auth_environments_1 = require('../auth.environments');
const auth_timezone_service_1 = require('../services/auth-timezone.service');
let AuthTimezonePipe = class AuthTimezonePipe {
  constructor(asyncLocalStorage, authTimezoneService, authEnvironments) {
    this.asyncLocalStorage = asyncLocalStorage;
    this.authTimezoneService = authTimezoneService;
    this.authEnvironments = authEnvironments;
  }
  transform(value) {
    if (!this.authEnvironments.usePipes) {
      return value;
    }
    const result = this.authTimezoneService.convertObject(
      value,
      -1 * (this.asyncLocalStorage.getStore()?.authTimezone || 0) -
        common_1.SERVER_TIMEZONE_OFFSET
    );
    return result;
  }
};
exports.AuthTimezonePipe = AuthTimezonePipe;
exports.AuthTimezonePipe = AuthTimezonePipe = tslib_1.__decorate(
  [
    (0, common_2.Injectable)(),
    tslib_1.__metadata('design:paramtypes', [
      node_async_hooks_1.AsyncLocalStorage,
      auth_timezone_service_1.AuthTimezoneService,
      auth_environments_1.AuthEnvironments,
    ]),
  ],
  AuthTimezonePipe
);
//# sourceMappingURL=auth-timezone.pipe.js.map
