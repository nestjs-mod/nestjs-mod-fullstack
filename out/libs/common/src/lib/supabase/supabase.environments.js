'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SupabaseEnvironments = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod/common');
const class_validator_1 = require('class-validator');
let SupabaseEnvironments = class SupabaseEnvironments {};
exports.SupabaseEnvironments = SupabaseEnvironments;
tslib_1.__decorate(
  [
    (0, common_1.EnvModelProperty)({
      description: 'Supabase URL',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata('design:type', String),
  ],
  SupabaseEnvironments.prototype,
  'supabaseURL',
  void 0
);
tslib_1.__decorate(
  [
    (0, common_1.EnvModelProperty)({
      description: 'Supabase key',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata('design:type', String),
  ],
  SupabaseEnvironments.prototype,
  'supabaseKey',
  void 0
);
tslib_1.__decorate(
  [
    (0, common_1.EnvModelProperty)({
      description:
        'Allowed identifiers of external applications, if you have logged in previously and do not need to log in again in the authorization service, these identifiers must be private and can be used for testing.',
      transform: new common_1.ArrayOfStringTransformer(),
    }),
    tslib_1.__metadata('design:type', Array),
  ],
  SupabaseEnvironments.prototype,
  'allowedExternalAppIds',
  void 0
);
exports.SupabaseEnvironments = SupabaseEnvironments = tslib_1.__decorate(
  [(0, common_1.EnvModel)()],
  SupabaseEnvironments
);
//# sourceMappingURL=supabase.environments.js.map
