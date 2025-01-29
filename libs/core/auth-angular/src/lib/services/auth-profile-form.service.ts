import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';
import { AuthUpdateProfileInput } from './auth.types';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class AuthProfileFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFormlyFields(options?: {
    data?: AuthUpdateProfileInput;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
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
}
