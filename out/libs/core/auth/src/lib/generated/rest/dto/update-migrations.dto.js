'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UpdateMigrationsDto = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class UpdateMigrationsDto {}
exports.UpdateMigrationsDto = UpdateMigrationsDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
      nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', Object),
  ],
  UpdateMigrationsDto.prototype,
  'version',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  UpdateMigrationsDto.prototype,
  'description',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  UpdateMigrationsDto.prototype,
  'type',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  UpdateMigrationsDto.prototype,
  'script',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
      required: false,
      nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    tslib_1.__metadata('design:type', Object),
  ],
  UpdateMigrationsDto.prototype,
  'checksum',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  UpdateMigrationsDto.prototype,
  'installed_by',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    tslib_1.__metadata('design:type', Number),
  ],
  UpdateMigrationsDto.prototype,
  'execution_time',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'boolean',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata('design:type', Boolean),
  ],
  UpdateMigrationsDto.prototype,
  'success',
  void 0
);
//# sourceMappingURL=update-migrations.dto.js.map
