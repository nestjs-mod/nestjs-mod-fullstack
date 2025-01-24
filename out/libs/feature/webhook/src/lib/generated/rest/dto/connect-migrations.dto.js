'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ConnectMigrationsDto = void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class ConnectMigrationsDto {}
exports.ConnectMigrationsDto = ConnectMigrationsDto;
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
  ConnectMigrationsDto.prototype,
  'installed_rank',
  void 0
);
//# sourceMappingURL=connect-migrations.dto.js.map
