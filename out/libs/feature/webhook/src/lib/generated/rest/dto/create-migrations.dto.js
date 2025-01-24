'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateMigrationsDto = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class CreateMigrationsDto {}
exports.CreateMigrationsDto = CreateMigrationsDto;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    tslib_1.__metadata('design:type', Number),
  ],
  CreateMigrationsDto.prototype,
  'installed_rank',
  void 0
);
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
  CreateMigrationsDto.prototype,
  'version',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateMigrationsDto.prototype,
  'description',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateMigrationsDto.prototype,
  'type',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateMigrationsDto.prototype,
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
  CreateMigrationsDto.prototype,
  'checksum',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata('design:type', String),
  ],
  CreateMigrationsDto.prototype,
  'installed_by',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    tslib_1.__metadata('design:type', Number),
  ],
  CreateMigrationsDto.prototype,
  'execution_time',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'boolean',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata('design:type', Boolean),
  ],
  CreateMigrationsDto.prototype,
  'success',
  void 0
);
//# sourceMappingURL=create-migrations.dto.js.map
