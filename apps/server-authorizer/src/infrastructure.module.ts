import {
  AUTH_FEATURE,
  AUTH_FOLDER,
  AuthPrismaSdk,
} from '@nestjs-mod-fullstack/auth';
import { AUTHORIZER_ENV_PREFIX } from '@nestjs-mod/authorizer';
import {
  InfrastructureMarkdownReportGenerator,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeMaildev,
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { join } from 'path';
import { APP_FEATURE } from './app/app.constants';
import { AppPrismaSdk } from './app/app.prisma-sdk';
import {
  appFolder,
  MAIN_INFRASTRUCTURE_MODULES,
  rootFolder,
} from './environments/environment';

export const INFRASTRUCTURE_MODULE_IMPORTS = [
  InfrastructureMarkdownReportGenerator.forRoot({
    staticConfiguration: {
      markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
      skipEmptySettings: true,
      style: 'pretty',
    },
  }),
  Pm2.forRoot({
    configuration: {
      ecosystemConfigFile: join(rootFolder, ECOSYSTEM_CONFIG_FILE),
      applicationScriptFile: join('dist/apps/server-authorizer/main.js'),
    },
  }),
  DockerCompose.forRoot({
    configuration: {
      dockerComposeFileVersion: '3',
      dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
    },
  }),
  DockerComposePostgreSQL.forRoot(),
  DockerComposeRedis.forRoot({
    staticConfiguration: { image: 'bitnami/redis:7.4.1' },
  }),
  DockerComposeMinio.forRoot({
    staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
  }),
  //
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: AUTHORIZER_ENV_PREFIX,
    featureConfiguration: {
      nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),
    },
  }),
  //
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: APP_FEATURE,
    featureConfiguration: {
      nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),
    },
  }),
  PgFlyway.forRoot({
    staticConfiguration: {
      featureName: APP_FEATURE,
      migrationsFolder: join(appFolder, 'src', 'migrations'),
    },
  }),
  PrismaModule.forRoot({
    contextName: APP_FEATURE,
    staticConfiguration: {
      featureName: APP_FEATURE,
      schemaFile: join(appFolder, 'src', 'prisma', `app-${PRISMA_SCHEMA_FILE}`),
      nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),

      provider: 'prisma-client',
      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new AppPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      moduleFormat: 'cjs',
      output: join(appFolder, 'src', 'app', 'generated', 'prisma-client'),
    },
  }),
  //
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: AUTH_FEATURE,
    featureConfiguration: {
      nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
    },
  }),
  PgFlyway.forRoot({
    staticConfiguration: {
      featureName: AUTH_FEATURE,
      migrationsFolder: join(rootFolder, AUTH_FOLDER, 'src', 'migrations'),
      nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
    },
  }),
  PrismaModule.forRoot({
    contextName: AUTH_FEATURE,
    staticConfiguration: {
      featureName: AUTH_FEATURE,
      schemaFile: join(
        rootFolder,
        AUTH_FOLDER,
        'src',
        'prisma',
        PRISMA_SCHEMA_FILE
      ),
      nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),

      provider: 'prisma-client',
      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new AuthPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      moduleFormat: 'cjs',
      output: join(
        rootFolder,
        AUTH_FOLDER,
        'src',
        'lib',
        'generated',
        'prisma-client'
      ),
    },
  }),
  // maildev
  DockerComposeMaildev.forRoot(),
  ...MAIN_INFRASTRUCTURE_MODULES,
];
