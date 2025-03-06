process.env.TZ = 'UTC';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import { AUTHORIZER_ENV_PREFIX } from '@nestjs-mod/authorizer';
import { isInfrastructureMode, PACKAGE_JSON_FILE } from '@nestjs-mod/common';
import {
  DockerComposeAuthorizer,
  DockerComposePostgreSQL,
} from '@nestjs-mod/docker-compose';
import { PrismaModule } from '@nestjs-mod/prisma';
import { join } from 'path';

import KeyvRedis from '@keyv/redis';
import { WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { existsSync } from 'fs';
import { getText } from 'nestjs-translates';
import { createClient } from 'redis';
import { AuthorizerAppModule } from '../app/authorizer-app.module';

import { AUTH_FEATURE } from '@nestjs-mod-fullstack/auth';
import { WEBHOOK_FEATURE } from '@nestjs-mod-fullstack/webhook';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
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

export const AppModule = AuthorizerAppModule;

export const MainKeyvModule = KeyvModule.forRoot({
  staticConfiguration: {
    storeFactoryByEnvironmentUrl: (uri) => {
      return isInfrastructureMode()
        ? undefined
        : [new KeyvRedis(createClient({ url: uri }))];
    },
  },
});

export const MainMinioModule = MinioModule.forRoot();

export const MainWebhookModule = WebhookModule.forRootAsync({
  staticEnvironments: { checkHeaders: false },
  configuration: {
    syncMode: false,
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

export const infrastructuresModules = [
  DockerComposePostgreSQL.forFeature({
    featureModuleName: AUTHORIZER_ENV_PREFIX,
  }),
  DockerComposeAuthorizer.forRoot({
    staticConfiguration: {
      image: 'lakhansamani/authorizer:1.4.4',
      disableStrongPassword: 'true',
      disableEmailVerification: 'true',
      featureName: AUTHORIZER_ENV_PREFIX,
      organizationName: 'NestJSModSSO',
      dependsOnServiceNames: {
        'postgre-sql': 'service_healthy',
      },
      isEmailServiceEnabled: 'true',
      isSmsServiceEnabled: 'false',
      env: 'development',
    },
  }),
];

export const coreModules = [];
