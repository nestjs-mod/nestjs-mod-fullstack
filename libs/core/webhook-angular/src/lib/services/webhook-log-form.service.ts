import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  ValidationErrorMetadataInterface,
  WebhookLogInterface,
  WebhookLogScalarFieldEnumInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookLogFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: WebhookLogInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: WebhookLogScalarFieldEnumInterface.request,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook-log.form.fields.request`
            ),
            placeholder: 'request',
            readonly: true,
          },
        },
        {
          key: WebhookLogScalarFieldEnumInterface.webhookStatus,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook-log.form.fields.webhook-status`
            ),
            placeholder: 'webhook-status',
            readonly: true,
          },
        },
        {
          key: WebhookLogScalarFieldEnumInterface.response,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook-log.form.fields.response`
            ),
            placeholder: 'response',
            readonly: true,
          },
        },
        {
          key: WebhookLogScalarFieldEnumInterface.responseStatus,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook-log.form.fields.response-status`
            ),
            placeholder: 'response-status',
            readonly: true,
          },
        },
      ],
      options?.errors || []
    );
  }
}
