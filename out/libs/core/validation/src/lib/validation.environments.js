"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationEnvironments = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
let ValidationEnvironments = class ValidationEnvironments {
};
exports.ValidationEnvironments = ValidationEnvironments;
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use pipes.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], ValidationEnvironments.prototype, "usePipes", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use filters.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], ValidationEnvironments.prototype, "useFilters", void 0);
exports.ValidationEnvironments = ValidationEnvironments = tslib_1.__decorate([
    (0, common_1.EnvModel)()
], ValidationEnvironments);
//# sourceMappingURL=validation.environments.js.map