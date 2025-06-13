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
import {
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { AuthSignInFormService } from '../../services/auth-sign-in-form.service';
import { AuthSignInMapperService } from '../../services/auth-sign-in-mapper.service';
import { AuthService } from '../../services/auth.service';
import {
  AuthLoginInput,
  AuthUserAndTokens,
  OAuthProvider,
} from '../../services/auth.types';
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
    TranslocoPipe,
    TranslocoDirective,
    NzIconModule,
  ],
  selector: 'auth-sign-in-form',
  templateUrl: './auth-sign-in-form.component.html',
  styles: [
    `
      :host {
        width: 400px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSignInFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSignIn = new EventEmitter<AuthUserAndTokens>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);
  oAuthProviders$ = new BehaviorSubject<OAuthProvider[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthSignInFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authSignInFormService: AuthSignInFormService,
    private readonly authSignInMapperService: AuthSignInMapperService,
    private readonly validationService: ValidationService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);

    this.loadOAuthProviders();

    this.translocoService.langChanges$
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.formlyFields$.next(this.formlyFields$.value);
        })
      )
      .subscribe();

    this.setFieldsAndModel({ password: '' });
  }

  private loadOAuthProviders() {
    this.authService
      .getOAuthProviders()
      .pipe(
        tap((oAuthProviders) =>
          this.oAuthProviders$.next(
            oAuthProviders.length === 0 ? null : oAuthProviders
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setFieldsAndModel(data: AuthLoginInput = { password: '' }) {
    const model = this.authSignInMapperService.toModel(data);
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.authSignInMapperService.toJson(this.form.value);
      this.authService
        .signIn(value)
        .pipe(
          tap((result) => {
            if (result.tokens) {
              this.afterSignIn.next(result);
              this.nzMessageService.success(
                this.translocoService.translate('Success')
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
    data?: AuthLoginInput;
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.authSignInFormService.getFormlyFields(options)
    );
  }
}
