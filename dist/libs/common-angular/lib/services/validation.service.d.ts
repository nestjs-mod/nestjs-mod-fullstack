import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as i0 from "@angular/core";
export declare class ValidationService {
    protected readonly translocoService: TranslocoService;
    constructor(translocoService: TranslocoService);
    catchAndProcessServerError(err: any, setFormlyFields: (options?: {
        errors?: ValidationErrorMetadataInterface[];
    }) => void): import("rxjs").Observable<null>;
    appendServerErrorsAsValidatorsToFields(fields: FormlyFieldConfig[], errors: ValidationErrorMetadataInterface[]): FormlyFieldConfig<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: any;
    }>[];
    static ɵfac: i0.ɵɵFactoryDeclaration<ValidationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ValidationService>;
}
