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
import {
  UpdateWebhookDtoInterface,
  ValidationErrorEnumInterface,
  ValidationErrorInterface,
  ValidationErrorMetadataInterface,
  WebhookEventInterface,
  WebhookInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { safeParseJson } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';
import { WebhookEventsService } from '../../services/webhook-events.service';
import { WebhookService } from '../../services/webhook.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

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

  events: WebhookEventInterface[] = [];

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: WebhookFormComponent,
    private readonly webhookService: WebhookService,
    private readonly webhookEventsService: WebhookEventsService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.webhookEventsService
      .findMany()
      .pipe(
        tap((events) => {
          this.events = events;

          if (this.id) {
            this.findOne()
              .pipe(
                tap((result) => this.afterFind.next(result)),
                untilDestroyed(this)
              )
              .subscribe();
          } else {
            this.setFieldsAndModel();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setFieldsAndModel(data: Partial<UpdateWebhookDtoInterface> = {}) {
    this.setFormlyFields();
    this.formlyModel$.next(this.toModel(data));
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
      .createOne(this.toJson(this.form.value))
      .pipe(catchError((err) => this.catchAndProcessServerError(err)));
  }

  updateOne() {
    if (!this.id) {
      throw new Error(this.translocoService.translate('id not set'));
    }
    return this.webhookService
      .updateOne(this.id, this.toJson(this.form.value))
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

  private setFormlyFields(errors?: ValidationErrorMetadataInterface[]) {
    this.formlyFields$.next(
      this.appendServerErrorsAsValidatorsToFields(
        [
          {
            key: 'enabled',
            type: 'checkbox',
            validation: {
              show: true,
            },
            props: {
              label: this.translocoService.translate(
                `webhook.form.fields.enabled`
              ),
              placeholder: 'enabled',
              required: true,
            },
          },
          {
            key: 'endpoint',
            type: 'input',
            validation: {
              show: true,
            },
            props: {
              label: this.translocoService.translate(
                `webhook.form.fields.endpoint`
              ),
              placeholder: 'endpoint',
              required: true,
            },
          },
          {
            key: 'eventName',
            type: 'select',
            validation: {
              show: true,
            },
            props: {
              label: this.translocoService.translate(
                `webhook.form.fields.event-name`
              ),
              placeholder: 'eventName',
              required: true,
              options: this.events.map((e) => ({
                value: e.eventName,
                label: `${e.eventName} - ${e.description}`,
              })),
            },
          },
          {
            key: 'headers',
            type: 'textarea',
            validation: {
              show: true,
            },
            props: {
              label: this.translocoService.translate(
                `webhook.form.fields.headers`
              ),
              placeholder: 'headers',
            },
          },
          {
            key: 'requestTimeout',
            type: 'input',
            validation: {
              show: true,
            },
            props: {
              type: 'number',
              label: this.translocoService.translate(
                `webhook.form.fields.request-timeout`
              ),
              placeholder: 'requestTimeout',
              required: false,
            },
          },
        ],
        errors
      )
    );
  }

  private appendServerErrorsAsValidatorsToFields(
    fields: FormlyFieldConfig[],
    errors?: ValidationErrorMetadataInterface[]
  ) {
    return (fields || []).map((f: FormlyFieldConfig) => {
      const error = errors?.find((e) => e.property === f.key);
      if (error) {
        f.validators = Object.fromEntries(
          error.constraints.map((c) => {
            return [
              c.name === 'isNotEmpty' ? 'required' : c.name,
              {
                expression: () => false,
                message: () => c.description,
              },
            ];
          })
        );
      }
      return f;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private catchAndProcessServerError(err: any) {
    const error = err.error as ValidationErrorInterface;
    if (error.code.includes(ValidationErrorEnumInterface.VALIDATION_000)) {
      this.setFormlyFields(error.metadata);
      return of(null);
    }
    return throwError(() => err);
  }

  private toModel(data: Partial<UpdateWebhookDtoInterface>): object | null {
    return {
      enabled:
        (data['enabled'] as unknown as string) === 'true' ||
        data['enabled'] === true,
      endpoint: data['endpoint'],
      eventName: data['eventName'],
      headers: data['headers'] ? JSON.stringify(data['headers']) : '',
      requestTimeout: data['requestTimeout'] ? +data['requestTimeout'] : '',
    };
  }

  private toJson(data: Partial<UpdateWebhookDtoInterface>) {
    return {
      enabled: data['enabled'] === true,
      endpoint: data['endpoint'] || '',
      eventName: data['eventName'] || '',
      headers: data['headers'] ? safeParseJson(data['headers']) : null,
      requestTimeout: data['requestTimeout'] || undefined,
    };
  }
}
