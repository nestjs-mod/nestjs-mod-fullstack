import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod-fullstack/webhook';
import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposePostgreSQL,
} from '@nestjs-mod/docker-compose';
import { FLYWAY_JS_CONFIG_FILE, Flyway } from '@nestjs-mod/flyway';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import {
  FakePrismaClient,
  PRISMA_SCHEMA_FILE,
  PrismaModule,
} from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app/app.module';

const appFeatureName = 'app';
const rootFolder = join(__dirname, '..', '..', '..');

let appFolder = join(rootFolder, 'apps', 'server');

if (!existsSync(join(appFolder, PACKAGE_JSON_FILE))) {
  appFolder = join(rootFolder, 'dist', 'apps', 'server');
}

bootstrapNestApplication({
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
          packageJsonFile: join(rootFolder, PACKAGE_JSON_FILE),
          nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),
          envFile: join(rootFolder, '.env'),
        },
      }),
      DefaultNestApplicationInitializer.forRoot({
        staticConfiguration: { bufferLogs: true },
      }),
      NestjsPinoLoggerModule.forRoot(),
      TerminusHealthCheckModule.forRootAsync({
        configurationFactory: (
          memoryHealthIndicator: MemoryHealthIndicator
        ) => ({
          standardHealthIndicators: [
            {
              name: 'memory_heap',
              check: () =>
                memoryHealthIndicator.checkHeap(
                  'memory_heap',
                  150 * 1024 * 1024
                ),
            },
          ],
        }),
        inject: [MemoryHealthIndicator],
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
                swaggerConf
              );
              SwaggerModule.setup('swagger', options.app, document);
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
    core: [
      PrismaModule.forRoot({
        staticConfiguration: {
          schemaFile: join(
            appFolder,
            'src',
            'prisma',
            `${appFeatureName}-${PRISMA_SCHEMA_FILE}`
          ),
          featureName: appFeatureName,
          prismaModule: isInfrastructureMode()
            ? { PrismaClient: FakePrismaClient }
            : import(`@prisma/app-client`),
          addMigrationScripts: false,
        },
      }),
      PrismaModule.forRoot({
        staticConfiguration: {
          schemaFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            'src',
            'prisma',
            PRISMA_SCHEMA_FILE
          ),
          featureName: WEBHOOK_FEATURE,
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@nestjs-mod-fullstack/webhook`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),
        },
      }),
    ],
    feature: [AppModule.forRoot()],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
        },
      }),
      Pm2.forRoot({
        configuration: {
          ecosystemConfigFile: join(rootFolder, ECOSYSTEM_CONFIG_FILE),
          applicationScriptFile: join('dist/apps/server/main.js'),
        },
      }),
      DockerCompose.forRoot({
        configuration: {
          dockerComposeFileVersion: '3',
          dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
        },
      }),
      DockerComposePostgreSQL.forRoot(),
      DockerComposePostgreSQL.forFeature({
        featureModuleName: appFeatureName,
      }),
      Flyway.forRoot({
        staticConfiguration: {
          featureName: appFeatureName,
          migrationsFolder: join(appFolder, 'src', 'migrations'),
          configFile: join(rootFolder, FLYWAY_JS_CONFIG_FILE),
        },
      }),
      DockerComposePostgreSQL.forFeatureAsync({
        featureModuleName: WEBHOOK_FEATURE,
        featureConfiguration: {
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),
        },
      }),
      Flyway.forRoot({
        staticConfiguration: {
          featureName: WEBHOOK_FEATURE,
          migrationsFolder: join(
            rootFolder,
            WEBHOOK_FOLDER,
            'src',
            'migrations'
          ),
          configFile: join(rootFolder, FLYWAY_JS_CONFIG_FILE),
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),
        },
      }),
    ],
  },
});
