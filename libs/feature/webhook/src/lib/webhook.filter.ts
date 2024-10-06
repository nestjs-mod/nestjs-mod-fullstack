import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WebhookError } from './webhook.errors';

@Catch()
export class WebhookExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(WebhookExceptionsFilter.name);

  override catch(exception: WebhookError | HttpException, host: ArgumentsHost) {
    if (exception instanceof WebhookError) {
      super.catch(
        new HttpException(
          {
            code: exception.code,
            message: exception.message,
            metadata: exception.metadata,
          },
          HttpStatus.BAD_REQUEST
        ),
        host
      );
    } else {
      this.logger.error(exception, exception.stack);
      super.catch(exception, host);
    }
  }
}
