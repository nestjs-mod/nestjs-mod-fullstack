import { isInfrastructureMode } from '@nestjs-mod/common';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { concatMap, Subscription } from 'rxjs';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookServiceBootstrap
  implements OnApplicationBootstrap, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(WebhookServiceBootstrap.name);
  private eventsRef?: Subscription;

  constructor(private readonly webhookService: WebhookService) {}

  async onModuleInit() {
    this.logger.debug('onModuleInit');

    if (isInfrastructureMode()) {
      return;
    }
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
}
