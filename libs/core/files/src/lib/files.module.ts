import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { FilesController } from './controllers/files.controller';
import { FilesConfiguration } from './files.configuration';
import { FILES_FEATURE, FILES_MODULE } from './files.constants';
import { FilesEnvironments } from './files.environments';

export const { FilesModule } = createNestModule({
  moduleName: FILES_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: FilesConfiguration,
  staticEnvironmentsModel: FilesEnvironments,
  controllers: [FilesController],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(FILES_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: FILES_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
