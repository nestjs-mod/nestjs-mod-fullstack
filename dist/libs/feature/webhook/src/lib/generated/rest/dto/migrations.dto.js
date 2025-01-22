"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationsDto = void 0;
const tslib_1 = require("tslib");
const swagger_1 = require("@nestjs/swagger");
class MigrationsDto {
}
exports.MigrationsDto = MigrationsDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'integer',
        format: 'int32',
    }),
    tslib_1.__metadata("design:type", Number)
], MigrationsDto.prototype, "installed_rank", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", Object)
], MigrationsDto.prototype, "version", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], MigrationsDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], MigrationsDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], MigrationsDto.prototype, "script", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'integer',
        format: 'int32',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", Object)
], MigrationsDto.prototype, "checksum", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
    }),
    tslib_1.__metadata("design:type", String)
], MigrationsDto.prototype, "installed_by", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", Date)
], MigrationsDto.prototype, "installed_on", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'integer',
        format: 'int32',
    }),
    tslib_1.__metadata("design:type", Number)
], MigrationsDto.prototype, "execution_time", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'boolean',
    }),
    tslib_1.__metadata("design:type", Boolean)
], MigrationsDto.prototype, "success", void 0);
//# sourceMappingURL=migrations.dto.js.map