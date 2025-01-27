"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectAuthUserDto = void 0;
const tslib_1 = require("tslib");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ConnectAuthUserDto {
}
exports.ConnectAuthUserDto = ConnectAuthUserDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ConnectAuthUserDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ConnectAuthUserDto.prototype, "externalUserId", void 0);
//# sourceMappingURL=connect-auth-user.dto.js.map