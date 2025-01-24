import { WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { WebhookAuthService } from './webhook-auth.service';
import * as i0 from '@angular/core';
export declare class WebhookEventsService {
  private readonly webhookAuthService;
  private readonly webhookRestService;
  constructor(
    webhookAuthService: WebhookAuthService,
    webhookRestService: WebhookRestService
  );
  findMany(): import('rxjs').Observable<
    import('@nestjs-mod-fullstack/app-angular-rest-sdk').WebhookEventInterface[]
  >;
  static ɵfac: i0.ɵɵFactoryDeclaration<WebhookEventsService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<WebhookEventsService>;
}
