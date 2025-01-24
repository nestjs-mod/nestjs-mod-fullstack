'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookToolsService = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs/common');
let WebhookToolsService = class WebhookToolsService {
  externalTenantIdQuery(webhookUser, externalTenantId) {
    const q =
      webhookUser?.userRole === 'User'
        ? {
            externalTenantId: webhookUser.externalTenantId,
          }
        : { externalTenantId };
    if (!q.externalTenantId) {
      return {};
    }
    return q;
  }
};
exports.WebhookToolsService = WebhookToolsService;
exports.WebhookToolsService = WebhookToolsService = tslib_1.__decorate(
  [(0, common_1.Injectable)()],
  WebhookToolsService
);
//# sourceMappingURL=webhook-tools.service.js.map
