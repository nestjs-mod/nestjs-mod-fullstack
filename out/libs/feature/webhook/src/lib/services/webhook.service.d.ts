import { Subject } from 'rxjs';
import { WebhookConfiguration } from '../webhook.configuration';
export declare class WebhookService<
  TEventName extends string = string,
  TEventBody = object,
  TEventHeaders = object
> {
  private readonly webhookConfiguration;
  events$: Subject<{
    eventName: TEventName;
    eventBody: TEventBody;
    eventHeaders: TEventHeaders;
  }>;
  constructor(webhookConfiguration: WebhookConfiguration);
  sendEvent(
    eventName: TEventName,
    eventBody: TEventBody,
    eventHeaders: TEventHeaders
  ): Promise<void>;
}
