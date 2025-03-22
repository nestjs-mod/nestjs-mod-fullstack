import KeyvPostgres from '@keyv/postgres';
import { WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { isInfrastructureMode, PACKAGE_JSON_FILE } from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { existsSync } from 'fs';
import { getText } from 'nestjs-translates';
import { join } from 'path';
import { SupabaseAppModule } from '../app/supabase-app.module';

import { AUTH_FEATURE } from '@nestjs-mod-fullstack/auth';
import { WEBHOOK_FEATURE } from '@nestjs-mod-fullstack/webhook';
import { InjectPrismaClient, PrismaModule } from '@nestjs-mod/prisma';
import {
  TERMINUS_MODULE_NAME,
  TerminusHealthCheckConfiguration,
  TerminusHealthCheckModule,
} from '@nestjs-mod/terminus';
import { Injectable } from '@nestjs/common';
import { MemoryHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { PrismaClient as AuthPrismaClient } from '@prisma/auth-client';
import { PrismaClient as WebhookPrismaClient } from '@prisma/webhook-client';
import { APP_FEATURE } from '../app/app.constants';

let rootFolder = join(__dirname, '..', '..', '..');

if (
  !existsSync(join(rootFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  rootFolder = join(__dirname);
}

let appFolder = join(rootFolder, 'apps', 'server');

if (!existsSync(join(appFolder, PACKAGE_JSON_FILE))) {
  appFolder = join(rootFolder, 'dist', 'apps', 'server');
}

if (
  !existsSync(join(appFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  appFolder = join(__dirname);
}

export { appFolder, rootFolder };

export const AppModule = SupabaseAppModule;

export const MainKeyvModule = KeyvModule.forRoot({
  staticConfiguration: {
    storeFactoryByEnvironmentUrl: (uri) => {
      return isInfrastructureMode()
        ? undefined
        : [new KeyvPostgres({ uri }), { table: 'cache' }];
    },
  },
});

export const MainMinioModule = MinioModule.forRoot({
  staticConfiguration: { region: 'eu-central-1' },
  staticEnvironments: {
    minioUseSSL: 'true',
  },
});

export const MainWebhookModule = WebhookModule.forRootAsync({
  staticEnvironments: {
    searchUserIdInHeaders: false,
    searchTenantIdInHeaders: false,
  },
  configuration: {
    syncMode: true,
    events: [
      {
        eventName: 'app-demo.create',
        description: getText('Event that will be triggered after creation'),
        example: {
          id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
          name: 'demo name',
          createdAt: '2024-10-02T18:49:07.992Z',
          updatedAt: '2024-10-02T18:49:07.992Z',
        },
      },
      {
        eventName: 'app-demo.update',
        description: getText('Event that will trigger after the update'),
        example: {
          id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
          name: 'demo name',
          createdAt: '2024-10-02T18:49:07.992Z',
          updatedAt: '2024-10-02T18:49:07.992Z',
        },
      },
      {
        eventName: 'app-demo.delete',
        description: getText('Event that will fire after deletion'),
        example: {
          id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
          name: 'demo name',
          createdAt: '2024-10-02T18:49:07.992Z',
          updatedAt: '2024-10-02T18:49:07.992Z',
        },
      },
    ],
  },
});

@Injectable()
export class PrismaTerminusHealthCheckConfiguration
  implements TerminusHealthCheckConfiguration
{
  standardHealthIndicators = [
    {
      name: 'memory_heap',
      check: () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
    },
    {
      name: `database_${APP_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${APP_FEATURE}`,
          this.appPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${AUTH_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${AUTH_FEATURE}`,
          this.authPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${WEBHOOK_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${WEBHOOK_FEATURE}`,
          this.webhookPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
  ];

  constructor(
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    @InjectPrismaClient(APP_FEATURE)
    private readonly appPrismaClient: AppPrismaClient,
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly authPrismaClient: AuthPrismaClient,
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly webhookPrismaClient: WebhookPrismaClient
  ) {}
}

export const MainTerminusHealthCheckModule =
  TerminusHealthCheckModule.forRootAsync({
    imports: [
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: APP_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: AUTH_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: WEBHOOK_FEATURE,
      }),
    ],
    configurationClass: PrismaTerminusHealthCheckConfiguration,
  });

export const infrastructuresModules = [];

export const coreModules = [];
