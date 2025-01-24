import { EventEmitter, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject } from 'rxjs';
import { WebhookAuthFormService } from '../../services/webhook-auth-form.service';
import { WebhookAuthMapperService } from '../../services/webhook-auth-mapper.service';
import {
  WebhookAuthCredentials,
  WebhookAuthService,
} from '../../services/webhook-auth.service';
import { WebhookConfiguration } from '../../services/webhook.configuration';
import * as i0 from '@angular/core';
export declare class WebhookAuthFormComponent implements OnInit {
  private readonly nzModalData;
  private readonly webhookConfiguration;
  private readonly webhookAuthService;
  private readonly nzMessageService;
  private readonly translocoService;
  private readonly webhookAuthFormService;
  private readonly webhookAuthMapperService;
  hideButtons?: boolean;
  afterSignIn: EventEmitter<WebhookAuthCredentials>;
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
    nzModalData: WebhookAuthFormComponent,
    webhookConfiguration: WebhookConfiguration,
    webhookAuthService: WebhookAuthService,
    nzMessageService: NzMessageService,
    translocoService: TranslocoService,
    webhookAuthFormService: WebhookAuthFormService,
    webhookAuthMapperService: WebhookAuthMapperService
  );
  ngOnInit(): void;
  setFieldsAndModel(
    data?: Partial<WebhookAuthCredentials>,
    settings?: {
      xExternalTenantIdIsRequired: boolean;
    }
  ): void;
  submitForm(): void;
  fillUserCredentials(): void;
  fillAdminCredentials(): void;
  private setFormlyFields;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    WebhookAuthFormComponent,
    [{ optional: true }, null, null, null, null, null, null]
  >;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    WebhookAuthFormComponent,
    'webhook-auth-form',
    never,
    { hideButtons: { alias: 'hideButtons'; required: false } },
    { afterSignIn: 'afterSignIn' },
    never,
    never,
    true,
    never
  >;
}
