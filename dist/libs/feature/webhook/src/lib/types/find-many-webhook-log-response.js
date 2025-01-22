"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindManyWebhookLogResponse = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod-fullstack/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_log_entity_1 = require("../generated/rest/dto/webhook-log.entity");
class FindManyWebhookLogResponse {
}
exports.FindManyWebhookLogResponse = FindManyWebhookLogResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: () => [webhook_log_entity_1.WebhookLog] }),
    tslib_1.__metadata("design:type", Array)
], FindManyWebhookLogResponse.prototype, "webhookLogs", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: () => common_1.FindManyResponseMeta }),
    tslib_1.__metadata("design:type", common_1.FindManyResponseMeta)
], FindManyWebhookLogResponse.prototype, "meta", void 0);
//# sourceMappingURL=find-many-webhook-log-response.js.map