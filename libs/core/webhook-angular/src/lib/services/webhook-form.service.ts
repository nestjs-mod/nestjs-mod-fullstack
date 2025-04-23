import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  UpdateWebhookDtoInterface,
  ValidationErrorMetadataInterface,
  WebhookEventInterface,
  WebhookScalarFieldEnumInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { WebhookEventsService } from './webhook-events.service';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookFormService {
  protected events: WebhookEventInterface[] = [];

  constructor(
    protected readonly webhookEventsService: WebhookEventsService,
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return this.webhookEventsService.findMany().pipe(
      tap((events) => {
        this.events = events;
      })
    );
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: UpdateWebhookDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: WebhookScalarFieldEnumInterface.endpoint,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook.form.fields.endpoint`
            ),
            placeholder: 'endpoint',
            required: true,
          },
        },
        {
          key: WebhookScalarFieldEnumInterface.eventName,
          type: 'select',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook.form.fields.event-name`
            ),
            placeholder: 'eventName',
            required: true,
            options: (this.events || []).map((e) => ({
              value: e.eventName,
              label: `${e.eventName} - ${e.description}`,
            })),
            change: (field, eventName) => {
              const event = this.events.find((e) => e.eventName === eventName);
              field.form
                ?.get('example')
                ?.setValue(JSON.stringify(event?.example, null, 4));
            },
          },
        },
        {
          key: WebhookScalarFieldEnumInterface.headers,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook.form.fields.headers`
            ),
            placeholder: 'headers',
          },
        },
        {
          fieldGroupClassName: 'flex justify-between',
          fieldGroup: [
            {
              fieldGroupClassName: 'flex-1',
              key: WebhookScalarFieldEnumInterface.enabled,
              type: 'checkbox',
              validation: {
                show: true,
              },
              props: {
                label: this.translocoService.translate(
                  `webhook.form.fields.enabled`
                ),
                placeholder: 'enabled',
                required: true,
              },
            },
            {
              fieldGroupClassName: 'flex-1',
              key: WebhookScalarFieldEnumInterface.requestTimeout,
              type: 'input',
              validation: {
                show: true,
              },
              props: {
                type: 'number',
                label: this.translocoService.translate(
                  `webhook.form.fields.request-timeout`
                ),
                placeholder: 'requestTimeout',
                required: false,
              },
            },
            {
              fieldGroupClassName: 'flex-1',
              key: WebhookScalarFieldEnumInterface.workUntilDate,
              type: 'date-input',
              validation: {
                show: true,
              },
              props: {
                type: 'datetime-local',
                label: this.translocoService.translate(
                  `webhook.form.fields.work-until-date`
                ),
                placeholder: 'workUntilDate',
                required: false,
              },
            },
          ],
        },
        {
          key: 'example',
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`Example of payload`),
            placeholder: 'example of payload',
            readonly: true,
          },
          templateOptions: {
            rows: 15,
          },
        },
      ],
      options?.errors || []
    );
  }
}
