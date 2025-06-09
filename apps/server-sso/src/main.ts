process.env.TZ = 'UTC';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
import { AUTH_EXTRA_MODELS } from '@nestjs-mod-fullstack/auth';
import {
  bootstrapNestApplication,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  isInfrastructureMode,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
} from '@nestjs-mod/common';
import { FILES_EXTRA_MODELS } from '@nestjs-mod/files';
import { VALIDATION_EXTRA_MODELS } from '@nestjs-mod/validation';
import { WEBHOOK_EXTRA_MODELS } from '@nestjs-mod/webhook';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { writeFileSync } from 'fs';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import {
  createAndFillDatabases,
  fillAllNeedDatabaseEnvsFromOneMain,
} from './create-and-fill-databases';
import { appFolder, rootFolder } from './environments/environment';
import { FEATURE_MODULE_IMPORTS, FeatureModule } from './feature.module';
import { INFRASTRUCTURE_MODULE_IMPORTS } from './infrastructure.module';
import { replaceEnvs } from './replace-envs';

fillAllNeedDatabaseEnvsFromOneMain();

if (!isInfrastructureMode() && process.env.APP_TYPE === 'nestjs') {
  /**
   * NestJS way for run application
   */
  (async function bootstrap() {
    // copy nestjs-mod environments to nestjs environments, without prefix "SERVER_"
    const dm = 'SERVER_SSO_';
    for (const key of Object.keys(process.env)) {
      const arr = key.split(dm);
      if (arr.length > 0 && !arr[0]) {
        const shortKey = arr.splice(1).join(dm);
        process.env[shortKey] = process.env[key];
      }
    }

    const app = await NestFactory.create(FeatureModule.forRoot(), {
      cors: {
        credentials: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        origin: (req: any, callback: (arg0: null, arg1: boolean) => void) => {
          callback(null, true);
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
    });

    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useWebSocketAdapter(new WsAdapter(app));

    const swaggerConf = new DocumentBuilder().addBearerAuth().build();
    const document = SwaggerModule.createDocument(app, swaggerConf, {
      extraModels: [
        ...AUTH_EXTRA_MODELS,
        ...FILES_EXTRA_MODELS,
        ...VALIDATION_EXTRA_MODELS,
        ...WEBHOOK_EXTRA_MODELS,
      ],
    });
    SwaggerModule.setup('swagger', app, document);

    if (isInfrastructureMode()) {
      writeFileSync(
        join(rootFolder, 'app-swagger.json'),
        JSON.stringify(document)
      );
    } else {
      await replaceEnvs();
      await createAndFillDatabases();

      const logger = app.get(Logger);
      if (logger) {
        app.useLogger(logger);
        app.flushLogs();
      }

      if (!process.env['PORT']) {
        throw Error('port not set');
      }
      await app.listen(process.env['PORT']);
    }
  })();
} else {
  /**
   * NestJS-mod way for run application
   */
  bootstrapNestApplication({
    project: {
      name: 'server-sso',
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
                options.app.use(cookieParser());

                const swaggerConf = new DocumentBuilder()
                  .addBearerAuth()
                  .build();
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
                } else {
                  await replaceEnvs();
                  await createAndFillDatabases();
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
}
