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
    this.formlyFields$.next([
      {
        key: 'xExternalUserId',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.xExternalUserId`,
          placeholder: 'xExternalUserId',
          required: true,
        },
      },
      {
        key: 'xExternalTenantId',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.xExternalTenantId`,
          placeholder: 'xExternalTenantId',
          required: true,
        },
      },
    ]);
    this.formlyModel$.next(this.toModel(data));
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.toJson(this.form.value);
      this.afterSignIn.next(value);
      this.webhookAuthService.setWebhookAuthCredentials(value);
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

  private toModel(data: Partial<WebhookAuthCredentials>): object | null {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }

  private toJson(data: Partial<WebhookAuthCredentials>) {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }
}
