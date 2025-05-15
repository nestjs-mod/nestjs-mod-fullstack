import { AUTH_FEATURE, AUTH_FOLDER } from '@nestjs-mod-fullstack/auth';
import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod-fullstack/webhook';
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
import { join } from 'path';
import { APP_FEATURE } from './app/app.constants';
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
      applicationScriptFile: join('dist/apps/server-supabase/main.js'),
    },
  }),
  DockerCompose.forRoot({
    configuration: {
      dockerComposeFileVersion: '3',
      dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
    },
  }),
  DockerComposePostgreSQL.forRoot(),
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
  //
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: WEBHOOK_FEATURE,
    featureConfiguration: {
      nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
    },
  }),
  PgFlyway.forRoot({
    staticConfiguration: {
      featureName: WEBHOOK_FEATURE,
      migrationsFolder: join(rootFolder, WEBHOOK_FOLDER, 'src', 'migrations'),
      nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
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
  ...MAIN_INFRASTRUCTURE_MODULES,
];
