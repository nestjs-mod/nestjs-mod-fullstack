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
import { RouterModule } from '@angular/router';
import { AuthToken, SignupInput } from '@authorizerdev/authorizer-js';
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
    NgIf,
    RouterModule,
  ],
  selector: 'auth-sign-up-form',
  templateUrl: './auth-sign-up-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSignUpFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSignUp = new EventEmitter<AuthToken>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthSignUpFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.setFieldsAndModel({ password: '', confirm_password: '' });
  }

  setFieldsAndModel(
    data: SignupInput = { password: '', confirm_password: '' }
  ) {
    this.formlyFields$.next([
      {
        key: 'email',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `auth.form.email`,
          placeholder: 'email',
          required: true,
        },
      },
      {
        key: 'password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `auth.form.password`,
          placeholder: 'password',
          required: true,
          type: 'password',
        },
      },
      {
        key: 'confirm_password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `auth.form.confirm_password`,
          placeholder: 'confirm_password',
          required: true,
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
        .signUp({ ...value })
        .pipe(
          tap((result) => {
            if (result.tokens) {
              this.afterSignUp.next(result.tokens);
              this.nzMessageService.success('Success');
            }
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
      this.nzMessageService.warning('Validation errors');
    }
  }

  private toModel(data: SignupInput): object | null {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }

  private toJson(data: SignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }
}
