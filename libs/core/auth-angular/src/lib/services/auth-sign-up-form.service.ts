import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';
import { AuthSignupInput } from './auth.types';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class AuthSignUpFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFormlyFields(options?: {
    data?: AuthSignupInput;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
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
}
