'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SupabaseGuard = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs/common');
const supabase_service_1 = require('./supabase.service');
let SupabaseGuard = class SupabaseGuard {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
  }
  async canActivate(context) {
    await this.supabaseService.getUserFromRequest(context);
    return true;
  }
};
exports.SupabaseGuard = SupabaseGuard;
exports.SupabaseGuard = SupabaseGuard = tslib_1.__decorate(
  [
    (0, common_1.Injectable)(),
    tslib_1.__metadata('design:paramtypes', [
      supabase_service_1.SupabaseService,
    ]),
  ],
  SupabaseGuard
);
//# sourceMappingURL=supabase.guard.js.map
