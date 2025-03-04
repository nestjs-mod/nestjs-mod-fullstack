import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaToolsStaticEnvironments } from './prisma-tools.environments';
import { PrismaToolsService } from './prisma-tools.service';

@Catch()
export class PrismaToolsExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(PrismaToolsExceptionsFilter.name);

  constructor(
    private readonly prismaToolsService: PrismaToolsService,
    private readonly prismaToolsStaticEnvironments: PrismaToolsStaticEnvironments
  ) {
    super();
  }

  override catch(exception: HttpException, host: ArgumentsHost) {
    if (!this.prismaToolsStaticEnvironments.useFilters) {
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
      try {
        this.logger.error(exception, exception.stack);
        super.catch(exception, host);
      } catch (err) {
        super.catch(
          new HttpException(exception.message, HttpStatus.BAD_REQUEST),
          host
        );
      }
    }
  }
}
