import { FindManyArgs } from '@nestjs-mod-fullstack/common';
import { PrismaToolsEnvironments } from './prisma-tools.environments';
import { DatabaseErrorEnum } from './prisma-tools.errors';
export declare class PrismaToolsService {
  private readonly prismaToolsEnvironments;
  private logger;
  constructor(prismaToolsEnvironments: PrismaToolsEnvironments);
  convertPrismaErrorToDbError(exception: any):
    | {
        message: string;
        stacktrace: string;
        code: DatabaseErrorEnum;
        metadata: any;
        originalError: Error & {
          stack: string;
        };
      }
    | {
        message: string;
        code: DatabaseErrorEnum;
        metadata: any;
        stacktrace?: undefined;
        originalError?: undefined;
      }
    | null;
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
  };
}
