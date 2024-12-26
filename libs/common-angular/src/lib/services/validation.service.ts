import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  ValidationErrorEnumInterface,
  ValidationErrorInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of, throwError } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class ValidationService {
  constructor(protected readonly translocoService: TranslocoService) {}

  catchAndProcessServerError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any,
    setFormlyFields: (options?: {
      errors?: ValidationErrorMetadataInterface[];
    }) => void
  ) {
    const error = err.error as ValidationErrorInterface;
    if (error?.code?.includes(ValidationErrorEnumInterface.VALIDATION_000)) {
      setFormlyFields({ errors: error.metadata });
      return of(null);
    }
    return throwError(() => err);
  }

  appendServerErrorsAsValidatorsToFields(
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
