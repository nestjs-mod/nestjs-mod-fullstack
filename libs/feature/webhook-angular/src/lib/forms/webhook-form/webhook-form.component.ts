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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  UpdateWebhookDtoInterface,
  ValidationErrorEnumInterface,
  ValidationErrorInterface,
  ValidationErrorMetadataInterface,
  WebhookInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import {
  BehaviorSubject,
  catchError,
  mergeMap,
  of,
  tap,
  throwError,
} from 'rxjs';
import { WebhookFormService } from '../../services/webhook-form.service';
import { WebhookService } from '../../services/webhook.service';

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
    TranslocoPipe,
  ],
  selector: 'webhook-form',
  templateUrl: './webhook-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<WebhookInterface>();

  @Output()
  afterCreate = new EventEmitter<WebhookInterface>();

  @Output()
  afterUpdate = new EventEmitter<WebhookInterface>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: WebhookFormComponent,
    private readonly webhookService: WebhookService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly webhookFormService: WebhookFormService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.webhookFormService
      .init()
      .pipe(
        mergeMap(() => {
          if (this.id) {
            return this.findOne().pipe(
              tap((result) => this.afterFind.next(result))
            );
          } else {
            this.setFieldsAndModel();
          }
          return of(true);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setFieldsAndModel(data: Partial<UpdateWebhookDtoInterface> = {}) {
    const model = this.webhookFormService.toModel(data);
    this.setFormlyFields();
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.id) {
      this.updateOne()
        .pipe(
          tap((result) => {
            if (result) {
              this.nzMessageService.success(
                this.translocoService.translate('Success')
              );
              this.afterUpdate.next(result);
            }
          }),
          untilDestroyed(this)
        )
        .subscribe();
    } else {
      this.createOne()
        .pipe(
          tap((result) => {
            if (result) {
              this.nzMessageService.success(
                this.translocoService.translate('Success')
              );
              this.afterCreate.next(result);
            }
          }),

          untilDestroyed(this)
        )
        .subscribe();
    }
  }

  createOne() {
    return this.webhookService
      .createOne(this.webhookFormService.toJson(this.form.value))
      .pipe(catchError((err) => this.catchAndProcessServerError(err)));
  }

  updateOne() {
    if (!this.id) {
      throw new Error(this.translocoService.translate('id not set'));
    }
    return this.webhookService
      .updateOne(this.id, this.webhookFormService.toJson(this.form.value))
      .pipe(catchError((err) => this.catchAndProcessServerError(err)));
  }

  findOne() {
    if (!this.id) {
      throw new Error(this.translocoService.translate('id not set'));
    }
    return this.webhookService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(result);
      })
    );
  }

  private setFormlyFields(options?: {
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(this.webhookFormService.getFormlyFields(options));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private catchAndProcessServerError(err: any) {
    const error = err.error as ValidationErrorInterface;
    if (error?.code?.includes(ValidationErrorEnumInterface.VALIDATION_000)) {
      this.setFormlyFields({ errors: error.metadata });
      return of(null);
    }
    return throwError(() => err);
  }
}
