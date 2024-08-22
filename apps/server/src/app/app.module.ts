import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    PrismaModule.forFeature({ featureModuleName: 'app' }),
    ...(process.env.DISABLE_SERVE_STATIC ? [] : [ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'browser'),
    })])
  ],
  controllers: [AppController],
  providers: [AppService],
});
