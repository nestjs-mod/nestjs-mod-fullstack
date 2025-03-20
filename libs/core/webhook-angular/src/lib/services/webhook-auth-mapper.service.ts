import { Injectable } from '@angular/core';
import { WebhookAuthCredentials } from './webhook-auth.service';

export type WebhookAuthCredentialsModel = Partial<WebhookAuthCredentials>;

@Injectable({ providedIn: 'root' })
export class WebhookAuthMapperService {
  toModel(data: Partial<WebhookAuthCredentials>): WebhookAuthCredentialsModel {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }

  toJson(data: WebhookAuthCredentialsModel) {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }
}
