import { WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { WebhookAuthService } from './webhook-auth.service';
import * as i0 from '@angular/core';
export declare class WebhookLogService {
  private readonly webhookAuthService;
  private readonly webhookRestService;
  constructor(
    webhookAuthService: WebhookAuthService,
    webhookRestService: WebhookRestService
  );
  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }): import('rxjs').Observable<
    import('@nestjs-mod-fullstack/app-angular-rest-sdk').FindManyWebhookLogResponseInterface
  >;
  static ɵfac: i0.ɵɵFactoryDeclaration<WebhookLogService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<WebhookLogService>;
}
