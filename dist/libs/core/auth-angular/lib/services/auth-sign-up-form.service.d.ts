import { SignupInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as i0 from "@angular/core";
export declare class AuthSignUpFormService {
    protected readonly translocoService: TranslocoService;
    protected readonly validationService: ValidationService;
    constructor(translocoService: TranslocoService, validationService: ValidationService);
    init(): import("rxjs").Observable<boolean>;
    getFormlyFields(options?: {
        data?: SignupInput;
        errors?: ValidationErrorMetadataInterface[];
    }): FormlyFieldConfig[];
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthSignUpFormService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthSignUpFormService>;
}
