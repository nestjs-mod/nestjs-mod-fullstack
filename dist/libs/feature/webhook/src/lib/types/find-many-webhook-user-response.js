"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindManyWebhookUserResponse = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod-fullstack/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_user_entity_1 = require("../generated/rest/dto/webhook-user.entity");
class FindManyWebhookUserResponse {
}
exports.FindManyWebhookUserResponse = FindManyWebhookUserResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: () => [webhook_user_entity_1.WebhookUser] }),
    tslib_1.__metadata("design:type", Array)
], FindManyWebhookUserResponse.prototype, "webhookUsers", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: () => common_1.FindManyResponseMeta }),
    tslib_1.__metadata("design:type", common_1.FindManyResponseMeta)
], FindManyWebhookUserResponse.prototype, "meta", void 0);
//# sourceMappingURL=find-many-webhook-user-response.js.map