import { FindManyArgs } from '@nestjs-mod-fullstack/common';
import { ConfigModel } from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';
import { basename } from 'path';
import { PrismaToolsEnvironments } from './prisma-tools.environments';
import {
  DATABASE_ERROR_ENUM_TITLES,
  DatabaseErrorEnum,
} from './prisma-tools.errors';

@ConfigModel()
export class PrismaToolsService {
  private logger = new Logger(PrismaToolsService.name);

  constructor(
    private readonly prismaToolsEnvironments: PrismaToolsEnvironments
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
          this.logger.debug({
            modelName: exception.meta?.['modelName'],
            relatedTable,
          });

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

        this.logger.debug({ ...exception });

        return {
          message:
            DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.DATABASE_QUERY_ERROR],
          stacktrace,
          code: DatabaseErrorEnum.DATABASE_QUERY_ERROR,
          metadata: exception?.meta,
          originalError,
        };
      } else {
        console.log({ ...exception });
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
      this.prismaToolsEnvironments.paginationInitialPage ||
      1
    );
    const perPage = +(
      args.perPage ||
      defaultOptions?.defaultPerPage ||
      this.prismaToolsEnvironments.paginationPerPage ||
      5
    );
    const skip = +curPage === 1 ? 0 : +perPage * +curPage - +perPage;

    return { take: perPage, skip, curPage, perPage };
  }
}
