import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { CommonConfiguration } from './common.configuration';
import { CommonEnvironments } from './common.environments';
import { COMMON_MODULE } from './common.constants';

export const { CommonModule } = createNestModule({
  moduleName: COMMON_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: CommonConfiguration,
  environmentsModel: CommonEnvironments,
  controllers: [],
  sharedProviders: [],
});
