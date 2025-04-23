import { Injectable } from '@angular/core';
import {
  CreateWebhookDtoInterface,
  UpdateWebhookDtoInterface,
  WebhookLogInterface,
  WebhookRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { map } from 'rxjs';
import { WebhookLogMapperService } from './webhook-log-mapper.service';
import { WebhookMapperService } from './webhook-mapper.service';
@Injectable({ providedIn: 'root' })
export class WebhookService {
  constructor(
    private readonly webhookRestService: WebhookRestService,
    private readonly webhookMapperService: WebhookMapperService,
    private readonly webhookLogMapperService: WebhookLogMapperService
  ) {}

  findOne(id: string) {
    return this.webhookRestService
      .webhookControllerFindOne(id)
      .pipe(map((w) => this.webhookMapperService.toModel(w)));
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
          webhooks: webhooks.map((w) => this.webhookMapperService.toModel(w)),
        }))
      );
  }

  updateOne(id: string, data: UpdateWebhookDtoInterface) {
    return this.webhookRestService
      .webhookControllerUpdateOne(id, data)
      .pipe(map((w) => this.webhookMapperService.toModel(w)));
  }

  deleteOne(id: string) {
    return this.webhookRestService.webhookControllerDeleteOne(id);
  }

  createOne(data: CreateWebhookDtoInterface) {
    return this.webhookRestService
      .webhookControllerCreateOne(data)
      .pipe(map((w) => this.webhookMapperService.toModel(w)));
  }

  testRequest(data: CreateWebhookDtoInterface) {
    return this.webhookRestService
      .webhookControllerTestRequest(data)
      .pipe(
        map((result) =>
          this.webhookLogMapperService.toModel(result as WebhookLogInterface)
        )
      );
  }
}
