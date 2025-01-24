'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookStaticConfiguration = exports.WebhookConfiguration = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs-mod/common');
let WebhookConfiguration = class WebhookConfiguration {};
exports.WebhookConfiguration = WebhookConfiguration;
tslib_1.__decorate(
  [
    (0, common_1.ConfigModelProperty)({
      description: 'List of available events.',
    }),
    tslib_1.__metadata('design:type', Array),
  ],
  WebhookConfiguration.prototype,
  'events',
  void 0
);
tslib_1.__decorate(
  [
    (0, common_1.ConfigModelProperty)({
      description: 'TTL for cached data.',
      default: 15_000,
    }),
    tslib_1.__metadata('design:type', Number),
  ],
  WebhookConfiguration.prototype,
  'cacheTTL',
  void 0
);
exports.WebhookConfiguration = WebhookConfiguration = tslib_1.__decorate(
  [(0, common_1.ConfigModel)()],
  WebhookConfiguration
);
let WebhookStaticConfiguration = class WebhookStaticConfiguration {};
exports.WebhookStaticConfiguration = WebhookStaticConfiguration;
tslib_1.__decorate(
  [
    (0, common_1.ConfigModelProperty)({
      description:
        'The name of the header key that stores the external user ID.',
      default: 'x-external-user-id',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookStaticConfiguration.prototype,
  'externalUserIdHeaderName',
  void 0
);
tslib_1.__decorate(
  [
    (0, common_1.ConfigModelProperty)({
      description:
        'The name of the header key that stores the external tenant ID.',
      default: 'x-external-tenant-id',
    }),
    tslib_1.__metadata('design:type', String),
  ],
  WebhookStaticConfiguration.prototype,
  'externalTenantIdHeaderName',
  void 0
);
exports.WebhookStaticConfiguration = WebhookStaticConfiguration =
  tslib_1.__decorate([(0, common_1.ConfigModel)()], WebhookStaticConfiguration);
//# sourceMappingURL=webhook.configuration.js.map
