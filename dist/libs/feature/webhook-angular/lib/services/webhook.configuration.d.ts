import { InjectionToken } from '@angular/core';
export declare class WebhookConfiguration {
    webhookSuperAdminExternalUserId?: string;
    constructor(options?: WebhookConfiguration);
}
export declare const WEBHOOK_CONFIGURATION_TOKEN: InjectionToken<WebhookConfiguration>;
