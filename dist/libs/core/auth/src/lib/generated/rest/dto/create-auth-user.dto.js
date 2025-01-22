"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuthUserDto = void 0;
const tslib_1 = require("tslib");
const auth_client_1 = require("../../../../../../../../node_modules/@prisma/auth-client");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAuthUserDto {
}
exports.CreateAuthUserDto = CreateAuthUserDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateAuthUserDto.prototype, "externalUserId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        enum: auth_client_1.AuthRole,
        enumName: 'AuthRole',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateAuthUserDto.prototype, "userRole", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'number',
        format: 'float',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Object)
], CreateAuthUserDto.prototype, "timezone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", Object)
], CreateAuthUserDto.prototype, "lang", void 0);
//# sourceMappingURL=create-auth-user.dto.js.map