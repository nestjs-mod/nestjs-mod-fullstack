process.env.TZ = 'UTC';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import {
  bootstrapNestApplication,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  isInfrastructureMode,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
} from '@nestjs-mod/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { appFolder, rootFolder } from './environments/environment';
import { FEATURE_MODULE_IMPORTS } from './feature.module';
import { INFRASTRUCTURE_MODULE_IMPORTS } from './infrastructure.module';
import { AUTH_EXTRA_MODELS } from '@nestjs-mod-fullstack/auth';
import { FILES_EXTRA_MODELS } from '@nestjs-mod-fullstack/files';
import { VALIDATION_EXTRA_MODELS } from '@nestjs-mod-fullstack/validation';
import { WEBHOOK_EXTRA_MODELS } from '@nestjs-mod-fullstack/webhook';

bootstrapNestApplication({
  project: {
    name: 'server',
    description: 'Boilerplate for creating application on NestJS and Angular',
  },
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
          packageJsonFile: join(rootFolder, PACKAGE_JSON_FILE),
          nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),
          envFile: join(rootFolder, '.env'),
          printAllApplicationEnvs: true,
        },
      }),
      DefaultNestApplicationInitializer.forRoot({
        staticConfiguration: { bufferLogs: true },
      }),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          // When running in infrastructure mode, the backend server does not start.
          mode: isInfrastructureMode() ? 'silent' : 'listen',
          async preListen(options) {
            if (options.app) {
              options.app.setGlobalPrefix('api');

              const swaggerConf = new DocumentBuilder().addBearerAuth().build();
              const document = SwaggerModule.createDocument(
                options.app,
                swaggerConf,
                {
                  extraModels: [
                    ...AUTH_EXTRA_MODELS,
                    ...FILES_EXTRA_MODELS,
                    ...VALIDATION_EXTRA_MODELS,
                    ...WEBHOOK_EXTRA_MODELS,
                  ],
                }
              );
              SwaggerModule.setup('swagger', options.app, document);

              options.app.useWebSocketAdapter(new WsAdapter(options.app));

              if (isInfrastructureMode()) {
                writeFileSync(
                  join(rootFolder, 'app-swagger.json'),
                  JSON.stringify(document)
                );
              }
            }
          },
        },
      }),
    ],
    feature: FEATURE_MODULE_IMPORTS,
    infrastructure: INFRASTRUCTURE_MODULE_IMPORTS,
  },
});
