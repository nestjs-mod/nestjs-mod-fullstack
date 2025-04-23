import { Injectable } from '@angular/core';
import { WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { map } from 'rxjs';
import { WebhookLogMapperService } from './webhook-log-mapper.service';

@Injectable({ providedIn: 'root' })
export class WebhookLogService {
  constructor(
    private readonly webhookRestService: WebhookRestService,
    private readonly webhookLogMapperService: WebhookLogMapperService
  ) {}

  findOne(id: string) {
    return this.webhookRestService
      .webhookLogsControllerFindOne(id)
      .pipe(map((w) => this.webhookLogMapperService.toModel(w)));
  }

  findMany({
    filters,
    meta,
  }: {
    filters: Record<string, string>;
    meta?: RequestMeta;
  }) {
    return this.webhookRestService.webhookLogsControllerFindManyLogs(
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

  deleteOne(id: string) {
    return this.webhookRestService.webhookLogsControllerDeleteOne(id);
  }
}
