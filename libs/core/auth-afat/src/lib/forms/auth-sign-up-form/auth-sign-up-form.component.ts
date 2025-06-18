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
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, distinctUntilChanged, of, tap } from 'rxjs';
import { AuthSignUpFormService } from '../../services/auth-sign-up-form.service';
import { AuthSignUpMapperService } from '../../services/auth-sign-up-mapper.service';
import { AuthService } from '../../services/auth.service';
import { AuthSignupInput, AuthUserAndTokens } from '../../services/auth.types';
import { compare } from '@nestjs-mod/misc';

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
  selector: 'auth-sign-up-form',
  templateUrl: './auth-sign-up-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AuthSignUpFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSignUp = new EventEmitter<AuthUserAndTokens>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);
  errors?: ValidationErrorMetadataInterface[];

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthSignUpFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authSignUpFormService: AuthSignUpFormService,
    private readonly authSignUpMapperService: AuthSignUpMapperService,
    private readonly validationService: ValidationService,
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);

    this.translocoService.langChanges$
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.formlyFields$.next(this.formlyFields$.value);
        }),
      )
      .subscribe();

    this.form.valueChanges
      .pipe(
        distinctUntilChanged((prev, cur) => compare(prev, cur).different.length === 0),
        tap((data) => {
          if (this.errors?.length) {
            this.setFormlyFields({ data, errors: [] });
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();

    this.setFieldsAndModel({ password: '', confirmPassword: '' });
  }

  setFieldsAndModel(data: AuthSignupInput = { password: '', confirmPassword: '' }) {
    const model = this.authSignUpMapperService.toModel(data);
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.authSignUpMapperService.toJson(this.form.value);
      this.authService
        .signUp({ ...value })
        .pipe(
          tap((result) => {
            if (result.tokens) {
              this.afterSignUp.next(result);
              this.nzMessageService.success(this.translocoService.translate('Success'));
            }
          }),
          catchError((err) =>
            this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catchError((err: any) => {
            console.error(err);
            this.nzMessageService.error(this.translocoService.translate(err.error?.message || err.message));
            return of(null);
          }),
          untilDestroyed(this),
        )
        .subscribe();
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning(this.translocoService.translate('Validation errors'));
    }
  }

  private setFormlyFields(options?: { data?: AuthSignupInput; errors?: ValidationErrorMetadataInterface[] }) {
    this.formlyFields$.next(this.authSignUpFormService.getFormlyFields(options));
    this.errors = options?.errors || [];
  }
}
