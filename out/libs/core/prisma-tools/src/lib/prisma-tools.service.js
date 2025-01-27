"use strict";
var PrismaToolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaToolsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
const common_2 = require("@nestjs/common");
const path_1 = require("path");
const prisma_tools_environments_1 = require("./prisma-tools.environments");
const prisma_tools_errors_1 = require("./prisma-tools.errors");
let PrismaToolsService = PrismaToolsService_1 = class PrismaToolsService {
    constructor(prismaToolsEnvironments) {
        this.prismaToolsEnvironments = prismaToolsEnvironments;
        this.logger = new common_2.Logger(PrismaToolsService_1.name);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convertPrismaErrorToDbError(exception) {
        try {
            const stacktrace = String(exception?.stack)
                .split(`${__dirname}/webpack:/${(0, path_1.basename)(__dirname)}/`)
                .join('');
            const originalError = Object.assign(new Error(), { stack: stacktrace });
            if (String(exception?.name).startsWith('PrismaClient') ||
                String(exception?.code).startsWith('P')) {
                if (exception?.code === 'P2002') {
                    return {
                        message: prisma_tools_errors_1.DATABASE_ERROR_ENUM_TITLES[prisma_tools_errors_1.DatabaseErrorEnum.UNIQUE_ERROR],
                        stacktrace,
                        code: prisma_tools_errors_1.DatabaseErrorEnum.UNIQUE_ERROR,
                        metadata: exception?.meta,
                        originalError,
                    };
                }
                if (exception?.code === 'P2025') {
                    if (exception.meta?.['cause'] === 'Record to update not found.') {
                        return {
                            message: prisma_tools_errors_1.DATABASE_ERROR_ENUM_TITLES[prisma_tools_errors_1.DatabaseErrorEnum.INVALID_IDENTIFIER],
                            stacktrace,
                            code: prisma_tools_errors_1.DatabaseErrorEnum.INVALID_IDENTIFIER,
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
                        message: prisma_tools_errors_1.DATABASE_ERROR_ENUM_TITLES[prisma_tools_errors_1.DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER],
                        stacktrace,
                        code: prisma_tools_errors_1.DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER,
                        metadata: exception?.meta,
                        originalError,
                    };
                }
                this.logger.error(exception, exception.stack);
                return {
                    message: prisma_tools_errors_1.DATABASE_ERROR_ENUM_TITLES[prisma_tools_errors_1.DatabaseErrorEnum.DATABASE_QUERY_ERROR],
                    stacktrace,
                    code: prisma_tools_errors_1.DatabaseErrorEnum.DATABASE_QUERY_ERROR,
                    metadata: exception?.meta,
                    originalError,
                };
            }
            else {
                console.log({ ...exception });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (err) {
            this.logger.error(err, err.stack);
            return {
                message: prisma_tools_errors_1.DATABASE_ERROR_ENUM_TITLES[prisma_tools_errors_1.DatabaseErrorEnum.UNHANDLED_ERROR],
                code: prisma_tools_errors_1.DatabaseErrorEnum.UNHANDLED_ERROR,
                metadata: exception?.meta,
            };
        }
        return null;
    }
    getFirstSkipFromCurPerPage(args, defaultOptions) {
        const curPage = +(args.curPage ||
            defaultOptions?.defaultCurPage ||
            this.prismaToolsEnvironments.paginationInitialPage ||
            1);
        const perPage = +(args.perPage ||
            defaultOptions?.defaultPerPage ||
            this.prismaToolsEnvironments.paginationPerPage ||
            5);
        const skip = +curPage === 1 ? 0 : +perPage * +curPage - +perPage;
        return { take: perPage, skip, curPage, perPage };
    }
};
exports.PrismaToolsService = PrismaToolsService;
exports.PrismaToolsService = PrismaToolsService = PrismaToolsService_1 = tslib_1.__decorate([
    (0, common_1.ConfigModel)(),
    tslib_1.__metadata("design:paramtypes", [prisma_tools_environments_1.PrismaToolsEnvironments])
], PrismaToolsService);
//# sourceMappingURL=prisma-tools.service.js.map