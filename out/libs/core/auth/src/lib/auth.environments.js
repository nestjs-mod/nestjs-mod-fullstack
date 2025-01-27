"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEnvironments = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
const class_validator_1 = require("class-validator");
let AuthEnvironments = class AuthEnvironments {
};
exports.AuthEnvironments = AuthEnvironments;
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Global admin username',
        default: 'admin@example.com',
    }),
    tslib_1.__metadata("design:type", String)
], AuthEnvironments.prototype, "adminEmail", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Global admin username',
        default: 'admin',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], AuthEnvironments.prototype, "adminUsername", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Global admin password',
    }),
    tslib_1.__metadata("design:type", String)
], AuthEnvironments.prototype, "adminPassword", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'TTL for cached data.',
        default: 15_000,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Number)
], AuthEnvironments.prototype, "cacheTTL", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use guards.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], AuthEnvironments.prototype, "useGuards", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use filters.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], AuthEnvironments.prototype, "useFilters", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use interceptors.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], AuthEnvironments.prototype, "useInterceptors", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use pipes.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], AuthEnvironments.prototype, "usePipes", void 0);
exports.AuthEnvironments = AuthEnvironments = tslib_1.__decorate([
    (0, common_1.EnvModel)()
], AuthEnvironments);
//# sourceMappingURL=auth.environments.js.map