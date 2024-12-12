import { Injectable } from '@angular/core';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class AuthProfileFormService {
  constructor(protected readonly translocoService: TranslocoService) {}

  init() {
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFormlyFields(options?: {
    data?: UpdateProfileInput;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: 'picture',
          type: 'image-file',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.profile-form.fields.picture`
            ),
            placeholder: 'picture',
          },
        },
        {
          key: 'old_password',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.profile-form.fields.old-password`
            ),
            placeholder: 'old_password',
            type: 'password',
          },
        },
        {
          key: 'new_password',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.profile-form.fields.new-password`
            ),
            placeholder: 'new_password',
            type: 'password',
          },
        },
        {
          key: 'confirm_new_password',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.profile-form.fields.confirm-new-password`
            ),
            placeholder: 'confirm_new_password',
            type: 'password',
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

  toModel(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }

  toJson(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }
}
