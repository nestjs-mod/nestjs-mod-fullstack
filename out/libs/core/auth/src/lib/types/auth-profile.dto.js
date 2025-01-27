"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProfileDto = void 0;
const tslib_1 = require("tslib");
const swagger_1 = require("@nestjs/swagger");
const auth_client_1 = require("@prisma/auth-client");
const class_validator_1 = require("class-validator");
const create_auth_user_dto_1 = require("../generated/rest/dto/create-auth-user.dto");
class AuthProfileDto extends (0, swagger_1.PickType)(create_auth_user_dto_1.CreateAuthUserDto, [
    'timezone',
    'lang',
]) {
}
exports.AuthProfileDto = AuthProfileDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        enum: auth_client_1.AuthRole,
        enumName: 'AuthRole',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], AuthProfileDto.prototype, "userRole", void 0);
//# sourceMappingURL=auth-profile.dto.js.map