import { AUTH_FEATURE, AUTH_FOLDER } from '@nestjs-mod-fullstack/auth';
import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import { ValidationModule } from '@nestjs-mod-fullstack/validation';
import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod-fullstack/webhook';
import {
  createNestModule,
  isInfrastructureMode,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { join } from 'path';
import { APP_FEATURE } from './app/app.constants';
import {
  appFolder,
  AppModule,
  coreModules,
  MainKeyvModule,
  MainMinioModule,
  MainTerminusHealthCheckModule,
  MainWebhookModule,
  rootFolder,
} from './environments/environment';

export const FEATURE_MODULE_IMPORTS = [
  NestjsPinoLoggerModule.forRoot(),
  MainTerminusHealthCheckModule,
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
      binaryTargets: [
        'native',
        'rhel-openssl-3.0.x',
        'linux-musl-openssl-3.0.x',
        'linux-musl',
      ],
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

      binaryTargets: [
        'native',
        'rhel-openssl-3.0.x',
        'linux-musl-openssl-3.0.x',
        'linux-musl',
      ],
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

      binaryTargets: [
        'native',
        'rhel-openssl-3.0.x',
        'linux-musl-openssl-3.0.x',
        'linux-musl',
      ],
    },
  }),
  ...coreModules,
  MainKeyvModule,
  MainMinioModule,
  ValidationModule.forRoot({ staticEnvironments: { usePipes: false } }),
  AppModule.forRoot(),
  MainWebhookModule,
];

export const { FeatureModule } = createNestModule({
  moduleName: 'FeatureModule',
  imports: FEATURE_MODULE_IMPORTS,
});
