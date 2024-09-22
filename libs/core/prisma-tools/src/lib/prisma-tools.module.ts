import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { PrismaToolsConfiguration } from './prisma-tools.configuration';
import { PrismaToolsEnvironments } from './prisma-tools.environments';
import { PRISMA_TOOLS_MODULE } from './prisma-tools.constants';

export const { PrismaToolsModule } = createNestModule({
  moduleName: PRISMA_TOOLS_MODULE,
  moduleCategory: NestModuleCategory.core,
  configurationModel: PrismaToolsConfiguration,
  environmentsModel: PrismaToolsEnvironments,
  controllers: [],
  sharedProviders: [],
});
