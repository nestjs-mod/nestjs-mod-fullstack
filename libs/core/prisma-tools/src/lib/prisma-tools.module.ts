import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { PRISMA_TOOLS_MODULE } from './prisma-tools.constants';
import { PrismaToolsEnvironments } from './prisma-tools.environments';
import { PrismaToolsService } from './prisma-tools.service';
import { APP_FILTER } from '@nestjs/core';
import { PrismaToolsExceptionsFilter } from './prisma-tools.filter';

export const { PrismaToolsModule } = createNestModule({
  moduleName: PRISMA_TOOLS_MODULE,
  environmentsModel: PrismaToolsEnvironments,
  moduleCategory: NestModuleCategory.core,
  providers: [{ provide: APP_FILTER, useClass: PrismaToolsExceptionsFilter }],
  sharedProviders: [PrismaToolsService],
});