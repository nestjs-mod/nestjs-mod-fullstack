import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { WebhookRoleInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { WebhookAuthService } from './webhook-auth.service';
import * as i0 from "@angular/core";
export declare const WEBHOOK_GUARD_DATA_ROUTE_KEY = "webhookGuardData";
export declare class WebhookGuardData {
    roles?: WebhookRoleInterface[];
    constructor(options?: WebhookGuardData);
}
export declare class WebhookGuardService implements CanActivate {
    private readonly webhookAuthService;
    constructor(webhookAuthService: WebhookAuthService);
    canActivate(route: ActivatedRouteSnapshot): import("rxjs").Observable<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<WebhookGuardService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WebhookGuardService>;
}
