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
import { RouterModule } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { AuthForgotPasswordFormService } from '../../services/auth-forgot-password-form.service';
import { AuthService } from '../../services/auth.service';
import { AuthForgotPasswordInput } from '../../services/auth.types';

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
    RouterModule,
    TranslocoDirective,
  ],
  styles: [
    `
      :host {
        width: 400px;
      }
    `,
  ],
  selector: 'auth-forgot-password-form',
  templateUrl: './auth-forgot-password-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthForgotPasswordFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterForgotPassword = new EventEmitter<true>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthForgotPasswordFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authForgotPasswordFormService: AuthForgotPasswordFormService,
    private readonly validationService: ValidationService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);

    this.translocoService.langChanges$
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.formlyFields$.next(this.formlyFields$.value);
        })
      )
      .subscribe();

    this.setFieldsAndModel({ email: '' });
  }

  setFieldsAndModel(data: AuthForgotPasswordInput = { email: '' }) {
    const model = { email: data.email };
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.form.value;
      this.authService
        .forgotPassword(value)
        .pipe(
          tap((result) => {
            if (result) {
              this.afterForgotPassword.next(result);
              this.nzMessageService.success(
                this.translocoService.translate(
                  "To complete the password change process, click the link in the email. If you haven't received the email, check your spam folder or try again."
                )
              );
            }
          }),
          catchError((err) =>
            this.validationService.catchAndProcessServerError(err, (options) =>
              this.setFormlyFields(options)
            )
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catchError((err: any) => {
            console.error(err);
            this.nzMessageService.error(
              this.translocoService.translate(err.error?.message || err.message)
            );
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

  private setFormlyFields(options?: {
    data?: AuthForgotPasswordInput;
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.authForgotPasswordFormService.getFormlyFields(options)
    );
  }
}
