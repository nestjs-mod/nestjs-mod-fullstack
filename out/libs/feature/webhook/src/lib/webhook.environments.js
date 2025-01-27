"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEnvironments = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
let WebhookEnvironments = class WebhookEnvironments {
};
exports.WebhookEnvironments = WebhookEnvironments;
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use guards.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], WebhookEnvironments.prototype, "useGuards", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Use filters.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], WebhookEnvironments.prototype, "useFilters", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Auto create user from guard.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], WebhookEnvironments.prototype, "autoCreateUser", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Search tenantId and userId in headers.',
        transform: new common_1.BooleanTransformer(),
        default: true,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], WebhookEnvironments.prototype, "checkHeaders", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'Skip any guard errors.',
        transform: new common_1.BooleanTransformer(),
        default: false,
        hidden: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], WebhookEnvironments.prototype, "skipGuardErrors", void 0);
tslib_1.__decorate([
    (0, common_1.EnvModelProperty)({
        description: 'User ID with super admin role.',
    }),
    tslib_1.__metadata("design:type", String)
], WebhookEnvironments.prototype, "superAdminExternalUserId", void 0);
exports.WebhookEnvironments = WebhookEnvironments = tslib_1.__decorate([
    (0, common_1.EnvModel)()
], WebhookEnvironments);
//# sourceMappingURL=webhook.environments.js.map