import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AuthStaticEnvironments } from './auth.environments';
import { AuthError, AuthErrorEnum } from './auth.errors';

@Catch(AuthError)
export class AuthExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(AuthExceptionsFilter.name);

  constructor(private readonly authStaticEnvironments: AuthStaticEnvironments) {
    super();
  }

  override catch(exception: AuthError, host: ArgumentsHost) {
    if (!this.authStaticEnvironments.useFilters) {
      super.catch(exception, host);
      return;
    }
    if (exception instanceof AuthError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: AuthErrorEnum.FORBIDDEN,
            message: exception.message,
          },
          HttpStatus.BAD_REQUEST,
        ),
        host,
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(exception, (exception as any)?.stack);
      super.catch(exception, host);
    }
  }
}
