import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    PrismaModule.forFeature({ featureModuleName: 'app' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets', 'client'),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
});
