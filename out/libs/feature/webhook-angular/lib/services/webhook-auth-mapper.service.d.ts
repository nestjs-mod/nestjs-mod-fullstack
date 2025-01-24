import { WebhookAuthCredentials } from './webhook-auth.service';
import * as i0 from '@angular/core';
export type WebhookAuthCredentialsModel = Partial<WebhookAuthCredentials>;
export declare class WebhookAuthMapperService {
  toModel(data: Partial<WebhookAuthCredentials>): WebhookAuthCredentialsModel;
  toJson(data: WebhookAuthCredentialsModel): {
    xExternalUserId: string | undefined;
    xExternalTenantId: string | undefined;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<WebhookAuthMapperService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<WebhookAuthMapperService>;
}
