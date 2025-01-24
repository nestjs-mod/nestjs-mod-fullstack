'use strict';
var WebhookExceptionsFilter_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebhookExceptionsFilter = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const webhook_errors_1 = require('./webhook.errors');
let WebhookExceptionsFilter =
  (WebhookExceptionsFilter_1 = class WebhookExceptionsFilter extends (
    core_1.BaseExceptionFilter
  ) {
    constructor() {
      super(...arguments);
      this.logger = new common_1.Logger(WebhookExceptionsFilter_1.name);
    }
    catch(exception, host) {
      if (exception instanceof webhook_errors_1.WebhookError) {
        this.logger.error(exception, exception.stack);
        super.catch(
          new common_1.HttpException(
            {
              code: exception.code,
              message: exception.message,
              metadata: exception.metadata,
            },
            common_1.HttpStatus.BAD_REQUEST
          ),
          host
        );
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.logger.error(exception, exception?.stack);
        super.catch(exception, host);
      }
    }
  });
exports.WebhookExceptionsFilter = WebhookExceptionsFilter;
exports.WebhookExceptionsFilter =
  WebhookExceptionsFilter =
  WebhookExceptionsFilter_1 =
    tslib_1.__decorate(
      [(0, common_1.Catch)(webhook_errors_1.WebhookError)],
      WebhookExceptionsFilter
    );
//# sourceMappingURL=webhook.filter.js.map
