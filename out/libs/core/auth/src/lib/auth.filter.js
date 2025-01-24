'use strict';
var AuthExceptionsFilter_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthExceptionsFilter = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const auth_environments_1 = require('./auth.environments');
const auth_errors_1 = require('./auth.errors');
const common_2 = require('@nestjs-mod-fullstack/common');
let AuthExceptionsFilter =
  (AuthExceptionsFilter_1 = class AuthExceptionsFilter extends (
    core_1.BaseExceptionFilter
  ) {
    constructor(authEnvironments) {
      super();
      this.authEnvironments = authEnvironments;
      this.logger = new common_1.Logger(AuthExceptionsFilter_1.name);
    }
    catch(exception, host) {
      if (!this.authEnvironments.useFilters) {
        super.catch(exception, host);
        return;
      }
      if (exception instanceof common_2.SupabaseError) {
        this.logger.error(exception, exception.stack);
        super.catch(
          new common_1.HttpException(
            {
              code: auth_errors_1.AuthErrorEnum.FORBIDDEN,
              message: exception.message,
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
exports.AuthExceptionsFilter = AuthExceptionsFilter;
exports.AuthExceptionsFilter =
  AuthExceptionsFilter =
  AuthExceptionsFilter_1 =
    tslib_1.__decorate(
      [
        (0, common_1.Catch)(common_2.SupabaseError),
        tslib_1.__metadata('design:paramtypes', [
          auth_environments_1.AuthEnvironments,
        ]),
      ],
      AuthExceptionsFilter
    );
//# sourceMappingURL=auth.filter.js.map
