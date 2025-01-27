import { WebhookRestService, WebhookUserInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import * as i0 from "@angular/core";
export type WebhookAuthCredentials = {
    xExternalUserId?: string;
    xExternalTenantId?: string;
};
export declare class WebhookAuthService {
    private readonly webhookRestService;
    private webhookAuthCredentials$;
    private webhookUser$;
    constructor(webhookRestService: WebhookRestService);
    getWebhookAuthCredentials(): WebhookAuthCredentials;
    getWebhookUser(): WebhookUserInterface | null;
    setWebhookAuthCredentials(webhookAuthCredentials: WebhookAuthCredentials): void;
    loadWebhookUser(): import("rxjs").Observable<WebhookUserInterface | null>;
    webhookAuthCredentialsUpdates(): import("rxjs").Observable<WebhookAuthCredentials>;
    webhookUserUpdates(): import("rxjs").Observable<WebhookUserInterface | null>;
    static ɵfac: i0.ɵɵFactoryDeclaration<WebhookAuthService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WebhookAuthService>;
}
