import { AUTH_FEATURE } from '@nestjs-mod-fullstack/auth';
import { WEBHOOK_FEATURE } from '@nestjs-mod/webhook';
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

export function terminusHealthCheckModuleForRootAsyncOptions(): Parameters<
  typeof TerminusHealthCheckModule.forRootAsync
>[0] {
  return {
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
  };
}
