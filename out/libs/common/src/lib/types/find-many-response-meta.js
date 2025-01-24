'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FindManyResponseMeta = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
class FindManyResponseMeta {}
exports.FindManyResponseMeta = FindManyResponseMeta;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    tslib_1.__metadata('design:type', Number),
  ],
  FindManyResponseMeta.prototype,
  'curPage',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: Number }),
    tslib_1.__metadata('design:type', Number),
  ],
  FindManyResponseMeta.prototype,
  'perPage',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({ type: Number }),
    tslib_1.__metadata('design:type', Number),
  ],
  FindManyResponseMeta.prototype,
  'totalResults',
  void 0
);
//# sourceMappingURL=find-many-response-meta.js.map
