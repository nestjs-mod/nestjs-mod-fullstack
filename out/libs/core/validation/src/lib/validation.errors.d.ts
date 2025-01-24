import { ValidationError as CvValidationError } from 'class-validator';
export declare enum ValidationErrorEnum {
  COMMON = 'VALIDATION-000',
}
export declare const VALIDATION_ERROR_ENUM_TITLES: Record<
  ValidationErrorEnum,
  string
>;
export declare class ValidationErrorMetadataConstraint {
  name: string;
  description: string;
  constructor(options?: ValidationErrorMetadataConstraint);
}
export declare class ValidationErrorMetadata {
  property: string;
  constraints: ValidationErrorMetadataConstraint[];
  children?: ValidationErrorMetadata[];
  constructor(options?: ValidationErrorMetadata);
  static fromClassValidatorValidationErrors(
    errors?: CvValidationError[]
  ): ValidationErrorMetadata[] | undefined;
}
export declare class ValidationError extends Error {
  message: string;
  code: ValidationErrorEnum;
  metadata?: ValidationErrorMetadata[];
  constructor(
    message?: string | ValidationErrorEnum,
    code?: ValidationErrorEnum,
    metadata?: CvValidationError[]
  );
}
