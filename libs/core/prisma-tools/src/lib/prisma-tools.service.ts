/* eslint-disable @typescript-eslint/no-explicit-any */
import { FindManyArgs } from '@nestjs-mod/swagger';
import { ConfigModel } from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';
import { basename } from 'path';
import { PrismaToolsStaticEnvironments } from './prisma-tools.environments';
import {
  DATABASE_ERROR_ENUM_TITLES,
  DatabaseErrorEnum,
} from './prisma-tools.errors';

const ERROR_CODE_P2002 = 'P2002';
const ERROR_CODE_P2025 = 'P2025';
const ERROR_SUBSTRING_RECORD_NOT_FOUND = 'NotFoundError';
const ERROR_SUBSTRING_DELETE_RECORD_NOT_FOUND =
  'Record to delete does not exist';
const ERROR_SUBSTRING_UPDATE_RECORD_NOT_FOUND = 'Record to update not found';

@ConfigModel()
export class PrismaToolsService {
  private logger = new Logger(PrismaToolsService.name);

  constructor(
    private readonly prismaToolsStaticEnvironments: PrismaToolsStaticEnvironments
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convertPrismaErrorToDbError(exception: any) {
    try {
      const stacktrace = String(exception?.stack)
        .split(`${__dirname}/webpack:/${basename(__dirname)}/`)
        .join('');
      const originalError = Object.assign(new Error(), { stack: stacktrace });

      if (
        String(exception?.name).startsWith('PrismaClient') ||
        String(exception?.code).startsWith('P')
      ) {
        if (exception?.code === 'P2002') {
          return {
            message: DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.UNIQUE_ERROR],
            stacktrace,
            code: DatabaseErrorEnum.UNIQUE_ERROR,
            metadata: exception?.meta,
            originalError,
          };
        }

        if (exception?.code === 'P2025') {
          if (exception.meta?.['cause'] === 'Record to update not found.') {
            return {
              message:
                DATABASE_ERROR_ENUM_TITLES[
                  DatabaseErrorEnum.INVALID_IDENTIFIER
                ],
              stacktrace,
              code: DatabaseErrorEnum.INVALID_IDENTIFIER,
              metadata: exception?.meta,
              originalError,
            };
          }
          const relatedTable = exception.meta?.['cause'].split(`'`)[1];
          if (relatedTable && exception.meta?.['modelName']) {
            this.logger.debug({
              modelName: exception.meta?.['modelName'],
              relatedTable,
            });
          }

          return {
            message:
              DATABASE_ERROR_ENUM_TITLES[
                DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER
              ],
            stacktrace,
            code: DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER,
            metadata: exception?.meta,
            originalError,
          };
        }

        this.logger.error(exception, exception.stack);

        return {
          message:
            DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.DATABASE_QUERY_ERROR],
          stacktrace,
          code: DatabaseErrorEnum.DATABASE_QUERY_ERROR,
          metadata: exception?.meta,
          originalError,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return {
        message: DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.UNHANDLED_ERROR],
        code: DatabaseErrorEnum.UNHANDLED_ERROR,
        metadata: exception?.meta,
      };
    }
    return null;
  }

  getFirstSkipFromCurPerPage(
    args: FindManyArgs,
    defaultOptions?: {
      defaultCurPage: number;
      defaultPerPage: number;
    }
  ): {
    take: number;
    skip: number;
    curPage: number;
    perPage: number;
  } {
    const curPage = +(
      args.curPage ||
      defaultOptions?.defaultCurPage ||
      this.prismaToolsStaticEnvironments.paginationInitialPage ||
      1
    );
    const perPage = +(
      args.perPage ||
      defaultOptions?.defaultPerPage ||
      this.prismaToolsStaticEnvironments.paginationPerPage ||
      5
    );
    const skip = +curPage === 1 ? 0 : +perPage * +curPage - +perPage;

    return { take: perPage, skip, curPage, perPage };
  }

  isErrorOfRecordNotFound(err: Error): boolean {
    return (
      String(err).includes(ERROR_SUBSTRING_RECORD_NOT_FOUND) ||
      String(err).includes(ERROR_CODE_P2025) ||
      String(err).includes(ERROR_SUBSTRING_DELETE_RECORD_NOT_FOUND) ||
      String(err).includes(ERROR_SUBSTRING_UPDATE_RECORD_NOT_FOUND)
    );
  }

  isErrorOfUniqueField<T>(
    prismaError: { code: string; meta: { target: string[] } },
    field: keyof T,
    error: any,
    defaultError: any = null
  ) {
    return prismaError.code === ERROR_CODE_P2002 &&
      prismaError.meta?.target.includes(field as string)
      ? error
      : defaultError;
  }

  isErrorOfUniqueFields<T>(
    prismaError: { code: string; meta: { target: string[] } },
    fields: (keyof T)[],
    error: any,
    defaultError: any = null
  ) {
    return prismaError.code === ERROR_CODE_P2002 &&
      fields.filter((field) =>
        prismaError.meta?.target.includes(field as string)
      ).length === fields.length
      ? error
      : defaultError;
  }

  isErrorsOfUniqueField<T>(
    prismaError: { code: string; meta: { target: string[] } },
    errors: {
      field: keyof T;
      error: any;
    }[]
  ) {
    const firstError = errors.find((error) =>
      this.isErrorOfUniqueField<T>(prismaError, error.field, true)
    );

    return firstError
      ? this.isErrorOfUniqueField<T>(
          prismaError,
          firstError.field,
          firstError.error
        )
      : prismaError;
  }
}
