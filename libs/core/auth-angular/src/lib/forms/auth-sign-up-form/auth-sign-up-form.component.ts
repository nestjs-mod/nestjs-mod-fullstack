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
import { AuthToken, SignupInput } from '@authorizerdev/authorizer-js';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';
import { AuthSignUpFormService } from '../../services/auth-sign-up-form.service';
import { AuthService } from '../../services/auth.service';
import {
  ValidationErrorEnumInterface,
  ValidationErrorInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';

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
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authSignUpFormService: AuthSignUpFormService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.setFieldsAndModel({ password: '', confirm_password: '' });
  }

  setFieldsAndModel(
    data: SignupInput = { password: '', confirm_password: '' }
  ) {
    const model = this.authSignUpFormService.toModel(data);
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.authSignUpFormService.toJson(this.form.value);
      this.authService
        .signUp({ ...value })
        .pipe(
          tap((result) => {
            if (result.tokens) {
              this.afterSignUp.next(result.tokens);
              this.nzMessageService.success(
                this.translocoService.translate('Success')
              );
            }
          }),
          catchError((err) => this.catchAndProcessServerError(err)),
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

  private setFormlyFields(options?: {
    data?: SignupInput;
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.authSignUpFormService.getFormlyFields(options)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private catchAndProcessServerError(err: any) {
    const error = err.error as ValidationErrorInterface;
    if (error.code?.includes(ValidationErrorEnumInterface.VALIDATION_000)) {
      this.setFormlyFields({ errors: error.metadata });
      return of(null);
    }
    return throwError(() => err);
  }
}
