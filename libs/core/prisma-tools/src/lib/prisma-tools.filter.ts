import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaToolsService } from './prisma-tools.service';
import { PrismaToolsEnvironments } from './prisma-tools.environments';

@Catch()
export class PrismaToolsExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(PrismaToolsExceptionsFilter.name);

  constructor(
    private readonly prismaToolsService: PrismaToolsService,
    private readonly prismaToolsEnvironments: PrismaToolsEnvironments
  ) {
    super();
  }

  override catch(exception: HttpException, host: ArgumentsHost) {
    if (!this.prismaToolsEnvironments.useFilters) {
      super.catch(exception, host);
      return;
    }
    const parsedException =
      this.prismaToolsService.convertPrismaErrorToDbError(exception);
    if (parsedException) {
      super.catch(
        new HttpException(parsedException, HttpStatus.BAD_REQUEST),
        host
      );
    } else {
      this.logger.error(exception, exception.stack);
      super.catch(exception, host);
    }
  }
}
