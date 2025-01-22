import { EventEmitter, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AuthToken, SignupInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject } from 'rxjs';
import { AuthSignUpFormService } from '../../services/auth-sign-up-form.service';
import { AuthSignUpMapperService } from '../../services/auth-sign-up-mapper.service';
import { AuthService } from '../../services/auth.service';
import * as i0 from "@angular/core";
export declare class AuthSignUpFormComponent implements OnInit {
    private readonly nzModalData;
    private readonly authService;
    private readonly nzMessageService;
    private readonly translocoService;
    private readonly authSignUpFormService;
    private readonly authSignUpMapperService;
    private readonly validationService;
    hideButtons?: boolean;
    afterSignUp: EventEmitter<AuthToken>;
    form: UntypedFormGroup;
    formlyModel$: BehaviorSubject<object | null>;
    formlyFields$: BehaviorSubject<FormlyFieldConfig<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: any;
    }>[] | null>;
    constructor(nzModalData: AuthSignUpFormComponent, authService: AuthService, nzMessageService: NzMessageService, translocoService: TranslocoService, authSignUpFormService: AuthSignUpFormService, authSignUpMapperService: AuthSignUpMapperService, validationService: ValidationService);
    ngOnInit(): void;
    setFieldsAndModel(data?: SignupInput): void;
    submitForm(): void;
    private setFormlyFields;
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthSignUpFormComponent, [{ optional: true; }, null, null, null, null, null, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AuthSignUpFormComponent, "auth-sign-up-form", never, { "hideButtons": { "alias": "hideButtons"; "required": false; }; }, { "afterSignUp": "afterSignUp"; }, never, never, true, never>;
}
