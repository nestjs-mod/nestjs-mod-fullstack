'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.FilesError =
  exports.FILES_ERROR_ENUM_TITLES =
  exports.FilesErrorEnum =
    void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const nestjs_translates_1 = require('nestjs-translates');
var FilesErrorEnum;
(function (FilesErrorEnum) {
  FilesErrorEnum['COMMON'] = 'FILES-000';
  FilesErrorEnum['FORBIDDEN'] = 'FILES-001';
})(FilesErrorEnum || (exports.FilesErrorEnum = FilesErrorEnum = {}));
exports.FILES_ERROR_ENUM_TITLES = {
  [FilesErrorEnum.COMMON]: (0, nestjs_translates_1.getText)('Files error'),
  [FilesErrorEnum.FORBIDDEN]: (0, nestjs_translates_1.getText)('Forbidden'),
};
class FilesError extends Error {
  constructor(message, code, metadata) {
    const messageAsCode = Boolean(
      message && Object.values(FilesErrorEnum).includes(message)
    );
    const preparedCode = messageAsCode ? message : code;
    const preparedMessage = preparedCode
      ? exports.FILES_ERROR_ENUM_TITLES[preparedCode]
      : message;
    code = preparedCode || FilesErrorEnum.COMMON;
    message = preparedMessage || exports.FILES_ERROR_ENUM_TITLES[code];
    super(message);
    this.code = FilesErrorEnum.COMMON;
    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
exports.FilesError = FilesError;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: String,
      description: Object.entries(exports.FILES_ERROR_ENUM_TITLES)
        .map(([key, value]) => `${value} (${key})`)
        .join(', '),
      example: exports.FILES_ERROR_ENUM_TITLES[FilesErrorEnum.COMMON],
    }),
    tslib_1.__metadata('design:type', String),
  ],
  FilesError.prototype,
  'message',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: FilesErrorEnum,
      enumName: 'FilesErrorEnum',
      example: FilesErrorEnum.COMMON,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  FilesError.prototype,
  'code',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ type: Object }),
    tslib_1.__metadata('design:type', Object),
  ],
  FilesError.prototype,
  'metadata',
  void 0
);
//# sourceMappingURL=files.errors.js.map
