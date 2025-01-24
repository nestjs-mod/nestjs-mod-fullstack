import { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ValidationError } from './validation.errors';
export declare class ValidationExceptionsFilter extends BaseExceptionFilter {
  private logger;
  catch(exception: ValidationError, host: ArgumentsHost): void;
}
