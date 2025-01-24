import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as i0 from '@angular/core';
export declare class AuthProfileFormService {
  protected readonly translocoService: TranslocoService;
  protected readonly validationService: ValidationService;
  constructor(
    translocoService: TranslocoService,
    validationService: ValidationService
  );
  init(): import('rxjs').Observable<boolean>;
  getFormlyFields(options?: {
    data?: UpdateProfileInput;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[];
  static ɵfac: i0.ɵɵFactoryDeclaration<AuthProfileFormService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<AuthProfileFormService>;
}
