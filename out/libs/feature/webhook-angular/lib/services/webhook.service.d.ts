import {
  CreateWebhookDtoInterface,
  UpdateWebhookDtoInterface,
  WebhookRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { WebhookAuthService } from './webhook-auth.service';
import { WebhookMapperService } from './webhook-mapper.service';
import * as i0 from '@angular/core';
export declare class WebhookService {
  private readonly webhookAuthService;
  private readonly webhookRestService;
  private readonly webhookMapperService;
  constructor(
    webhookAuthService: WebhookAuthService,
    webhookRestService: WebhookRestService,
    webhookMapperService: WebhookMapperService
  );
  findOne(
    id: string
  ): import('rxjs').Observable<import('./webhook-mapper.service').WebhookModel>;
  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }): import('rxjs').Observable<{
    meta: import('@nestjs-mod-fullstack/app-angular-rest-sdk').FindManyResponseMetaInterface;
    webhooks: import('./webhook-mapper.service').WebhookModel[];
  }>;
  updateOne(
    id: string,
    data: UpdateWebhookDtoInterface
  ): import('rxjs').Observable<import('./webhook-mapper.service').WebhookModel>;
  deleteOne(
    id: string
  ): import('rxjs').Observable<
    import('@nestjs-mod-fullstack/app-angular-rest-sdk').StatusResponseInterface
  >;
  createOne(
    data: CreateWebhookDtoInterface
  ): import('rxjs').Observable<import('./webhook-mapper.service').WebhookModel>;
  static ɵfac: i0.ɵɵFactoryDeclaration<WebhookService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<WebhookService>;
}
