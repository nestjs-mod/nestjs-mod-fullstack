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
import { UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { FilesFormlyModule } from '@nestjs-mod-fullstack/files-angular';
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
    FilesFormlyModule,
  ],
  selector: 'auth-profile-form',
  templateUrl: './auth-profile-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthProfileFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterUpdateProfile = new EventEmitter<User>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthProfileFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.fillFromProfile();
  }

  setFieldsAndModel(data: UpdateProfileInput = {}) {
    this.formlyFields$.next([
      {
        key: 'picture',
        type: 'file-select',
        validation: {
          show: true,
        },
        props: {
          label: `auth.profile-form.picture`,
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
          label: `auth.profile-form.old_password`,
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
          label: `auth.profile-form.new_password`,
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
          label: `auth.profile-form.confirm_new_password`,
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
          tap((result) => {
            if (result) {
              this.authService.setProfile(result);
              this.fillFromProfile();
              this.afterUpdateProfile.next(result);
              this.nzMessageService.success('Updated');
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
