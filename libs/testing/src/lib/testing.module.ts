import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { TestingConfiguration } from './testing.configuration';
import { TestingEnvironments } from './testing.environments';
import { TESTING_MODULE } from './testing.constants';

export const { TestingModule } = createNestModule({
  moduleName: TESTING_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: TestingConfiguration,
  environmentsModel: TestingEnvironments,
  controllers: [],
  sharedProviders: [],
});
