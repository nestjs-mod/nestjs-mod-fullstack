import { Injectable } from '@angular/core';
import { WebhookInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { safeParseJson } from '@nestjs-mod-fullstack/common-angular';
import { addHours, format } from 'date-fns';

export interface WebhookModel
  extends Partial<
    Omit<
      WebhookInterface,
      'workUntilDate' | 'createdAt' | 'updatedAt' | 'headers'
    >
  > {
  headers?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  workUntilDate?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class WebhookMapperService {
  toModel(item?: WebhookInterface): WebhookModel {
    return {
      ...item,
      headers: item?.headers ? JSON.stringify(item.headers) : '',
      requestTimeout: item?.requestTimeout ? +item.requestTimeout : null,
      workUntilDate: item?.workUntilDate
        ? addHours(
            new Date(item.workUntilDate),
            new Date().getTimezoneOffset() / 60
          )
        : null,
      createdAt: item?.createdAt
        ? addHours(
            new Date(item.createdAt),
            new Date().getTimezoneOffset() / 60
          )
        : null,
      updatedAt: item?.updatedAt
        ? addHours(
            new Date(item.updatedAt),
            new Date().getTimezoneOffset() / 60
          )
        : null,
    };
  }

  toForm(model: WebhookModel) {
    return {
      ...model,
      requestTimeout: model.requestTimeout ? model.requestTimeout : '',
      workUntilDate: model.workUntilDate
        ? format(model.workUntilDate, 'yyyy-MM-dd HH:mm')
        : null,
    };
  }

  toJson(data: WebhookModel) {
    return {
      enabled: data.enabled === true,
      endpoint: data.endpoint || '',
      eventName: data.eventName || '',
      headers: data.headers ? safeParseJson(data.headers) : null,
      requestTimeout: data.requestTimeout ? +data.requestTimeout : null,
      workUntilDate: data.workUntilDate
        ? format(new Date(data.workUntilDate), 'yyyy-MM-dd HH:mm')
        : undefined,
    };
  }
}
