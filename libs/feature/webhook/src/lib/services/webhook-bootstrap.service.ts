import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/webhook-client';
import { AxiosHeaders } from 'axios';
import { randomUUID } from 'crypto';
import {
  concatMap,
  firstValueFrom,
  Subscription,
  timeout,
  TimeoutError,
} from 'rxjs';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import { WebhookEnvironments } from '../webhook.environments';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookServiceBootstrap
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(WebhookServiceBootstrap.name);
  private eventsRef?: Subscription;

  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookEnvironments: WebhookEnvironments,
    private readonly httpService: HttpService,
    private readonly webhookService: WebhookService
  ) {}

  onModuleDestroy() {
    if (this.eventsRef) {
      this.eventsRef.unsubscribe();
      this.eventsRef = undefined;
    }
  }

  async onApplicationBootstrap() {
    if (isInfrastructureMode()) {
      return;
    }

    await this.createDefaultUsers();

    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    if (this.eventsRef) {
      this.eventsRef.unsubscribe();
      this.eventsRef = undefined;
    }
    this.eventsRef = this.webhookService.events$
      .asObservable()
      .pipe(
        concatMap(async ({ eventName, eventBody, eventHeaders }) => {
          this.logger.debug({ eventName, eventBody, eventHeaders });

          const webhooks = await this.prismaClient.webhook.findMany({
            where: { eventName: { contains: eventName }, enabled: true },
          });

          for (const webhook of webhooks) {
            const headers = {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...((webhook.headers as any) || {}),
              ...(eventHeaders || {}),
            };
            const webhookLog = await this.prismaClient.webhookLog.create({
              data: {
                externalTenantId: webhook.externalTenantId,
                request: {
                  url: webhook.endpoint,
                  body: eventBody,
                  headers,
                } as object,
                responseStatus: '',
                webhookStatus: 'Pending',
                response: {},
                webhookId: webhook.id,
              },
            });
            try {
              await this.prismaClient.webhookLog.update({
                where: { id: webhookLog.id },
                data: { webhookStatus: 'Process' },
              });
              const request = await firstValueFrom(
                this.httpService
                  .post(webhook.endpoint, eventBody, {
                    ...(Object.keys(headers)
                      ? { headers: new AxiosHeaders({ ...headers }) }
                      : {}),
                  })
                  .pipe(timeout(webhook.requestTimeout || 5000))
              );
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let response: any, responseStatus: string;
              try {
                response = request.data;
                responseStatus = request.statusText;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err: any) {
                response = String(err.message);
                responseStatus = 'unhandled';
              }
              await this.prismaClient.webhookLog.update({
                where: { id: webhookLog.id },
                data: {
                  responseStatus,
                  response,
                  webhookStatus: 'Success',
                },
              });
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let response: any, responseStatus: string;
              try {
                response = err.response?.data || String(err.message);
                responseStatus = err.response?.statusText;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err2: any) {
                response = String(err2.message);
                responseStatus = 'unhandled';
              }
              try {
                await this.prismaClient.webhookLog.update({
                  where: { id: webhookLog.id },
                  data: {
                    responseStatus,
                    response,
                    webhookStatus:
                      err instanceof TimeoutError ? 'Timeout' : 'Error',
                  },
                });
              } catch (err) {
                //
              }
            }
          }
        })
      )
      .subscribe();
  }

  private async createDefaultUsers() {
    try {
      if (this.webhookEnvironments.superAdminExternalUserId) {
        const existsUser = await this.prismaClient.webhookUser.findFirst({
          where: {
            externalUserId: this.webhookEnvironments.superAdminExternalUserId,
            userRole: 'Admin',
          },
        });
        if (!existsUser) {
          await this.prismaClient.webhookUser.create({
            data: {
              externalTenantId: randomUUID(),
              externalUserId: this.webhookEnvironments.superAdminExternalUserId,
              userRole: 'Admin',
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
    }
  }
}