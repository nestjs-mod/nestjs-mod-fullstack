import { Injectable } from '@angular/core';
import { SignupInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class AuthSignUpFormService {
  constructor(protected readonly translocoService: TranslocoService) {}

  init() {
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFormlyFields(options?: {
    data?: SignupInput;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: 'email',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.sign-up-form.fields.email`
            ),
            placeholder: 'email',
            required: true,
          },
        },
        {
          key: 'password',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.sign-up-form.fields.password`
            ),
            placeholder: 'password',
            required: true,
            type: 'password',
          },
        },
        {
          key: 'confirm_password',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.sign-up-form.fields.confirm-password`
            ),
            placeholder: 'confirm_password',
            required: true,
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

  toModel(data: SignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }

  toJson(data: SignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }
}
