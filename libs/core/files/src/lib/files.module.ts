import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { FilesController } from './controllers/files.controller';
import { FilesConfiguration } from './files.configuration';
import { FILES_MODULE } from './files.constants';
import { FilesEnvironments } from './files.environments';

export const { FilesModule } = createNestModule({
  moduleName: FILES_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: FilesConfiguration,
  environmentsModel: FilesEnvironments,
  controllers: [FilesController],
});
