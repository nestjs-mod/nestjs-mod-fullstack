'use strict';
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.CurrentSupabaseUserToken =
  exports.CurrentSupabaseUser =
  exports.CheckAccess =
  exports.AllowEmptyUser =
  exports.getSupabaseEnvironmentsLoaderToken =
  exports.getSupabaseServiceToken =
  exports.InjectSupabaseService =
    void 0;
const common_1 = require('@nestjs-mod/common');
const core_1 = require('@nestjs/core');
const common_2 = require('@nestjs/common');
const supabase_constants_1 = require('./supabase.constants');
exports.InjectSupabaseService = (0, common_1.getNestModuleDecorators)({
  moduleName: supabase_constants_1.SUPABASE_MODULE,
}).InjectService;
(_a = (0, common_1.getNestModuleInternalUtils)({
  moduleName: supabase_constants_1.SUPABASE_MODULE,
})),
  (exports.getSupabaseServiceToken = _a.getServiceToken),
  (exports.getSupabaseEnvironmentsLoaderToken = _a.getEnvironmentsLoaderToken);
exports.AllowEmptyUser = core_1.Reflector.createDecorator();
exports.CheckAccess = core_1.Reflector.createDecorator();
exports.CurrentSupabaseUser = (0, common_2.createParamDecorator)(
  (data, ctx) => {
    const request = (0, common_1.getRequestFromExecutionContext)(ctx);
    return request.supabaseUser;
  }
);
exports.CurrentSupabaseUserToken = (0, common_2.createParamDecorator)(
  (data, ctx) => {
    const request = (0, common_1.getRequestFromExecutionContext)(ctx);
    return request?.headers?.authorization?.split(' ')[1];
  }
);
//# sourceMappingURL=supabase.decorators.js.map
