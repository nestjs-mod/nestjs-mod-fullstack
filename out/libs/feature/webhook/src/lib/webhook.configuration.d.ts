import { WebhookEvent } from './types/webhook-event';
export declare class WebhookConfiguration {
  events: WebhookEvent[];
  cacheTTL?: number;
}
export declare class WebhookStaticConfiguration {
  externalUserIdHeaderName?: string;
  externalTenantIdHeaderName?: string;
}
