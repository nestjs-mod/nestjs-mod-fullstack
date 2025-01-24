'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CurrentFilesRequest = void 0;
const common_1 = require('@nestjs-mod/common');
const common_2 = require('@nestjs/common');
exports.CurrentFilesRequest = (0, common_2.createParamDecorator)(
  (_data, ctx) => {
    const req = (0, common_1.getRequestFromExecutionContext)(ctx);
    return req;
  }
);
//# sourceMappingURL=files.decorators.js.map
