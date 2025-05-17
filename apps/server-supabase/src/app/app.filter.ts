import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import { getText } from 'nestjs-translates';

@Catch(ThrottlerException)
export class AppExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(AppExceptionsFilter.name);

  override catch(exception: ThrottlerException, host: ArgumentsHost) {
    if (exception instanceof ThrottlerException) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: 'THROTTLER-001',
            message: getText('Too Many Requests'),
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
