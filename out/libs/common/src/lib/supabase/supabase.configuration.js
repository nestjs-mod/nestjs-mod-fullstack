"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseConfiguration = exports.defaultSupabaseGetSupabaseUserFromExternalUserId = exports.defaultSupabaseCheckAccessValidator = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
const defaultSupabaseCheckAccessValidator = async (supabaseUser, options) => {
    return Boolean(supabaseUser?.role && options?.roles?.includes(supabaseUser?.role));
};
exports.defaultSupabaseCheckAccessValidator = defaultSupabaseCheckAccessValidator;
const defaultSupabaseGetSupabaseUserFromExternalUserId = (externalUserId) => ({
    id: externalUserId,
});
exports.defaultSupabaseGetSupabaseUserFromExternalUserId = defaultSupabaseGetSupabaseUserFromExternalUserId;
let SupabaseConfiguration = class SupabaseConfiguration {
};
exports.SupabaseConfiguration = SupabaseConfiguration;
tslib_1.__decorate([
    (0, common_1.ConfigModelProperty)({
        description: 'Extra headers',
    }),
    tslib_1.__metadata("design:type", Object)
], SupabaseConfiguration.prototype, "extraHeaders", void 0);
tslib_1.__decorate([
    (0, common_1.ConfigModelProperty)({
        description: 'Function for resolve request from execution context',
        default: common_1.getRequestFromExecutionContext,
    }),
    tslib_1.__metadata("design:type", Function)
], SupabaseConfiguration.prototype, "getRequestFromContext", void 0);
tslib_1.__decorate([
    (0, common_1.ConfigModelProperty)({
        description: 'External function for validate permissions',
        default: exports.defaultSupabaseCheckAccessValidator,
    }),
    tslib_1.__metadata("design:type", Function)
], SupabaseConfiguration.prototype, "checkAccessValidator", void 0);
tslib_1.__decorate([
    (0, common_1.ConfigModelProperty)({
        description: 'A header for searching for an external user ID, if you have logged in previously and do not need to log in again in the authorization service, can be used during testing.',
        default: 'x-external-user-id',
    }),
    tslib_1.__metadata("design:type", String)
], SupabaseConfiguration.prototype, "externalUserIdHeaderName", void 0);
tslib_1.__decorate([
    (0, common_1.ConfigModelProperty)({
        description: 'Header for searching for external application identifiers, if you have logged in previously and do not need to log in again in the authorization service, these identifiers must be private and can be used for testing.',
        default: 'x-external-app-id',
    }),
    tslib_1.__metadata("design:type", String)
], SupabaseConfiguration.prototype, "externalAppIdHeaderName", void 0);
tslib_1.__decorate([
    (0, common_1.ConfigModelProperty)({
        description: 'Function for resolve supabase user by externalUserId',
        default: exports.defaultSupabaseGetSupabaseUserFromExternalUserId,
    }),
    tslib_1.__metadata("design:type", Function)
], SupabaseConfiguration.prototype, "getSupabaseUserFromExternalUserId", void 0);
exports.SupabaseConfiguration = SupabaseConfiguration = tslib_1.__decorate([
    (0, common_1.ConfigModel)()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
], SupabaseConfiguration);
//# sourceMappingURL=supabase.configuration.js.map