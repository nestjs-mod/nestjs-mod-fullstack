"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = exports.AUTH_ERROR_ENUM_TITLES = exports.AuthErrorEnum = void 0;
const tslib_1 = require("tslib");
const swagger_1 = require("@nestjs/swagger");
const nestjs_translates_1 = require("nestjs-translates");
var AuthErrorEnum;
(function (AuthErrorEnum) {
    AuthErrorEnum["COMMON"] = "AUTH-000";
    AuthErrorEnum["FORBIDDEN"] = "AUTH-001";
    AuthErrorEnum["USER_NOT_FOUND"] = "AUTH-002";
})(AuthErrorEnum || (exports.AuthErrorEnum = AuthErrorEnum = {}));
exports.AUTH_ERROR_ENUM_TITLES = {
    [AuthErrorEnum.COMMON]: (0, nestjs_translates_1.getText)('Auth error'),
    [AuthErrorEnum.FORBIDDEN]: (0, nestjs_translates_1.getText)('Forbidden'),
    [AuthErrorEnum.USER_NOT_FOUND]: (0, nestjs_translates_1.getText)('User not found'),
};
class AuthError extends Error {
    constructor(message, code, metadata) {
        const messageAsCode = Boolean(message && Object.values(AuthErrorEnum).includes(message));
        const preparedCode = messageAsCode ? message : code;
        const preparedMessage = preparedCode
            ? exports.AUTH_ERROR_ENUM_TITLES[preparedCode]
            : message;
        code = preparedCode || AuthErrorEnum.COMMON;
        message = preparedMessage || exports.AUTH_ERROR_ENUM_TITLES[code];
        super(message);
        this.code = AuthErrorEnum.COMMON;
        this.code = code;
        this.message = message;
        this.metadata = metadata;
    }
}
exports.AuthError = AuthError;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: String,
        description: Object.entries(exports.AUTH_ERROR_ENUM_TITLES)
            .map(([key, value]) => `${value} (${key})`)
            .join(', '),
        example: exports.AUTH_ERROR_ENUM_TITLES[AuthErrorEnum.COMMON],
    }),
    tslib_1.__metadata("design:type", String)
], AuthError.prototype, "message", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        enum: AuthErrorEnum,
        enumName: 'AuthErrorEnum',
        example: AuthErrorEnum.COMMON,
    }),
    tslib_1.__metadata("design:type", Object)
], AuthError.prototype, "code", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Object }),
    tslib_1.__metadata("design:type", Object)
], AuthError.prototype, "metadata", void 0);
//# sourceMappingURL=auth.errors.js.map