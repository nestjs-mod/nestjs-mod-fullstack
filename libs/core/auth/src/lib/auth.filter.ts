import { AuthorizerError } from '@nestjs-mod/authorizer';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AuthErrorEnum } from './auth.errors';

@Catch(AuthorizerError)
export class AuthExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(AuthExceptionsFilter.name);

  override catch(exception: AuthorizerError, host: ArgumentsHost) {
    if (exception instanceof AuthorizerError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: AuthErrorEnum.FORBIDDEN,
            message: exception.message,
          },
          HttpStatus.BAD_REQUEST
        ),
        host
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(exception, (exception as any)?.stack);
      super.catch(exception, host);
    }
  }
}
