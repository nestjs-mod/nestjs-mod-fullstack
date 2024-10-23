import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject } from 'rxjs';
import {
  WebhookAuthCredentials,
  WebhookAuthService,
} from '../../services/webhook-auth.service';
import {
  WEBHOOK_CONFIGURATION_TOKEN,
  WebhookConfiguration,
} from '../../services/webhook.configuration';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    FormlyModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgIf,
  ],
  selector: 'webhook-auth-form',
  templateUrl: './webhook-auth-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookAuthFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Input()
  inputs: WebhookAuthCredentials = {
    xExternalUserId: 'string',
    xExternalTenantId: 'string',
  };

  @Output()
  afterSignIn = new EventEmitter<WebhookAuthCredentials>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: WebhookAuthFormComponent,
    @Inject(WEBHOOK_CONFIGURATION_TOKEN)
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly webhookAuthService: WebhookAuthService,
    private readonly nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.setFieldsAndModel(this.webhookAuthService.getWebhookAuthCredentials());
  }

  setFieldsAndModel(data: Partial<WebhookAuthCredentials> = {}) {
    this.formlyFields$.next(
      ['xExternalUserId', 'xExternalTenantId']
        .filter((key) => this.getFormlyFieldType(key))
        .map((key) => ({
          key,
          type: this.getFormlyFieldType(key),
          validation: {
            show: true,
          },
          props: {
            label: `webhook.signInForm.${key}`,
            placeholder: key,
            required: false,
          },
        }))
    );
    this.formlyModel$.next(
      ['xExternalUserId', 'xExternalTenantId']
        .filter((key) => this.getFormlyFieldType(key))
        .reduce(
          (all, key) => ({
            ...all,
            [key]:
              (this.getFormlyFieldType(key) === 'textarea'
                ? JSON.stringify(data[key])
                : data[key]) || '',
          }),
          {}
        )
    );
  }

  submitForm(): void {
    if (this.form.valid) {
      this.afterSignIn.next(this.form.value);
      this.webhookAuthService.setWebhookAuthCredentials(this.form.value);
      this.nzMessageService.success('Success');
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning('Validation errors');
    }
  }

  fillUserCredentials() {
    this.setFieldsAndModel({
      xExternalTenantId: '2079150a-f133-405c-9e77-64d3ab8aff77',
      xExternalUserId: '3072607c-8c59-4fc4-9a37-916825bc0f99',
    });
  }

  fillAdminCredentials() {
    this.setFieldsAndModel({
      xExternalTenantId: '',
      xExternalUserId:
        this.webhookConfiguration.webhookSuperAdminExternalUserId,
    });
  }

  private getFormlyFieldType(key: string): string {
    if (!this.inputs[key]) {
      return '';
    }
    if (this.inputs[key] === 'boolean') {
      return 'checkbox';
    }
    if (this.inputs[key] === 'text') {
      return 'textarea';
    }
    return 'input';
  }
}
