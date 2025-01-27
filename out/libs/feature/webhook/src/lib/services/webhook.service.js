"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const webhook_configuration_1 = require("../webhook.configuration");
const webhook_errors_1 = require("../webhook.errors");
let WebhookService = class WebhookService {
    constructor(webhookConfiguration) {
        this.webhookConfiguration = webhookConfiguration;
        this.events$ = new rxjs_1.Subject();
    }
    async sendEvent(eventName, eventBody, eventHeaders) {
        const event = this.webhookConfiguration.events.find((e) => e.eventName === eventName);
        if (!event) {
            throw new webhook_errors_1.WebhookError(webhook_errors_1.WebhookErrorEnum.EVENT_NOT_FOUND);
        }
        this.events$.next({ eventName, eventBody, eventHeaders });
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [webhook_configuration_1.WebhookConfiguration])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map