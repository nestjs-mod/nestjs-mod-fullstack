import { Injectable } from '@angular/core';
import {
  CreateWebhookDtoInterface,
  UpdateWebhookDtoInterface,
  WebhookRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { map } from 'rxjs';
import { WebhookMapperService } from './webhook-mapper.service';
@Injectable({ providedIn: 'root' })
export class WebhookService {
  constructor(
    private readonly webhookRestService: WebhookRestService,
    private readonly webhookMapperService: WebhookMapperService
  ) {}

  findOne(id: string) {
    return this.webhookRestService
      .webhookControllerFindOne(id)
      .pipe(map(this.webhookMapperService.toModel));
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.webhookRestService
      .webhookControllerFindMany(
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined
      )
      .pipe(
        map(({ meta, webhooks }) => ({
          meta,
          webhooks: webhooks.map(this.webhookMapperService.toModel),
        }))
      );
  }

  updateOne(id: string, data: UpdateWebhookDtoInterface) {
    return this.webhookRestService
      .webhookControllerUpdateOne(id, data)
      .pipe(map(this.webhookMapperService.toModel));
  }

  deleteOne(id: string) {
    return this.webhookRestService.webhookControllerDeleteOne(id);
  }

  createOne(data: CreateWebhookDtoInterface) {
    return this.webhookRestService
      .webhookControllerCreateOne(data)
      .pipe(map(this.webhookMapperService.toModel));
  }
}
