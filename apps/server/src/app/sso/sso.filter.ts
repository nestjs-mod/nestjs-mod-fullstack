import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoError, SsoErrorEnum } from './sso.errors';

@Catch(SsoError)
export class SsoExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(SsoExceptionsFilter.name);

  constructor(private readonly ssoStaticEnvironments: SsoStaticEnvironments) {
    super();
  }

  override catch(exception: SsoError, host: ArgumentsHost) {
    if (!this.ssoStaticEnvironments.useFilters) {
      super.catch(exception, host);
      return;
    }
    if (exception instanceof SsoError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: SsoErrorEnum.FORBIDDEN,
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
