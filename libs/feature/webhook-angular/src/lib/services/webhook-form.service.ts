import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  UpdateWebhookDtoInterface,
  ValidationErrorMetadataInterface,
  WebhookEventInterface,
  WebhookScalarFieldEnumInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
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
    protected readonly translocoService: TranslocoService
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
    return this.appendServerErrorsAsValidatorsToFields(
      [
        {
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
          key: WebhookScalarFieldEnumInterface.workUntilDate,
          type: 'input',
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
      options?.errors || []
    );
  }

  protected appendServerErrorsAsValidatorsToFields(
    fields: FormlyFieldConfig[],
    errors: ValidationErrorMetadataInterface[]
  ) {
    return (fields || []).map((f: FormlyFieldConfig) => {
      const error = errors?.find((e) => e.property === f.key);
      if (error) {
        f.validators = Object.fromEntries(
          error.constraints.map((c) => {
            if (typeof f.key === 'string') {
              c.description = c.description.replace(
                f.key,
                this.translocoService.translate('field "{{label}}"', {
                  label: f.props?.label?.toLowerCase(),
                })
              );
            }
            return [
              c.name === 'isNotEmpty' ? 'required' : c.name,
              {
                expression: () => false,
                message: () => c.description,
              },
            ];
          })
        );
      }
      return f;
    });
  }
}
