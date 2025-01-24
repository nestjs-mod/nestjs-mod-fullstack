'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ValidationConfiguration = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod/common');
let ValidationConfiguration = class ValidationConfiguration {};
exports.ValidationConfiguration = ValidationConfiguration;
tslib_1.__decorate(
  [
    (0, common_1.ConfigModelProperty)({
      description: 'Validation pipe options',
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  ValidationConfiguration.prototype,
  'pipeOptions',
  void 0
);
exports.ValidationConfiguration = ValidationConfiguration = tslib_1.__decorate(
  [(0, common_1.ConfigModel)()],
  ValidationConfiguration
);
//# sourceMappingURL=validation.configuration.js.map
