import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationError as CvValidationError } from 'class-validator';
import { getText } from 'nestjs-translates';

export enum ValidationErrorEnum {
  COMMON = 'VALIDATION-000',
}

export const VALIDATION_ERROR_ENUM_TITLES: Record<ValidationErrorEnum, string> =
  {
    [ValidationErrorEnum.COMMON]: getText('Validation error'),
  };

export class ValidationErrorMetadataConstraint {
  @ApiProperty({
    type: String,
  })
  name!: string;

  @ApiProperty({
    type: String,
  })
  description!: string;

  constructor(options?: ValidationErrorMetadataConstraint) {
    Object.assign(this, options);
  }
}

export class ValidationErrorMetadata {
  @ApiProperty({
    type: String,
  })
  property!: string;

  @ApiProperty({
    type: () => ValidationErrorMetadataConstraint,
    isArray: true,
  })
  constraints!: ValidationErrorMetadataConstraint[];

  @ApiPropertyOptional({
    type: () => ValidationErrorMetadata,
    isArray: true,
  })
  children?: ValidationErrorMetadata[];

  constructor(options?: ValidationErrorMetadata) {
    Object.assign(this, options);
  }

  static fromClassValidatorValidationErrors(
    errors?: CvValidationError[]
  ): ValidationErrorMetadata[] | undefined {
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

export class ValidationError extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(VALIDATION_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: VALIDATION_ERROR_ENUM_TITLES[ValidationErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: ValidationErrorEnum,
    enumName: 'ValidationErrorEnum',
    example: ValidationErrorEnum.COMMON,
  })
  code = ValidationErrorEnum.COMMON;

  @ApiPropertyOptional({ type: ValidationErrorMetadata, isArray: true })
  metadata?: ValidationErrorMetadata[];

  constructor(
    message?: string | ValidationErrorEnum,
    code?: ValidationErrorEnum,
    metadata?: CvValidationError[]
  ) {
    const messageAsCode = Boolean(
      message &&
        Object.values(ValidationErrorEnum).includes(
          message as ValidationErrorEnum
        )
    );
    const preparedCode = messageAsCode
      ? (message as ValidationErrorEnum)
      : code;
    const preparedMessage =
      messageAsCode && preparedCode
        ? VALIDATION_ERROR_ENUM_TITLES[preparedCode]
        : message;

    code = preparedCode || ValidationErrorEnum.COMMON;
    message = preparedMessage || VALIDATION_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata =
      ValidationErrorMetadata.fromClassValidatorValidationErrors(metadata);
  }
}
