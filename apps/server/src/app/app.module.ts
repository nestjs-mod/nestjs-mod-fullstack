import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@nestjs-mod/prisma';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [PrismaModule.forFeature({ featureModuleName: 'app' })],
  controllers: [AppController],
  providers: [AppService],
});
