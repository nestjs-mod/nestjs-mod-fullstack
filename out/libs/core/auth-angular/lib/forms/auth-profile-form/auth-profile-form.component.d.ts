import { OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject } from 'rxjs';
import { AuthProfileFormService } from '../../services/auth-profile-form.service';
import { AuthProfileMapperService } from '../../services/auth-profile-mapper.service';
import { AuthService } from '../../services/auth.service';
import * as i0 from '@angular/core';
export declare class AuthProfileFormComponent implements OnInit {
  private readonly nzModalData;
  private readonly authService;
  private readonly nzMessageService;
  private readonly translocoService;
  private readonly authProfileFormService;
  private readonly authProfileMapperService;
  private readonly validationService;
  hideButtons?: boolean;
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
    nzModalData: AuthProfileFormComponent,
    authService: AuthService,
    nzMessageService: NzMessageService,
    translocoService: TranslocoService,
    authProfileFormService: AuthProfileFormService,
    authProfileMapperService: AuthProfileMapperService,
    validationService: ValidationService
  );
  ngOnInit(): void;
  setFieldsAndModel(data?: UpdateProfileInput): void;
  private setFormlyFields;
  submitForm(): void;
  private fillFromProfile;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    AuthProfileFormComponent,
    [{ optional: true }, null, null, null, null, null, null]
  >;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AuthProfileFormComponent,
    'auth-profile-form',
    never,
    { hideButtons: { alias: 'hideButtons'; required: false } },
    {},
    never,
    never,
    true,
    never
  >;
}
