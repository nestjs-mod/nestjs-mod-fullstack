import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { WebhookRoleInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { map, of } from 'rxjs';
import { WebhookAuthService } from './webhook-auth.service';

export const WEBHOOK_GUARD_DATA_ROUTE_KEY = 'webhookGuardData';

export class WebhookGuardData {
  roles?: WebhookRoleInterface[];

  constructor(options?: WebhookGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class WebhookGuardService implements CanActivate {
  constructor(private readonly webhookAuthService: WebhookAuthService) {}
  canActivate(route: ActivatedRouteSnapshot) {
    const webhookGuardData =
      route.data &&
      route.data[WEBHOOK_GUARD_DATA_ROUTE_KEY] instanceof WebhookGuardData
        ? route.data[WEBHOOK_GUARD_DATA_ROUTE_KEY]
        : null;
    if (webhookGuardData) {
      const webhookGuardDataRoles = webhookGuardData.roles || [];
      return this.webhookAuthService.loadWebhookUser().pipe(
        map((webhookUser) => {
          return Boolean(
            (webhookUser &&
              webhookGuardDataRoles.length > 0 &&
              webhookGuardDataRoles.includes(webhookUser.userRole)) ||
              (webhookGuardDataRoles.length === 0 && !webhookUser?.userRole)
          );
        })
      );
    }
    return of(true);
  }
}
