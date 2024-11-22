import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { WebhookConfiguration } from '../webhook.configuration';
import { WebhookError, WebhookErrorEnum } from '../webhook.errors';

@Injectable()
export class WebhookService<
  TEventName extends string = string,
  TEventBody = object,
  TEventHeaders = object
> {
  events$ = new Subject<{
    eventName: TEventName;
    eventBody: TEventBody;
    eventHeaders: TEventHeaders;
  }>();

  constructor(private readonly webhookConfiguration: WebhookConfiguration) {}

  async sendEvent(
    eventName: TEventName,
    eventBody: TEventBody,
    eventHeaders: TEventHeaders
  ) {
    const event = this.webhookConfiguration.events.find(
      (e) => e.eventName === eventName
    );
    if (!event) {
      throw new WebhookError(WebhookErrorEnum.EVENT_NOT_FOUND);
    }
    this.events$.next({ eventName, eventBody, eventHeaders });
  }
}
