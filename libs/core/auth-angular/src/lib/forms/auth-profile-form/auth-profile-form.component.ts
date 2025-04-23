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
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, merge, mergeMap, of, tap } from 'rxjs';
import { AuthProfileFormService } from '../../services/auth-profile-form.service';
import { AuthProfileMapperService } from '../../services/auth-profile-mapper.service';
import { AuthService } from '../../services/auth.service';
import { AuthUpdateProfileInput } from '../../services/auth.types';

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
    private readonly authProfileFormService: AuthProfileFormService,
    private readonly authProfileMapperService: AuthProfileMapperService,
    private readonly validationService: ValidationService
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

  setFieldsAndModel(data: AuthUpdateProfileInput = {}) {
    const model = this.authProfileMapperService.toModel(data);
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  private setFormlyFields(options?: {
    data?: Partial<AuthUpdateProfileInput>;
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.authProfileFormService.getFormlyFields(options)
    );
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.authProfileMapperService.toJson(this.form.value);
      this.authService
        .updateProfile(value)
        .pipe(
          tap(() => {
            this.fillFromProfile();
            this.nzMessageService.success(
              this.translocoService.translate(
                'Profile data updated successfully!'
              )
            );
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

  private fillFromProfile() {
    this.formlyFields$.next(this.formlyFields$.value);
    this.setFieldsAndModel(
      this.authService.profile$.value as AuthUpdateProfileInput
    );
  }
}
