import { AsyncPipe } from '@angular/common';
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
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject } from 'rxjs';
import { WebhookAuthFormService } from '../../services/webhook-auth-form.service';
import { WebhookAuthMapperService } from '../../services/webhook-auth-mapper.service';
import {
  WebhookAuthCredentials,
  WebhookAuthService,
} from '../../services/webhook-auth.service';
import {
  WEBHOOK_CONFIGURATION_TOKEN,
  WebhookConfiguration,
} from '../../services/webhook.configuration';

@Component({
  imports: [
    FormlyModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    TranslocoDirective,
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
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly webhookAuthFormService: WebhookAuthFormService,
    private readonly webhookAuthMapperService: WebhookAuthMapperService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.setFieldsAndModel(this.webhookAuthService.getWebhookAuthCredentials());
  }

  setFieldsAndModel(
    data: Partial<WebhookAuthCredentials> = {},
    settings: { xExternalTenantIdIsRequired: boolean } = {
      xExternalTenantIdIsRequired: true,
    }
  ) {
    const model = this.webhookAuthMapperService.toModel(data);
    this.setFormlyFields({ data: model, settings });
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.webhookAuthMapperService.toJson(this.form.value);
      this.afterSignIn.next(value);
      this.webhookAuthService.setWebhookAuthCredentials(value);
      this.nzMessageService.success(this.translocoService.translate('Success'));
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning(
        this.translocoService.translate('Validation errors')
      );
    }
  }

  fillUserCredentials() {
    this.setFieldsAndModel({
      xExternalTenantId: '2079150a-f133-405c-9e77-64d3ab8aff77',
      xExternalUserId: '3072607c-8c59-4fc4-9a37-916825bc0f99',
    });
  }

  fillAdminCredentials() {
    this.setFieldsAndModel(
      {
        xExternalTenantId: '',
        xExternalUserId:
          this.webhookConfiguration.webhookSuperAdminExternalUserId,
      },
      { xExternalTenantIdIsRequired: false }
    );
  }

  private setFormlyFields(options?: {
    data?: Partial<WebhookAuthCredentials>;
    settings?: { xExternalTenantIdIsRequired: boolean };
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.webhookAuthFormService.getFormlyFields(options)
    );
  }
}
