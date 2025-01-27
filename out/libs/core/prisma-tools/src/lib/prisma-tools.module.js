"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaToolsModule = void 0;
const common_1 = require("@nestjs-mod/common");
const prisma_tools_constants_1 = require("./prisma-tools.constants");
const prisma_tools_environments_1 = require("./prisma-tools.environments");
const prisma_tools_service_1 = require("./prisma-tools.service");
const core_1 = require("@nestjs/core");
const prisma_tools_filter_1 = require("./prisma-tools.filter");
exports.PrismaToolsModule = (0, common_1.createNestModule)({
    moduleName: prisma_tools_constants_1.PRISMA_TOOLS_MODULE,
    environmentsModel: prisma_tools_environments_1.PrismaToolsEnvironments,
    moduleCategory: common_1.NestModuleCategory.core,
    providers: [{ provide: core_1.APP_FILTER, useClass: prisma_tools_filter_1.PrismaToolsExceptionsFilter }],
    sharedProviders: [prisma_tools_service_1.PrismaToolsService],
}).PrismaToolsModule;
//# sourceMappingURL=prisma-tools.module.js.map