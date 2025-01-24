import { TranslocoService } from '@jsverse/transloco';
import {
  ValidationErrorMetadataInterface,
  WebhookEventInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { WebhookAuthCredentials } from './webhook-auth.service';
import { WebhookEventsService } from './webhook-events.service';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import * as i0 from '@angular/core';
export declare class WebhookAuthFormService {
  protected readonly webhookEventsService: WebhookEventsService;
  protected readonly translocoService: TranslocoService;
  protected readonly validationService: ValidationService;
  protected events: WebhookEventInterface[];
  constructor(
    webhookEventsService: WebhookEventsService,
    translocoService: TranslocoService,
    validationService: ValidationService
  );
  init(): import('rxjs').Observable<WebhookEventInterface[]>;
  getFormlyFields(options?: {
    data?: WebhookAuthCredentials;
    errors?: ValidationErrorMetadataInterface[];
    settings?: {
      xExternalTenantIdIsRequired: boolean;
    };
  }): FormlyFieldConfig[];
  static ɵfac: i0.ɵɵFactoryDeclaration<WebhookAuthFormService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<WebhookAuthFormService>;
}
