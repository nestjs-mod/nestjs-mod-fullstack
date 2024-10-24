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
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { safeParseJson } from '@nestjs-mod-fullstack/common-angular';
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
    this.formlyFields$.next([
      {
        key: 'enabled',
        type: 'checkbox',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.enabled`,
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
          label: `webhook.form.endpoint`,
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
          label: `webhook.form.eventName`,
          placeholder: 'eventName',
          required: true,
          options: this.events.map((e) => ({
            value: e.eventName,
            label: e.description,
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
          label: `webhook.form.headers`,
          placeholder: 'headers',
          required: true,
        },
      },
      {
        key: 'requestTimeout',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.requestTimeout`,
          placeholder: 'requestTimeout',
          required: true,
        },
      },
    ]);
    this.formlyModel$.next(this.toModel(data));
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
    return this.webhookService.createOne(this.toJson(this.form.value));
  }

  updateOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.webhookService.updateOne(this.id, this.toJson(this.form.value));
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

  private toModel(data: Partial<WebhookObjectInterface>): object | null {
    return {
      enabled:
        (data['enabled'] as unknown as string) === 'true' ||
        data['enabled'] === true,
      endpoint: data['endpoint'],
      eventName: data['eventName'],
      headers: data['headers'] ? JSON.stringify(data['headers']) : '',
      requestTimeout:
        data['requestTimeout'] && !isNaN(+data['requestTimeout'])
          ? data['requestTimeout']
          : '',
    };
  }

  private toJson(data: Partial<WebhookObjectInterface>) {
    return {
      enabled: data['enabled'] === true,
      endpoint: data['endpoint'] || '',
      eventName: data['eventName'] || '',
      headers: data['headers'] ? safeParseJson(data['headers']) : null,
      requestTimeout:
        data['requestTimeout'] && !isNaN(+data['requestTimeout'])
          ? +data['requestTimeout']
          : undefined,
    };
  }
}
