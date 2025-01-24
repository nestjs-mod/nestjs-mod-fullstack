import { EventEmitter, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AuthToken, LoginInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject } from 'rxjs';
import { AuthSignInFormService } from '../../services/auth-sign-in-form.service';
import { AuthSignInMapperService } from '../../services/auth-sign-in-mapper.service';
import { AuthService } from '../../services/auth.service';
import * as i0 from '@angular/core';
export declare class AuthSignInFormComponent implements OnInit {
  private readonly nzModalData;
  private readonly authService;
  private readonly nzMessageService;
  private readonly translocoService;
  private readonly authSignInFormService;
  private readonly authSignInMapperService;
  private readonly validationService;
  hideButtons?: boolean;
  afterSignIn: EventEmitter<AuthToken>;
  form: UntypedFormGroup;
  formlyModel$: BehaviorSubject<object | null>;
  formlyFields$: BehaviorSubject<
    | FormlyFieldConfig<
        import('@ngx-formly/core').FormlyFieldProps & {
          [additionalProperties: string]: any;
        }
      >[]
    | null
  >;
  constructor(
    nzModalData: AuthSignInFormComponent,
    authService: AuthService,
    nzMessageService: NzMessageService,
    translocoService: TranslocoService,
    authSignInFormService: AuthSignInFormService,
    authSignInMapperService: AuthSignInMapperService,
    validationService: ValidationService
  );
  ngOnInit(): void;
  setFieldsAndModel(data?: LoginInput): void;
  submitForm(): void;
  private setFormlyFields;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    AuthSignInFormComponent,
    [{ optional: true }, null, null, null, null, null, null]
  >;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AuthSignInFormComponent,
    'auth-sign-in-form',
    never,
    { hideButtons: { alias: 'hideButtons'; required: false } },
    { afterSignIn: 'afterSignIn' },
    never,
    never,
    true,
    never
  >;
}
