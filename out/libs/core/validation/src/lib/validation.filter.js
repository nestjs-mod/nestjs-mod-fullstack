"use strict";
var ValidationExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationExceptionsFilter = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const validation_errors_1 = require("./validation.errors");
let ValidationExceptionsFilter = ValidationExceptionsFilter_1 = class ValidationExceptionsFilter extends core_1.BaseExceptionFilter {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(ValidationExceptionsFilter_1.name);
    }
    catch(exception, host) {
        if (exception instanceof validation_errors_1.ValidationError) {
            this.logger.error(exception, exception.stack);
            super.catch(new common_1.HttpException({
                code: exception.code,
                message: exception.message,
                metadata: exception.metadata,
            }, common_1.HttpStatus.BAD_REQUEST), host);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.logger.error(exception, exception?.stack);
            super.catch(exception, host);
        }
    }
};
exports.ValidationExceptionsFilter = ValidationExceptionsFilter;
exports.ValidationExceptionsFilter = ValidationExceptionsFilter = ValidationExceptionsFilter_1 = tslib_1.__decorate([
    (0, common_1.Catch)(validation_errors_1.ValidationError)
], ValidationExceptionsFilter);
//# sourceMappingURL=validation.filter.js.map