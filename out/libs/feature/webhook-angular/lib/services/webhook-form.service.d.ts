import { TranslocoService } from '@jsverse/transloco';
import {
  UpdateWebhookDtoInterface,
  ValidationErrorMetadataInterface,
  WebhookEventInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { WebhookEventsService } from './webhook-events.service';
import * as i0 from '@angular/core';
export declare class WebhookFormService {
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
    data?: UpdateWebhookDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[];
  static ɵfac: i0.ɵɵFactoryDeclaration<WebhookFormService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<WebhookFormService>;
}
