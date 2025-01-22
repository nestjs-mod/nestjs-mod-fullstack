"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaToolsEnvironments = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
let PrismaToolsEnvironments = class PrismaToolsEnvironments {
};
exports.PrismaToolsEnvironments = PrismaToolsEnvironments;
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use filters.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], PrismaToolsEnvironments.prototype, "useFilters", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Pagination initial page.',
        transform: new common_1.NumberTransformer(),
        default: 1,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Number)
], PrismaToolsEnvironments.prototype, "paginationInitialPage", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Pagination per page steps.',
        transform: new common_1.ArrayOfStringTransformer(),
        default: [1, 2, 5, 10, 25, 100],
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Array)
], PrismaToolsEnvironments.prototype, "paginationPerPageSteps", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Pagination per page.',
        transform: new common_1.NumberTransformer(),
        default: 5,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Number)
], PrismaToolsEnvironments.prototype, "paginationPerPage", void 0);
exports.PrismaToolsEnvironments = PrismaToolsEnvironments = tslib_1.__decorate([
    (0, common_1.EnvModel)()
], PrismaToolsEnvironments);
//# sourceMappingURL=prisma-tools.environments.js.map