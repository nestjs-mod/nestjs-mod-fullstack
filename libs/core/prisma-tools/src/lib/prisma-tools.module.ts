import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import {
  PRISMA_TOOLS_FEATURE,
  PRISMA_TOOLS_MODULE,
} from './prisma-tools.constants';
import { PrismaToolsStaticEnvironments } from './prisma-tools.environments';
import { PrismaToolsService } from './prisma-tools.service';
import { APP_FILTER } from '@nestjs/core';
import { PrismaToolsExceptionsFilter } from './prisma-tools.filter';

export const { PrismaToolsModule } = createNestModule({
  moduleName: PRISMA_TOOLS_MODULE,
  staticEnvironmentsModel: PrismaToolsStaticEnvironments,
  moduleCategory: NestModuleCategory.core,
  providers: [{ provide: APP_FILTER, useClass: PrismaToolsExceptionsFilter }],
  sharedProviders: [PrismaToolsService],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass =
      getFeatureDotEnvPropertyNameFormatter(PRISMA_TOOLS_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: PRISMA_TOOLS_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
