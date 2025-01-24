'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CurrentAuthUser =
  exports.CurrentAuthRequest =
  exports.CheckAuthRole =
  exports.SkipAuthGuard =
    void 0;
exports.UseAuthInterceptorsAndGuards = UseAuthInterceptorsAndGuards;
const common_1 = require('@nestjs-mod/common');
const common_2 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const common_3 = require('@nestjs-mod-fullstack/common');
const common_4 = require('@nestjs/common');
const auth_guard_1 = require('./auth.guard');
const auth_timezone_interceptor_1 = require('./interceptors/auth-timezone.interceptor');
exports.SkipAuthGuard = core_1.Reflector.createDecorator();
exports.CheckAuthRole = core_1.Reflector.createDecorator();
exports.CurrentAuthRequest = (0, common_2.createParamDecorator)(
  (_data, ctx) => {
    const req = (0, common_1.getRequestFromExecutionContext)(ctx);
    return req;
  }
);
exports.CurrentAuthUser = (0, common_2.createParamDecorator)((_data, ctx) => {
  const req = (0, common_1.getRequestFromExecutionContext)(ctx);
  return req.authUser;
});
function AddHandleConnection() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor) {
    constructor.prototype.handleConnection = function (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args
    ) {
      const authorizationHeader = args[0]?.headers.authorization;
      const queryToken = args[0]?.url?.split('token=')?.[1];
      client.headers = {
        authorization:
          authorizationHeader || queryToken ? `Bearer ${queryToken}` : '',
      };
    };
  };
}
function UseAuthInterceptorsAndGuards(options) {
  return (0, common_4.applyDecorators)(
    (0, common_2.UseInterceptors)(
      auth_timezone_interceptor_1.AuthTimezoneInterceptor
    ),
    (0, common_2.UseGuards)(common_3.SupabaseGuard, auth_guard_1.AuthGuard),
    AddHandleConnection(),
    ...(options?.allowEmptyUser ? [(0, common_3.AllowEmptyUser)()] : [])
  );
}
//# sourceMappingURL=auth.decorators.js.map
