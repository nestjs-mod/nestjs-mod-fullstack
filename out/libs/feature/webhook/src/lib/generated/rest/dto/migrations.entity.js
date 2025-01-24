'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Migrations = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
class Migrations {}
exports.Migrations = Migrations;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
    }),
    tslib_1.__metadata('design:type', Number),
  ],
  Migrations.prototype,
  'installed_rank',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      nullable: true,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  Migrations.prototype,
  'version',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  Migrations.prototype,
  'description',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  Migrations.prototype,
  'type',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  Migrations.prototype,
  'script',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
      nullable: true,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  Migrations.prototype,
  'checksum',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  Migrations.prototype,
  'installed_by',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'string',
      format: 'date-time',
    }),
    tslib_1.__metadata('design:type', Date),
  ],
  Migrations.prototype,
  'installed_on',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'integer',
      format: 'int32',
    }),
    tslib_1.__metadata('design:type', Number),
  ],
  Migrations.prototype,
  'execution_time',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: 'boolean',
    }),
    tslib_1.__metadata('design:type', Boolean),
  ],
  Migrations.prototype,
  'success',
  void 0
);
//# sourceMappingURL=migrations.entity.js.map
