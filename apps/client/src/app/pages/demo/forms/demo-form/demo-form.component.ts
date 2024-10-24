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
import { AppDemoInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, tap } from 'rxjs';
import { DemoService } from '../../services/demo.service';

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
  selector: 'app-demo-form',
  templateUrl: './demo-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Input()
  inputs = {
    name: 'string',
  };

  @Output()
  afterFind = new EventEmitter<AppDemoInterface>();

  @Output()
  afterCreate = new EventEmitter<AppDemoInterface>();

  @Output()
  afterUpdate = new EventEmitter<AppDemoInterface>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: DemoFormComponent,
    private readonly demoService: DemoService,
    private readonly nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
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
  }

  setFieldsAndModel(data: Partial<AppDemoInterface> = {}) {
    this.formlyFields$.next(
      Object.keys(this.inputs)
        .filter((key) => this.getFormlyFieldType(key))
        .map((key) => ({
          key,
          type: this.getFormlyFieldType(key),
          validation: {
            show: true,
          },
          props: {
            label: `demo.form.${key}`,
            description: 'read-only field, set and updated on the backend',
            placeholder: key,
            required: false,
            readonly: true,
          },
        }))
    );
    this.formlyModel$.next(
      this.getFormValue(
        Object.keys(this.inputs)
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
          ) as AppDemoInterface
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
    return this.demoService.createOne();
  }

  updateOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.demoService.updateOne(this.id);
  }

  findOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.demoService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(result);
      })
    );
  }

  private getFormlyFieldType(key: string): string {
    if (!this.inputs[key]) {
      return '';
    }
    return 'input';
  }

  private getFormValue(data: AppDemoInterface) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        return [key, value];
      })
    ) as unknown as AppDemoInterface;
  }
}
