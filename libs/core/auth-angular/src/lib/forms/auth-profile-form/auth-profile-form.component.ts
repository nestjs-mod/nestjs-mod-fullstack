import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
    RouterModule,
    TranslocoDirective,
  ],
  selector: 'auth-profile-form',
  template: `@if (formlyFields$ | async; as formlyFields) {
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
      <formly-form
        [model]="formlyModel$ | async"
        [fields]="formlyFields"
        [form]="form"
      >
      </formly-form>
      @if (!hideButtons) {
      <nz-form-control>
        <div class="flex justify-between">
          <div></div>
          <button
            nz-button
            nzType="primary"
            type="submit"
            [disabled]="!form.valid"
            transloco="Update"
          ></button>
        </div>
      </nz-form-control>
      }
    </form>
    } `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthProfileFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthProfileFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.fillFromProfile();
  }

  setFieldsAndModel(data: UpdateProfileInput = {}) {
    this.formlyFields$.next([
      {
        key: 'picture',
        type: 'image-file',
        validation: {
          show: true,
        },
        props: {
          label: this.translocoService.translate(
            `auth.profile-form.fields.picture`
          ),
          placeholder: 'picture',
        },
      },
      {
        key: 'old_password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: this.translocoService.translate(
            `auth.profile-form.fields.old-password`
          ),
          placeholder: 'old_password',
          type: 'password',
        },
      },
      {
        key: 'new_password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: this.translocoService.translate(
            `auth.profile-form.fields.new-password`
          ),
          placeholder: 'new_password',
          type: 'password',
        },
      },
      {
        key: 'confirm_new_password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: this.translocoService.translate(
            `auth.profile-form.fields.confirm-new-password`
          ),
          placeholder: 'confirm_new_password',
          type: 'password',
        },
      },
    ]);
    this.formlyModel$.next(this.toModel(data));
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.toJson(this.form.value);
      this.authService
        .updateProfile(value)
        .pipe(
          tap(() => {
            this.fillFromProfile();
            this.nzMessageService.success(
              this.translocoService.translate('Updated')
            );
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catchError((err: any) => {
            console.error(err);
            this.nzMessageService.error(err.message);
            return of(null);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning(
        this.translocoService.translate('Validation errors')
      );
    }
  }

  private fillFromProfile() {
    this.setFieldsAndModel({
      picture: this.authService.profile$.value?.picture || '',
    });
  }

  private toModel(data: UpdateProfileInput): object | null {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }

  private toJson(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }
}
