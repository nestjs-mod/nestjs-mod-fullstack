'use strict';
var PrismaToolsExceptionsFilter_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PrismaToolsExceptionsFilter = void 0;
const tslib_1 = require('tslib');
const common_1 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const prisma_tools_environments_1 = require('./prisma-tools.environments');
const prisma_tools_service_1 = require('./prisma-tools.service');
let PrismaToolsExceptionsFilter =
  (PrismaToolsExceptionsFilter_1 = class PrismaToolsExceptionsFilter extends (
    core_1.BaseExceptionFilter
  ) {
    constructor(prismaToolsService, prismaToolsEnvironments) {
      super();
      this.prismaToolsService = prismaToolsService;
      this.prismaToolsEnvironments = prismaToolsEnvironments;
      this.logger = new common_1.Logger(PrismaToolsExceptionsFilter_1.name);
    }
    catch(exception, host) {
      if (!this.prismaToolsEnvironments.useFilters) {
        super.catch(exception, host);
        return;
      }
      const parsedException =
        this.prismaToolsService.convertPrismaErrorToDbError(exception);
      if (parsedException) {
        super.catch(
          new common_1.HttpException(
            parsedException,
            common_1.HttpStatus.BAD_REQUEST
          ),
          host
        );
      } else {
        this.logger.error(exception, exception.stack);
        super.catch(exception, host);
      }
    }
  });
exports.PrismaToolsExceptionsFilter = PrismaToolsExceptionsFilter;
exports.PrismaToolsExceptionsFilter =
  PrismaToolsExceptionsFilter =
  PrismaToolsExceptionsFilter_1 =
    tslib_1.__decorate(
      [
        (0, common_1.Catch)(),
        tslib_1.__metadata('design:paramtypes', [
          prisma_tools_service_1.PrismaToolsService,
          prisma_tools_environments_1.PrismaToolsEnvironments,
        ]),
      ],
      PrismaToolsExceptionsFilter
    );
//# sourceMappingURL=prisma-tools.filter.js.map
