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
import {
  ValidationErrorEnumInterface,
  ValidationErrorInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import {
  BehaviorSubject,
  catchError,
  merge,
  mergeMap,
  of,
  tap,
  throwError,
} from 'rxjs';
import { AuthProfileFormService } from '../../services/auth-profile-form.service';
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
    private readonly translocoService: TranslocoService,
    private readonly authProfileFormService: AuthProfileFormService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    merge(
      this.authProfileFormService.init(),
      this.translocoService.langChanges$
    )
      .pipe(
        mergeMap(() => {
          this.fillFromProfile();
          return of(true);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setFieldsAndModel(data: UpdateProfileInput = {}) {
    const model = this.authProfileFormService.toModel(data);
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  private setFormlyFields(options?: {
    data?: Partial<UpdateProfileInput>;
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.authProfileFormService.getFormlyFields(options)
    );
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.authProfileFormService.toJson(this.form.value);
      this.authService
        .updateProfile(value)
        .pipe(
          tap(() => {
            this.fillFromProfile();
            this.nzMessageService.success(
              this.translocoService.translate('Updated')
            );
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

  private fillFromProfile() {
    this.setFieldsAndModel(
      this.authService.profile$.value as UpdateProfileInput
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private catchAndProcessServerError(err: any) {
    const error = err.error as ValidationErrorInterface;
    if (error?.code?.includes(ValidationErrorEnumInterface.VALIDATION_000)) {
      this.setFormlyFields({ errors: error.metadata });
      return of(null);
    }
    return throwError(() => err);
  }
}