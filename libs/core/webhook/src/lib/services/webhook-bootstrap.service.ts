import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { randomUUID } from 'crypto';
import { concatMap, Subscription } from 'rxjs';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import { WebhookStaticEnvironments } from '../webhook.environments';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookServiceBootstrap
  implements OnApplicationBootstrap, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(WebhookServiceBootstrap.name);
  private eventsRef?: Subscription;

  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookStaticEnvironments: WebhookStaticEnvironments,
    private readonly webhookService: WebhookService
  ) {}

  async onModuleInit() {
    this.logger.debug('onModuleInit');

    if (isInfrastructureMode()) {
      return;
    }

    await this.createDefaultUsers();
  }

  onModuleDestroy() {
    if (this.eventsRef) {
      this.eventsRef.unsubscribe();
      this.eventsRef = undefined;
    }
  }

  async onApplicationBootstrap() {
    this.logger.debug('onApplicationBootstrap');

    if (isInfrastructureMode()) {
      return;
    }

    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    if (this.eventsRef) {
      this.eventsRef.unsubscribe();
      this.eventsRef = undefined;
    }
    this.eventsRef = this.webhookService.eventsStream$
      .asObservable()
      .pipe(
        concatMap(async (options) => this.webhookService.sendSyncEvent(options))
      )
      .subscribe();
  }

  private async createDefaultUsers() {
    try {
      if (this.webhookStaticEnvironments.superAdminExternalUserId) {
        const existsUser = await this.prismaClient.webhookUser.findFirst({
          where: {
            externalUserId:
              this.webhookStaticEnvironments.superAdminExternalUserId,
            userRole: WebhookRole.Admin,
          },
        });
        if (!existsUser) {
          await this.prismaClient.webhookUser.create({
            data: {
              externalTenantId: randomUUID(),
              externalUserId:
                this.webhookStaticEnvironments.superAdminExternalUserId,
              userRole: WebhookRole.Admin,
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
    }
  }
}
