'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FindManyArgs = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const class_transformer_1 = require('class-transformer');
const class_validator_1 = require('class-validator');
class FindManyArgs {}
exports.FindManyArgs = FindManyArgs;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata('design:type', Number),
  ],
  FindManyArgs.prototype,
  'curPage',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata('design:type', Number),
  ],
  FindManyArgs.prototype,
  'perPage',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: String }),
    tslib_1.__metadata('design:type', String),
  ],
  FindManyArgs.prototype,
  'searchText',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: String }),
    tslib_1.__metadata('design:type', String),
  ],
  FindManyArgs.prototype,
  'sort',
  void 0
);
//# sourceMappingURL=find-many-args.js.map
