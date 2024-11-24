import { Injectable } from '@angular/core';
import {
  CreateWebhookDtoInterface,
  UpdateWebhookDtoInterface,
  WebhookRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { WebhookAuthService } from './webhook-auth.service';

@Injectable({ providedIn: 'root' })
export class WebhookService {
  constructor(
    private readonly webhookAuthService: WebhookAuthService,
    private readonly webhookRestService: WebhookRestService
  ) {}

  findOne(id: string) {
    return this.webhookRestService.webhookControllerFindOne(
      id,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId
    );
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.webhookRestService.webhookControllerFindMany(
      this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId,
      meta?.curPage,
      meta?.perPage,
      filters['search'],
      meta?.sort
        ? Object.entries(meta?.sort)
            .map(([key, value]) => `${key}:${value}`)
            .join(',')
        : undefined
    );
  }

  updateOne(id: string, data: UpdateWebhookDtoInterface) {
    return this.webhookRestService.webhookControllerUpdateOne(
      id,
      data,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId
    );
  }

  deleteOne(id: string) {
    return this.webhookRestService.webhookControllerDeleteOne(
      id,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId
    );
  }

  createOne(data: CreateWebhookDtoInterface) {
    return this.webhookRestService.webhookControllerCreateOne(
      data,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId
    );
  }
}
