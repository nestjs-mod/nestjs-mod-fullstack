import { Injectable } from '@angular/core';
import { WebhookLogInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { TIMEZONE_OFFSET, safeParseJson } from '@nestjs-mod/misc';
import { addHours } from 'date-fns';

export interface WebhookLogModel
  extends Partial<
    Omit<
      WebhookLogInterface,
      'createdAt' | 'updatedAt' | 'request' | 'response'
    >
  > {
  request?: string | null;
  response?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class WebhookLogMapperService {
  toModel(item?: WebhookLogInterface): WebhookLogModel {
    return {
      ...item,
      request: item?.request ? JSON.stringify(item.request) : '',
      response: item?.response ? JSON.stringify(item.response) : '',
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET)
        : null,
    };
  }

  toForm(model: WebhookLogModel) {
    return {
      ...model,
    };
  }

  toJson(data: WebhookLogModel) {
    return {
      responseStatus: data.responseStatus || '',
      webhookStatus: data.webhookStatus || '',
      request: data.request ? safeParseJson(data.request) : null,
      response: data.response ? safeParseJson(data.response) : null,
    };
  }
}
