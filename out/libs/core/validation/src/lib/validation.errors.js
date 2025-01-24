'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ValidationError =
  exports.ValidationErrorMetadata =
  exports.ValidationErrorMetadataConstraint =
  exports.VALIDATION_ERROR_ENUM_TITLES =
  exports.ValidationErrorEnum =
    void 0;
const tslib_1 = require('tslib');
const swagger_1 = require('@nestjs/swagger');
const nestjs_translates_1 = require('nestjs-translates');
var ValidationErrorEnum;
(function (ValidationErrorEnum) {
  ValidationErrorEnum['COMMON'] = 'VALIDATION-000';
})(
  ValidationErrorEnum ||
    (exports.ValidationErrorEnum = ValidationErrorEnum = {})
);
exports.VALIDATION_ERROR_ENUM_TITLES = {
  [ValidationErrorEnum.COMMON]: (0, nestjs_translates_1.getText)(
    'Validation error'
  ),
};
class ValidationErrorMetadataConstraint {
  constructor(options) {
    Object.assign(this, options);
  }
}
exports.ValidationErrorMetadataConstraint = ValidationErrorMetadataConstraint;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: String,
    }),
    tslib_1.__metadata('design:type', String),
  ],
  ValidationErrorMetadataConstraint.prototype,
  'name',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: String,
    }),
    tslib_1.__metadata('design:type', String),
  ],
  ValidationErrorMetadataConstraint.prototype,
  'description',
  void 0
);
class ValidationErrorMetadata {
  constructor(options) {
    Object.assign(this, options);
  }
  static fromClassValidatorValidationErrors(errors) {
    return errors?.map(
      (error) =>
        new ValidationErrorMetadata({
          property: error.property,
          constraints: Object.entries(error.constraints || {}).map(
            ([key, value]) =>
              new ValidationErrorMetadataConstraint({
                name: key,
                description: value,
              })
          ),
          ...(error.children?.length
            ? {
                children: this.fromClassValidatorValidationErrors(
                  error.children
                ),
              }
            : {}),
        })
    );
  }
}
exports.ValidationErrorMetadata = ValidationErrorMetadata;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: String,
    }),
    tslib_1.__metadata('design:type', String),
  ],
  ValidationErrorMetadata.prototype,
  'property',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: () => ValidationErrorMetadataConstraint,
      isArray: true,
    }),
    tslib_1.__metadata('design:type', Array),
  ],
  ValidationErrorMetadata.prototype,
  'constraints',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      type: () => ValidationErrorMetadata,
      isArray: true,
    }),
    tslib_1.__metadata('design:type', Array),
  ],
  ValidationErrorMetadata.prototype,
  'children',
  void 0
);
class ValidationError extends Error {
  constructor(message, code, metadata) {
    const messageAsCode = Boolean(
      message && Object.values(ValidationErrorEnum).includes(message)
    );
    const preparedCode = messageAsCode ? message : code;
    const preparedMessage = preparedCode
      ? exports.VALIDATION_ERROR_ENUM_TITLES[preparedCode]
      : message;
    code = preparedCode || ValidationErrorEnum.COMMON;
    message = preparedMessage || exports.VALIDATION_ERROR_ENUM_TITLES[code];
    super(message);
    this.code = ValidationErrorEnum.COMMON;
    this.code = code;
    this.message = message;
    this.metadata =
      ValidationErrorMetadata.fromClassValidatorValidationErrors(metadata);
  }
}
exports.ValidationError = ValidationError;
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      type: String,
      description: Object.entries(exports.VALIDATION_ERROR_ENUM_TITLES)
        .map(([key, value]) => `${value} (${key})`)
        .join(', '),
      example: exports.VALIDATION_ERROR_ENUM_TITLES[ValidationErrorEnum.COMMON],
    }),
    tslib_1.__metadata('design:type', String),
  ],
  ValidationError.prototype,
  'message',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiProperty)({
      enum: ValidationErrorEnum,
      enumName: 'ValidationErrorEnum',
      example: ValidationErrorEnum.COMMON,
    }),
    tslib_1.__metadata('design:type', Object),
  ],
  ValidationError.prototype,
  'code',
  void 0
);
tslib_1.__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      type: ValidationErrorMetadata,
      isArray: true,
    }),
    tslib_1.__metadata('design:type', Array),
  ],
  ValidationError.prototype,
  'metadata',
  void 0
);
//# sourceMappingURL=validation.errors.js.map
