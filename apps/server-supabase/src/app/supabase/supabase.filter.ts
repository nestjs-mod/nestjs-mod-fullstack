import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SupabaseStaticEnvironments } from './supabase.environments';
import { SupabaseError, SupabaseErrorEnum } from './supabase.errors';

@Catch(SupabaseError)
export class SupabaseExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(SupabaseExceptionsFilter.name);

  constructor(
    private readonly supabaseStaticEnvironments: SupabaseStaticEnvironments
  ) {
    super();
  }

  override catch(exception: SupabaseError, host: ArgumentsHost) {
    if (!this.supabaseStaticEnvironments.useFilters) {
      super.catch(exception, host);
      return;
    }
    if (exception instanceof SupabaseError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: SupabaseErrorEnum.FORBIDDEN,
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
