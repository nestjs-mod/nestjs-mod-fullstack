import { Injectable } from '@angular/core';
import { WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';

@Injectable({ providedIn: 'root' })
export class WebhookLogService {
  constructor(private readonly webhookRestService: WebhookRestService) {}

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.webhookRestService.webhookControllerFindManyLogs(
      filters['webhookId'],
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
}
