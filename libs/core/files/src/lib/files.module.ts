import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { MinioModule } from '@nestjs-mod/minio';
import { FilesController } from './controllers/files.controller';
import { FILES_FEATURE, FILES_MODULE } from './files.constants';

export const { FilesModule } = createNestModule({
  moduleName: FILES_MODULE,
  moduleCategory: NestModuleCategory.feature,
  controllers: [FilesController],
  imports: [
    MinioModule.forFeature({
      featureModuleName: FILES_FEATURE,
    }),
  ],
});
