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
import {
  WebhookEventInterface,
  WebhookObjectInterface,
  WebhookScalarFieldEnumInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, tap } from 'rxjs';
import { WebhookEventsService } from '../../services/webhook-events.service';
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
    NgIf,
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

  @Input()
  inputs: Record<
    keyof Pick<
      typeof WebhookScalarFieldEnumInterface,
      'enabled' | 'endpoint' | 'eventName' | 'headers' | 'requestTimeout'
    >,
    'boolean' | 'string' | 'number' | 'text'
  > = {
    enabled: 'boolean',
    endpoint: 'string',
    eventName: 'string',
    headers: 'text',
    requestTimeout: 'number',
  };

  @Output()
  afterFind = new EventEmitter<WebhookObjectInterface>();

  @Output()
  afterCreate = new EventEmitter<WebhookObjectInterface>();

  @Output()
  afterUpdate = new EventEmitter<WebhookObjectInterface>();

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
    private readonly nzMessageService: NzMessageService
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

  setFieldsAndModel(data: Partial<WebhookObjectInterface> = {}) {
    this.formlyFields$.next(
      Object.keys(WebhookScalarFieldEnumInterface)
        .filter((key) => this.getFormlyFieldType(key))
        .map((key) => ({
          key,
          type: this.getFormlyFieldType(key),
          validation: {
            show: true,
          },
          props: {
            label: `webhook.form.${key}`,
            placeholder: key,
            required: true,
            options: this.events.map((e) => ({
              value: e.eventName,
              label: e.description,
            })),
          },
        }))
    );
    this.formlyModel$.next(
      this.getFormValue(
        Object.keys(WebhookScalarFieldEnumInterface)
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
          ) as WebhookObjectInterface
      )
    );
  }

  submitForm(): void {
    if (this.form.valid) {
      if (this.id) {
        this.updateOne()
          .pipe(
            tap((result) => {
              this.nzMessageService.success('Success');
              this.afterUpdate.next(result);
            }),
            untilDestroyed(this)
          )
          .subscribe();
      } else {
        this.createOne()
          .pipe(
            tap((result) => {
              this.nzMessageService.success('Success');
              this.afterCreate.next(result);
            }),

            untilDestroyed(this)
          )
          .subscribe();
      }
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning('Validation errors');
    }
  }

  createOne() {
    return this.webhookService.createOne({
      ...this.form.value,
      headers: this.safeParseJson(this.form.value.headers),
    });
  }

  updateOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.webhookService.updateOne(this.id, {
      ...this.form.value,
      headers: this.safeParseJson(this.form.value.headers),
    });
  }

  findOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.webhookService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(result);
      })
    );
  }

  private getFormlyFieldType(key: string): string {
    if (!this.inputs[key]) {
      return '';
    }
    if (key === 'eventName') {
      return 'select';
    }
    if (this.inputs[key] === 'boolean') {
      return 'checkbox';
    }
    if (this.inputs[key] === 'text') {
      return 'textarea';
    }
    return 'input';
  }

  private getFormValue(data: WebhookObjectInterface) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (this.inputs[key] === 'boolean') {
          value = Boolean(value === 'true' || value === true);
        }
        if (this.inputs[key] === 'number') {
          value = +Number(value);
        }
        return [key, value];
      })
    ) as unknown as WebhookObjectInterface;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private safeParseJson(data: any) {
    try {
      return JSON.parse(data);
    } catch (err) {
      return data;
    }
  }
}
