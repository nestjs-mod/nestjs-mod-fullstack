import { AUTH_FEATURE, AUTH_FOLDER } from '@nestjs-mod-fullstack/auth';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { ValidationModule } from '@nestjs-mod/validation';
import {
  WEBHOOK_FEATURE,
  WEBHOOK_FOLDER,
  WebhookModule,
} from '@nestjs-mod/webhook';
import {
  createNestModule,
  isInfrastructureMode,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { join } from 'path';
import { APP_FEATURE } from './app/app.constants';
import {
  appFolder,
  MainAppModule,
  MainKeyvModule,
  MainMinioModule,
  rootFolder,
} from './environments/environment';
import { terminusHealthCheckModuleForRootAsyncOptions } from './integrations/terminus-health-check-integration.configuration';

export const FEATURE_MODULE_IMPORTS = [
  NestjsPinoLoggerModule.forRoot(),
  TerminusHealthCheckModule.forRootAsync(
    terminusHealthCheckModuleForRootAsyncOptions()
  ),
  PrismaToolsModule.forRoot(),
  PrismaModule.forRoot({
    contextName: APP_FEATURE,
    staticConfiguration: {
      featureName: APP_FEATURE,
      schemaFile: join(
        appFolder,
        'src',
        'prisma',
        `${APP_FEATURE}-${PRISMA_SCHEMA_FILE}`
      ),
      prismaModule: isInfrastructureMode()
        ? import(`@nestjs-mod/prisma`)
        : import(`@prisma/app-client`),
      addMigrationScripts: false,
      binaryTargets:
        process.env.PRISMA_TARGETS !== 'shorts'
          ? [
              'native',
              'rhel-openssl-3.0.x',
              'linux-musl-openssl-3.0.x',
              'linux-musl',
            ]
          : ['native', 'rhel-openssl-3.0.x'],
    },
  }),
  PrismaModule.forRoot({
    contextName: WEBHOOK_FEATURE,
    staticConfiguration: {
      featureName: WEBHOOK_FEATURE,
      schemaFile: join(
        rootFolder,
        WEBHOOK_FOLDER,
        'src',
        'prisma',
        PRISMA_SCHEMA_FILE
      ),
      prismaModule: isInfrastructureMode()
        ? import(`@nestjs-mod/prisma`)
        : import(`@prisma/webhook-client`),
      addMigrationScripts: false,
      nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),

      binaryTargets:
        process.env.PRISMA_TARGETS !== 'shorts'
          ? [
              'native',
              'rhel-openssl-3.0.x',
              'linux-musl-openssl-3.0.x',
              'linux-musl',
            ]
          : ['native', 'rhel-openssl-3.0.x'],
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
      prismaModule: isInfrastructureMode()
        ? import(`@nestjs-mod/prisma`)
        : import(`@prisma/auth-client`),
      addMigrationScripts: false,
      nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),

      binaryTargets:
        process.env.PRISMA_TARGETS !== 'shorts'
          ? [
              'native',
              'rhel-openssl-3.0.x',
              'linux-musl-openssl-3.0.x',
              'linux-musl',
            ]
          : ['native', 'rhel-openssl-3.0.x'],
    },
  }),
  MainKeyvModule,
  MainMinioModule,
  ValidationModule.forRoot({ staticEnvironments: { usePipes: false } }),
  MainAppModule,
  WebhookModule.forRootAsync({
    configuration: {
      syncMode: true,
    },
  }),
];

export const { FeatureModule } = createNestModule({
  moduleName: 'FeatureModule',
  imports: FEATURE_MODULE_IMPORTS,
});
