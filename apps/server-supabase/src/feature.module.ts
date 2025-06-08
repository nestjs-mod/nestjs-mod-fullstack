import {
  AUTH_FEATURE,
  AUTH_FOLDER,
  AuthPrismaSdk,
} from '@nestjs-mod-fullstack/auth';
import { createNestModule } from '@nestjs-mod/common';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { ValidationModule } from '@nestjs-mod/validation';
import { WebhookModule } from '@nestjs-mod/webhook';
import { PrismaPg } from '@prisma/adapter-pg';
import { join } from 'path';
import { APP_FEATURE } from './app/app.constants';
import { AppPrismaSdk } from './app/app.prisma-sdk';
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
      provider: 'prisma-client',
      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new AppPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      moduleFormat: 'cjs',
    },
  }),
  PrismaModule.forRoot({
    contextName: AUTH_FEATURE,
    staticConfiguration: {
      addMigrationScripts: false,
      featureName: AUTH_FEATURE,
      schemaFile: join(
        rootFolder,
        AUTH_FOLDER,
        'src',
        'prisma',
        PRISMA_SCHEMA_FILE
      ),
      provider: 'prisma-client',
      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new AuthPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      moduleFormat: 'cjs',
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
