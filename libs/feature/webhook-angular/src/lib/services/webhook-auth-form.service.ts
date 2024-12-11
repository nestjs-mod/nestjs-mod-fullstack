import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  ValidationErrorMetadataInterface,
  WebhookEventInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { WebhookAuthCredentials } from './webhook-auth.service';
import { WebhookEventsService } from './webhook-events.service';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookAuthFormService {
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
    data?: WebhookAuthCredentials;
    errors?: ValidationErrorMetadataInterface[];
    settings?: { xExternalTenantIdIsRequired: boolean };
  }): FormlyFieldConfig[] {
    return this.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: 'xExternalUserId',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook.form.fields.x-external-userId`
            ),
            placeholder: 'xExternalUserId',
            required: true,
          },
        },
        {
          key: 'xExternalTenantId',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `webhook.form.fields.x-external-tenantId`
            ),
            placeholder: 'xExternalTenantId',
            required: options?.settings?.xExternalTenantIdIsRequired,
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

  toModel(data: Partial<WebhookAuthCredentials>) {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }

  toJson(data: Partial<WebhookAuthCredentials>) {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }
}
