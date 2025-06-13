import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';
import { AuthCompleteForgotPasswordInput } from './auth.types';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class AuthCompleteForgotPasswordFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFormlyFields(options?: {
    data?: AuthCompleteForgotPasswordInput;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: 'password',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.complete-forgot-password-form.fields.password`
            ),
            placeholder: 'password',
            required: true,
            type: 'password',
          },
        },
        {
          key: 'confirmPassword',
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.complete-forgot-password-form.fields.confirm-password`
            ),
            placeholder: 'confirmPassword',
            required: true,
            type: 'password',
          },
        },
      ],
      options?.errors || []
    );
  }
}
