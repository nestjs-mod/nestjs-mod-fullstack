import { InjectionToken } from '@angular/core';

export class WebhookConfiguration {
  webhookSuperAdminExternalUserId?: string;
  constructor(options?: WebhookConfiguration) {
    Object.assign(this, options);
  }
}

export const WEBHOOK_CONFIGURATION_TOKEN =
  new InjectionToken<WebhookConfiguration>('WEBHOOK_CONFIGURATION_TOKEN');
