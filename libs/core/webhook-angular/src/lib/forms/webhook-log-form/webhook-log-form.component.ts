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
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, mergeMap, of, tap, throwError } from 'rxjs';
import { WebhookLogFormService } from '../../services/webhook-log-form.service';
import {
  WebhookLogMapperService,
  WebhookLogModel,
} from '../../services/webhook-log-mapper.service';
import { WebhookLogService } from '../../services/webhook-log.service';

@UntilDestroy()
@Component({
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
  selector: 'webhook-log-form',
  templateUrl: './webhook-log-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookLogFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  data?: WebhookLogModel;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<WebhookLogModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: WebhookLogFormComponent,
    private readonly webhookLogService: WebhookLogService,
    private readonly translocoService: TranslocoService,
    private readonly webhookLogFormService: WebhookLogFormService,
    private readonly webhookLogMapperService: WebhookLogMapperService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.webhookLogFormService
      .init()
      .pipe(
        mergeMap(() => {
          if (this.id || this.data) {
            if (this.data) {
              return of(this.data).pipe(
                tap((result) => {
                  this.setFieldsAndModel(
                    this.webhookLogMapperService.toForm(result)
                  );
                }),
                tap((result) =>
                  this.afterFind.next({
                    ...result,
                  })
                )
              );
            }
            return this.findOne().pipe(
              tap((result) =>
                this.afterFind.next({
                  ...result,
                })
              )
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

  setFieldsAndModel(model?: Partial<object>) {
    this.setFormlyFields();
    this.formlyModel$.next(model || null);
  }

  findOne() {
    if (!this.id) {
      return throwError(
        () => new Error(this.translocoService.translate('id not set'))
      );
    }
    return this.webhookLogService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(this.webhookLogMapperService.toForm(result));
      })
    );
  }

  private setFormlyFields(options?: {
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.webhookLogFormService.getFormlyFields(options)
    );
  }
}
