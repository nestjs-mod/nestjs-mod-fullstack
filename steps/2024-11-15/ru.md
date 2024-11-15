## [2024-11-15] Интеграция внешнего файлового сервера https://min.io в фулстек приложение на NestJS и Angular

Предыдущая статья: [Интеграция внешнего сервера авторизации https://authorizer.dev в фулстек приложение на NestJS и Angular](https://habr.com/ru/articles/856896/)

В этой статье я подключу в проект внешний файловый сервер https://min.io и напишу дополнительные бэкенд и фронтенд модули для интеграции с ним.

### 1. Создаем Angular-библиотеку по работе с файлами

Создаем пустую `Angular`-библиотеку для хранения компонент и сервисов для отправки файлов на сервер.

_Команды_

```bash
# Create Angular library
./node_modules/.bin/nx g @nx/angular:library --name=files-angular --buildable --publishable --directory=libs/core/files-angular --simpleName=true --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/files-angular

# Change file with test options
rm -rf libs/core/files-angular/src/test-setup.ts
cp apps/client/src/test-setup.ts libs/core/files-angular/src/test-setup.ts
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx g @nx/angular:library --name=files-angular --buildable --publishable --directory=libs/core/files-angular --simpleName=true --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/files-angular

 NX  Generating @nx/angular:library

CREATE libs/core/files-angular/project.json
CREATE libs/core/files-angular/README.md
CREATE libs/core/files-angular/ng-package.json
CREATE libs/core/files-angular/package.json
CREATE libs/core/files-angular/tsconfig.json
CREATE libs/core/files-angular/tsconfig.lib.json
CREATE libs/core/files-angular/tsconfig.lib.prod.json
CREATE libs/core/files-angular/src/index.ts
CREATE libs/core/files-angular/jest.config.ts
CREATE libs/core/files-angular/src/test-setup.ts
CREATE libs/core/files-angular/tsconfig.spec.json
CREATE libs/core/files-angular/src/lib/files-angular/files-angular.component.css
CREATE libs/core/files-angular/src/lib/files-angular/files-angular.component.html
CREATE libs/core/files-angular/src/lib/files-angular/files-angular.component.spec.ts
CREATE libs/core/files-angular/src/lib/files-angular/files-angular.component.ts
CREATE libs/core/files-angular/.eslintrc.json
UPDATE tsconfig.base.json

 NX   👀 View Details of files-angular

Run "nx show project files-angular" to view details about this project.
```

</spoiler>

### 2. Создаем NestJS-библиотеку по работе с файлами

Создаем пустую `NestJS`-библиотеку.

_Команды_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library files --buildable --publishable --directory=libs/core/files --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library files --buildable --publishable --directory=libs/core/files --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/core/files/tsconfig.json
CREATE libs/core/files/src/index.ts
CREATE libs/core/files/tsconfig.lib.json
CREATE libs/core/files/README.md
CREATE libs/core/files/package.json
CREATE libs/core/files/project.json
CREATE libs/core/files/.eslintrc.json
CREATE libs/core/files/jest.config.ts
CREATE libs/core/files/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/core/files/src/lib/files.configuration.ts
CREATE libs/core/files/src/lib/files.constants.ts
CREATE libs/core/files/src/lib/files.environments.ts
CREATE libs/core/files/src/lib/files.module.ts
```

</spoiler>

### 3. Устанавливаем дополнительные библиотеки

Устанавливаем `JS`-клиент и `NestJS`-модуль для работы с файловым сервером `minio` с фронтенда и бэкенда.

_Команды_

```bash
npm install --save minio nestjs-minio @nestjs-mod/minio
```

<spoiler title="Вывод консоли">

```bash
$ npm install --save minio nestjs-minio @nestjs-mod/minio

added 29 packages, removed 2 packages, and audited 2916 packages in 22s

362 packages are looking for funding
  run `npm fund` for details

41 vulnerabilities (19 low, 7 moderate, 15 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

</spoiler>

### 4. Подключаем новые модули в бэкенд

_apps/server/src/main.ts_

```typescript

import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeAuthorizer,
  DockerComposeMinio,
  DockerComposePostgreSQL,
} from '@nestjs-mod/docker-compose';
// ...
import { MinioModule } from '@nestjs-mod/minio';
// ...

import { ExecutionContext } from '@nestjs/common';
// ...
bootstrapNestApplication({
  modules: {
   // ...

    core: [
      MinioModule.forRoot(),
    ],
    infrastructure: [
      DockerComposeMinio.forRoot({
        staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
      }),
    ]}
    );
```

### 5. Запускаем генерацию дополнительного кода по инфраструктуре

_Команды_

```bash
npm run docs:infrastructure
```

### 6. Добавляем весь необходимый код в модуль FilesModule (NestJS-библиотека)

Так как основная логика по подключению к файловому серверу и работа с ним происходит с помощью библиотеки `@nestjs-mod/minio`, то в нашей новой библиотеке будет только контроллер который будет предоставлять фронтенд приложению необходимые методы и при этом проверять права пользователя.

Загрузка файла с фронтенда происходит с помощью временной ссылки напрямую в файловый сервер, временную ссылку создает наш бэкенд.

Удалять загруженные файлы могут только пользователи кто загрузил файл и администраторы сайта.

Идентификатор пользователя должен находится в `Request`, в поле `externalUserId`.

Создаем файл _libs/core/files/src/lib/controllers/files.controller.ts_

```typescript
import { Controller, Get, Post, Query } from '@nestjs/common';

import { MinioConfiguration, MinioFilesService, PresignedUrlsRequest, PresignedUrls as PresignedUrlsResponse } from '@nestjs-mod/minio';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { FilesError, FilesErrorEnum } from '../files.errors';

import { CurrentFilesRequest } from '../files.decorators';
import { FilesRequest } from '../types/files-request';
import { StatusResponse } from '@nestjs-mod-fullstack/common';
import { map } from 'rxjs';
import { FilesRole } from '../types/files-role';

export class GetPresignedUrlArgs implements PresignedUrlsRequest {
  @ApiProperty({ type: String })
  ext!: string;
}

export class PresignedUrls implements PresignedUrlsResponse {
  @ApiProperty({ type: String })
  downloadUrl!: string;

  @ApiProperty({ type: String })
  uploadUrl!: string;
}

export class DeleteFileArgs {
  @ApiProperty({ type: String })
  downloadUrl!: string;
}

@ApiExtraModels(FilesError)
@Controller()
export class FilesController {
  constructor(private readonly minioConfiguration: MinioConfiguration, private readonly minioFilesService: MinioFilesService) {}

  @Get('/files/get-presigned-url')
  @ApiOkResponse({ type: PresignedUrls })
  getPresignedUrl(@Query() getPresignedUrlArgs: GetPresignedUrlArgs, @CurrentFilesRequest() filesRequest: FilesRequest) {
    const bucketName = Object.entries(this.minioConfiguration.buckets || {})
      .filter(([, options]) => options.ext.includes(getPresignedUrlArgs.ext))
      .map(([name]) => name)?.[0];
    if (!bucketName) {
      throw new FilesError(`Uploading files with extension "{{ext}}" is not supported`, FilesErrorEnum.FORBIDDEN, { ext: getPresignedUrlArgs.ext });
    }
    return this.minioFilesService.getPresignedUrls({
      bucketName,
      expiry: 60,
      ext: getPresignedUrlArgs.ext,
      userId: filesRequest.externalUserId,
    });
  }

  @Post('/files/delete-file')
  @ApiOkResponse({ type: StatusResponse })
  deleteFile(@Query() deleteFileArgs: DeleteFileArgs, @CurrentFilesRequest() filesRequest: FilesRequest) {
    if (filesRequest.filesUser?.userRole === FilesRole.Admin || deleteFileArgs.downloadUrl.includes(`/${filesRequest.externalUserId}/`)) {
      return this.minioFilesService.deleteFile(deleteFileArgs.downloadUrl).pipe(map(() => ({ message: 'ok' })));
    }
    throw new FilesError(`Only those who uploaded files can delete them`, FilesErrorEnum.FORBIDDEN);
  }
}
```

Добавляем контроллер в `FilesModule`, и подключаем `MinioModule.forFeature` для доступа к сервисам внешнего модуля.

Обновляем файл _libs/core/files/src/lib/files.module.ts_

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { MinioModule } from '@nestjs-mod/minio';
import { FilesController } from './controllers/files.controller';
import { FILES_FEATURE, FILES_MODULE } from './files.constants';

export const { FilesModule } = createNestModule({
  moduleName: FILES_MODULE,
  moduleCategory: NestModuleCategory.feature,
  controllers: [FilesController],
  imports: [
    MinioModule.forFeature({
      featureModuleName: FILES_FEATURE,
    }),
  ],
});
```

### 7. Добавляем модуль FilesModule в main.ts

Добавляем модуль FilesModule в импорты приложения, а также модифицируем внешний валидатор модуля сервера авторизации, в котором расширяем `Request`-пользователя дополнительным обьектом `filesUser` в котором будет храниться роль пользователя.

Обновляем файл _apps/server/src/main.ts_

```typescript
//...
import { FilesModule } from '@nestjs-mod-fullstack/files';

bootstrapNestApplication({
  modules: {
    //...
    core: [
      AuthorizerModule.forRootAsync({
        //...
        configurationFactory: (webhookUsersService: WebhookUsersService) => {
          return {
            //...
            checkAccessValidator: async (authorizerUser?: AuthorizerUser, options?: CheckAccessOptions, ctx?: ExecutionContext) => {
              //...

              if (ctx && authorizerUser?.id) {
                const req: WebhookRequest & FilesRequest = getRequestFromExecutionContext(ctx);

                //...
                req.externalTenantId = webhookUser.externalTenantId;

                // files
                req.filesUser = {
                  userRole: authorizerUser.roles?.includes('admin') ? FilesRole.Admin : FilesRole.User,
                };
              }

              return result;
            },
          };
        },
      }),
      FilesModule.forRoot(),
      //...
    ],
    //...
  },
  //...
});
```

### 8. Добавляем весь необходимый код в Angular-библиотеку по работе с файлами

Отправка файлов происходит на адрес полученный с нашего бэкенда.

Файл можно как загрузить так и удалить, удаление происходит с помощью запроса на наш бекенд.

Все необходимые методы для работы с нашим бэкендом и сервером авторизации создаем в сервисе `FilesService`.

Создаем файл _libs/core/files-angular/src/lib/services/files.service.ts_

```typescript
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { FilesRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { PresignedUrls } from '@nestjs-mod-fullstack/app-rest-sdk';
import { Observable, from, map, mergeMap, of } from 'rxjs';

export const MINIO_URL = new InjectionToken<string>('MinioURL');

@Injectable({ providedIn: 'root' })
export class FilesService {
  constructor(
    @Inject(MINIO_URL)
    private readonly minioURL: string,
    private readonly filesRestService: FilesRestService
  ) {}

  getPresignedUrlAndUploadFile(file: null | undefined | string | File) {
    if (!file) {
      return of('');
    }
    if (typeof file !== 'string') {
      return this.getPresignedUrl(file).pipe(
        mergeMap((presignedUrls) =>
          this.uploadFile({
            file,
            presignedUrls,
          })
        ),
        map((presignedUrls) => presignedUrls.downloadUrl.replace(this.minioURL, ''))
      );
    }
    return of(file.replace(this.minioURL, ''));
  }

  getPresignedUrl(file: File) {
    return from(this.filesRestService.filesControllerGetPresignedUrl(this.getFileExt(file)));
  }

  uploadFile({ file, presignedUrls }: { file: File; presignedUrls: PresignedUrls }) {
    return new Observable<PresignedUrls>((observer) => {
      const outPresignedUrls: PresignedUrls = {
        downloadUrl: this.minioURL + presignedUrls.downloadUrl,
        uploadUrl: this.minioURL + presignedUrls.uploadUrl,
      };
      if (presignedUrls.uploadUrl) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', outPresignedUrls.uploadUrl);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              observer.next(outPresignedUrls);
              observer.complete();
            } else {
              observer.error(new Error('Error in upload file'));
            }
          }
        };
        xhr.send(file);
      } else {
        observer.next(outPresignedUrls);
        observer.complete();
      }
    });
  }

  deleteFile(downloadUrl: string) {
    return from(this.filesRestService.filesControllerDeleteFile(downloadUrl));
  }

  private getFileExt(file: File) {
    return file?.type?.split('/')?.[1].toLowerCase();
  }
}
```

Создаем компоненту для `Formly`, которая добавит поддержку загрузки и отображения файлов с изображениями.

Создаем файл _libs/core/files-angular/src/lib/formly/image-file.component.ts_

```typescript
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { BehaviorSubject } from 'rxjs';
import { MINIO_URL } from '../services/files.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'image-file',
  imports: [ReactiveFormsModule, FormlyModule, NzInputModule, NzButtonModule, NzUploadModule, NzModalModule, NzIconModule, AsyncPipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-upload [nzAccept]="'image/png, image/jpeg'" [nzListType]="'picture'" [nzFileList]="(fileList$ | async)!" (nzFileListChange)="onFileListChange($event)" [nzLimit]="1" [nzBeforeUpload]="beforeUpload">
      <button nz-button type="button">
        <span nz-icon [nzType]="(icon$ | async)!"></span>
        {{ title$ | async }}
      </button>
    </nz-upload>
  `,
})
export class ImageFileComponent extends FieldType<FieldTypeConfig> implements OnInit {
  fileList$ = new BehaviorSubject<NzUploadFile[]>([]);
  title$ = new BehaviorSubject<string>('');
  icon$ = new BehaviorSubject<string>('');

  constructor(
    @Inject(MINIO_URL)
    private readonly minioURL: string
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.formControl.value) {
      this.switchToReloadMode();
      this.fileList$.next([
        {
          uid: this.formControl.value,
          name: this.formControl.value.split('/').at(-1),
          status: 'done',
          url: this.minioURL + this.formControl.value,
        },
      ]);
    } else {
      this.switchToUploadMode();
    }
  }

  onFileListChange(files: NzUploadFile[]) {
    if (files.length === 0) {
      this.formControl.setValue(null);
      this.fileList$.next([]);
      this.switchToUploadMode();
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.formControl.setValue(file);
    this.switchToReloadMode();
    this.fileList$.next([file]);
    return false;
  };

  private switchToReloadMode() {
    this.icon$.next('reload');
    this.title$.next('Change file');
  }

  private switchToUploadMode() {
    this.icon$.next('upload');
    this.title$.next('Select file...');
  }
}
```

Регистрируем компоненту в `FormlyModule`.

Обновляем файл _apps/client/src/app/app.config.ts_

```typescript
// ..
export const appConfig = ({
  authorizerURL,
  minioURL,
}: {
  authorizerURL: string;
  minioURL: string;
}): ApplicationConfig => {
  return {
    providers: [
      // ..
      importProvidersFrom(
        // ..
        FormlyModule.forRoot({
          types: [
            {
              name: 'image-file',
              component: ImageFileComponent,
              extends: 'input',
            },
          ],
        }),
        // ..
      )
      // ..
    ]}
```

### 9. Добавляем форму и метод в сервисе для модификации профиля в Angular-модуль по авторизации

Создаем форму для отображения и редактирования профиля, в рамках данной статьи я добавляю только возможность смены пароля и загрузку изображения для пользователя сервера авторизации.

Создаем файл _libs/core/auth-angular/src/lib/forms/auth-profile-form/auth-profile-form.component.ts_

```typescript
import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { ImageFileComponent } from '@nestjs-mod-fullstack/files-angular';
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
  imports: [FormlyModule, NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, AsyncPipe, NgIf, RouterModule, ImageFileComponent],
  selector: 'auth-profile-form',
  template: `@if (formlyFields$ | async; as formlyFields) {
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
      <formly-form [model]="formlyModel$ | async" [fields]="formlyFields" [form]="form"> </formly-form>
      @if (!hideButtons) {
      <nz-form-control>
        <div class="flex justify-between">
          <div></div>
          <button nz-button nzType="primary" type="submit" [disabled]="!form.valid">Update</button>
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
        type: 'image-file',
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
          tap(() => {
            this.fillFromProfile();
            this.nzMessageService.success('Updated');
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
```

Хотя мы и видем файловое поле в форме профиля, физически модуль авторизации и файловый модуль не связаны, но при сохранении данных по профилю нам нужно предварительно загрузить файл на внешний файловый сервер и ссылку на этот файл записать в поле изображения профиля.

Связь файлового модуля и формы редактирования профиля будем докидывать с помощью дополнительных обработчиков с верхнего уровня приложения используя `DI` от `Angular`.

Создаем файл _libs/core/auth-angular/src/lib/services/auth.configuration.ts_

```typescript
import { InjectionToken } from '@angular/core';
import { UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { Observable } from 'rxjs';

export type AfterUpdateProfileEvent = {
  old?: User;
  new?: User;
};

export class AuthConfiguration {
  constructor(options?: AuthConfiguration) {
    Object.assign(this, options);
  }

  beforeUpdateProfile?(data: UpdateProfileInput): Observable<UpdateProfileInput>;

  afterUpdateProfile?(data: AfterUpdateProfileEvent): Observable<User | undefined>;
}

export const AUTH_CONFIGURATION_TOKEN = new InjectionToken<string>('AUTH_CONFIGURATION_TOKEN');
```

Добавляем новый метод для обновления профиля в `AuthService`, который будет проверять наличие дополнительных обработчиков в конфиге.

Создаем файл _libs/core/auth-angular/src/lib/services/auth.configuration.ts_

```typescript
import { Inject, Injectable, Optional } from '@angular/core';
import { AuthToken, LoginInput, SignupInput, UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { mapGraphqlErrors } from '@nestjs-mod-fullstack/common-angular';
import { BehaviorSubject, catchError, from, map, mergeMap, of, tap } from 'rxjs';
import { AUTH_CONFIGURATION_TOKEN, AuthConfiguration } from './auth.configuration';
import { AuthorizerService } from './authorizer.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  profile$ = new BehaviorSubject<User | undefined>(undefined);
  tokens$ = new BehaviorSubject<AuthToken | undefined>(undefined);

  constructor(
    private readonly authorizerService: AuthorizerService,
    @Optional()
    @Inject(AUTH_CONFIGURATION_TOKEN)
    private readonly authConfiguration?: AuthConfiguration
  ) {}

  // ..

  updateProfile(data: UpdateProfileInput) {
    const oldProfile = this.profile$.value;
    return (this.authConfiguration?.beforeUpdateProfile ? this.authConfiguration.beforeUpdateProfile(data) : of(data)).pipe(
      mergeMap((data) =>
        from(
          this.authorizerService.updateProfile({
            ...data,
          })
        )
      ),
      mapGraphqlErrors(),
      mergeMap(() => this.authorizerService.getProfile()),
      mapGraphqlErrors(),
      tap((result) => this.setProfile(result)),
      mergeMap((updatedProfile) =>
        this.authConfiguration?.afterUpdateProfile
          ? this.authConfiguration.afterUpdateProfile({
              new: updatedProfile,
              old: oldProfile,
            })
          : of({
              new: updatedProfile,
            })
      )
    );
  }
  // ..
}
```

### 10. Описываем и подключаем интеграцию модуля авторизации и файлового модуля

Создаем файл _apps/client/src/app/integrations/auth.configuration.ts_

```typescript
import { Provider } from '@angular/core';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { AfterUpdateProfileEvent, AUTH_CONFIGURATION_TOKEN, AuthConfiguration } from '@nestjs-mod-fullstack/auth-angular';
import { FilesService } from '@nestjs-mod-fullstack/files-angular';
import { map, Observable, of } from 'rxjs';

export class AppAuthConfiguration implements AuthConfiguration {
  constructor(private readonly filesService: FilesService) {}

  beforeUpdateProfile(data: UpdateProfileInput): Observable<UpdateProfileInput> {
    if (data.picture) {
      return this.filesService.getPresignedUrlAndUploadFile(data.picture).pipe(
        map((picture) => {
          return {
            ...data,
            picture,
          };
        })
      );
    }
    return of({ ...data, picture: '' });
  }

  afterUpdateProfile(event: AfterUpdateProfileEvent) {
    if (event.old?.picture && event.new?.picture !== event.old.picture) {
      return this.filesService.deleteFile(event.old.picture).pipe(map(() => event.new));
    }
    return of(event.new);
  }
}

export function provideAppAuthConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: AppAuthConfiguration,
    deps: [FilesService],
  };
}
```

Подключаем интеграцию в конфиг `Angular`-приложения.

Обновляем файл _apps/client/src/app/app.config.ts_

```typescript

export const appConfig = ({
  authorizerURL,
  minioURL,
}: {
  authorizerURL: string;
  minioURL: string;
}): ApplicationConfig => {
  return {
    providers: [
      // ..
      provideAppAuthConfiguration(),
      // ..
    ]
  }
```

### 11. Обновляем файлы и добавляем новые для запуска docker-compose и kubernetes

Полностью описывать изменения во всех файлах я не буду, их можно посмотреть по коммиту с изменениями для текущего поста, ниже просто добавлю обновленный `docker-compose-full.yml` и его файл с переменными окружения.

Обновляем файл _.docker/docker-compose-full.yml_

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-postgre-sql:
    image: 'bitnami/postgresql:15.5.0'
    container_name: 'nestjs-mod-fullstack-postgre-sql'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'pg_isready -U postgres'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
    environment:
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
  nestjs-mod-fullstack-authorizer:
    image: 'lakhansamani/authorizer:1.4.4'
    container_name: 'nestjs-mod-fullstack-authorizer'
    ports:
      - '8000:8080'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      DATABASE_URL: '${SERVER_AUTHORIZER_DATABASE_URL}'
      DATABASE_TYPE: '${SERVER_AUTHORIZER_DATABASE_TYPE}'
      DATABASE_NAME: '${SERVER_AUTHORIZER_DATABASE_NAME}'
      ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
      PORT: '${SERVER_AUTHORIZER_PORT}'
      AUTHORIZER_URL: '${SERVER_AUTHORIZER_URL}'
      COOKIE_NAME: '${SERVER_AUTHORIZER_COOKIE_NAME}'
      SMTP_HOST: '${SERVER_AUTHORIZER_SMTP_HOST}'
      SMTP_PORT: '${SERVER_AUTHORIZER_SMTP_PORT}'
      SMTP_USERNAME: '${SERVER_AUTHORIZER_SMTP_USERNAME}'
      SMTP_PASSWORD: '${SERVER_AUTHORIZER_SMTP_PASSWORD}'
      SENDER_EMAIL: '${SERVER_AUTHORIZER_SENDER_EMAIL}'
      SENDER_NAME: '${SERVER_AUTHORIZER_SENDER_NAME}'
      DISABLE_PLAYGROUND: '${SERVER_AUTHORIZER_DISABLE_PLAYGROUND}'
      ACCESS_TOKEN_EXPIRY_TIME: '${SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME}'
      DISABLE_STRONG_PASSWORD: '${SERVER_AUTHORIZER_DISABLE_STRONG_PASSWORD}'
      DISABLE_EMAIL_VERIFICATION: '${SERVER_AUTHORIZER_DISABLE_EMAIL_VERIFICATION}'
      ORGANIZATION_NAME: '${SERVER_AUTHORIZER_ORGANIZATION_NAME}'
      IS_SMS_SERVICE_ENABLED: '${SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED}'
      IS_EMAIL_SERVICE_ENABLED: '${SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED}'
      ENV: '${SERVER_AUTHORIZER_ENV}'
      RESET_PASSWORD_URL: '${SERVER_AUTHORIZER_RESET_PASSWORD_URL}'
      ROLES: '${SERVER_AUTHORIZER_ROLES}'
      DEFAULT_ROLES: '${SERVER_AUTHORIZER_DEFAULT_ROLES}'
      JWT_ROLE_CLAIM: '${SERVER_AUTHORIZER_JWT_ROLE_CLAIM}'
      ORGANIZATION_LOGO: '${SERVER_AUTHORIZER_ORGANIZATION_LOGO}'
    tty: true
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-minio:
    image: 'bitnami/minio:2024.11.7'
    container_name: 'nestjs-mod-fullstack-minio'
    volumes:
      - 'nestjs-mod-fullstack-minio-volume:/bitnami/minio/data'
    ports:
      - '9000:9000'
      - '9001:9001'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      MINIO_ROOT_USER: '${SERVER_MINIO_MINIO_ROOT_USER}'
      MINIO_ROOT_PASSWORD: '${SERVER_MINIO_MINIO_ROOT_PASSWORD}'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'mc'
        - 'ready'
        - 'local'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
      SERVER_AUTHORIZER_DATABASE_URL: '${SERVER_AUTHORIZER_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-server:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-server:${SERVER_VERSION}'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:${SERVER_PORT}/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
      SERVER_PORT: '${SERVER_PORT}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
      SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID: '${SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}'
      SERVER_AUTH_ADMIN_EMAIL: '${SERVER_AUTH_ADMIN_EMAIL}'
      SERVER_AUTH_ADMIN_USERNAME: '${SERVER_AUTH_ADMIN_USERNAME}'
      SERVER_AUTH_ADMIN_PASSWORD: '${SERVER_AUTH_ADMIN_PASSWORD}'
      SERVER_AUTHORIZER_URL: '${SERVER_AUTHORIZER_URL}'
      SERVER_AUTHORIZER_REDIRECT_URL: '${SERVER_AUTHORIZER_REDIRECT_URL}'
      SERVER_AUTHORIZER_AUTHORIZER_URL: '${SERVER_AUTHORIZER_AUTHORIZER_URL}'
      SERVER_AUTHORIZER_ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
      SERVER_MINIO_SERVER_HOST: '${SERVER_MINIO_SERVER_HOST}'
      SERVER_MINIO_ACCESS_KEY: '${SERVER_MINIO_ACCESS_KEY}'
      SERVER_MINIO_SECRET_KEY: '${SERVER_MINIO_SECRET_KEY}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx:${CLIENT_VERSION}'
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'curl -so /dev/null http://localhost:${NGINX_PORT} || exit 1']
      interval: 30s
      timeout: 10s
      retries: 10
    environment:
      SERVER_PORT: '${SERVER_PORT}'
      NGINX_PORT: '${NGINX_PORT}'
      CLIENT_AUTHORIZER_URL: '${CLIENT_AUTHORIZER_URL}'
      CLIENT_MINIO_URL: '${CLIENT_MINIO_URL}'
      CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID: '${CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '${NGINX_PORT}:${NGINX_PORT}'
  nestjs-mod-fullstack-e2e-tests:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-e2e-tests'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      IS_DOCKER_COMPOSE: 'true'
      BASE_URL: 'http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
      SERVER_AUTHORIZER_URL: 'http://nestjs-mod-fullstack-authorizer:8080'
      SERVER_URL: 'http://nestjs-mod-fullstack-server:8080'
      SERVER_AUTH_ADMIN_EMAIL: '${SERVER_AUTH_ADMIN_EMAIL}'
      SERVER_AUTH_ADMIN_USERNAME: '${SERVER_AUTH_ADMIN_USERNAME}'
      SERVER_AUTH_ADMIN_PASSWORD: '${SERVER_AUTH_ADMIN_PASSWORD}'
      SERVER_AUTHORIZER_ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-https-portal:
    image: steveltn/https-portal:1
    container_name: 'nestjs-mod-fullstack-https-portal'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '80:80'
      - '443:443'
    links:
      - nestjs-mod-fullstack-nginx
    restart: always
    environment:
      STAGE: '${HTTPS_PORTAL_STAGE}'
      DOMAINS: '${SERVER_DOMAIN} -> http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    volumes:
      - nestjs-mod-fullstack-https-portal-volume:/var/lib/https-portal
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
  nestjs-mod-fullstack-https-portal-volume:
    name: 'nestjs-mod-fullstack-https-portal-volume'
  nestjs-mod-fullstack-minio-volume:
    name: 'nestjs-mod-fullstack-minio-volume'
```

Обновляем файл _.docker/docker-compose-full.env_

```sh
SERVER_PORT=9090
NGINX_PORT=8080
SERVER_ROOT_DATABASE_URL=postgres://postgres:postgres_password@nestjs-mod-fullstack-postgre-sql:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:app_password@nestjs-mod-fullstack-postgre-sql:5432/app?schema=public
SERVER_WEBHOOK_DATABASE_URL=postgres://webhook:webhook_password@nestjs-mod-fullstack-postgre-sql:5432/webhook?schema=public
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_DOMAIN=example.com
HTTPS_PORTAL_STAGE=local # local|stage|production

CLIENT_AUTHORIZER_URL=http://localhost:8000
CLIENT_MINIO_URL=http://localhost:9000
SERVER_AUTHORIZER_REDIRECT_URL=http://localhost:8080
SERVER_AUTH_ADMIN_EMAIL=nestjs-mod-fullstack@site15.ru
SERVER_AUTH_ADMIN_USERNAME=admin
SERVER_AUTH_ADMIN_PASSWORD=SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA
SERVER_URL=http://localhost:9090/api
SERVER_AUTHORIZER_URL=http://localhost:8000
SERVER_AUTHORIZER_ADMIN_SECRET=VfKSfPPljhHBXCEohnitursmgDxfAyiD
SERVER_AUTHORIZER_DATABASE_TYPE=postgres
SERVER_AUTHORIZER_DATABASE_URL=postgres://Yk42KA4sOb:B7Ep2MwlRR6fAx0frXGWVTGP850qAxM6@nestjs-mod-fullstack-postgre-sql:5432/authorizer
SERVER_AUTHORIZER_DATABASE_NAME=authorizer
SERVER_AUTHORIZER_PORT=8080
SERVER_AUTHORIZER_AUTHORIZER_URL=http://nestjs-mod-fullstack-authorizer:8080
SERVER_AUTHORIZER_COOKIE_NAME=authorizer
SERVER_AUTHORIZER_DISABLE_PLAYGROUND=true
SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME=30m
SERVER_AUTHORIZER_DISABLE_STRONG_PASSWORD=true
SERVER_AUTHORIZER_DISABLE_EMAIL_VERIFICATION=true
SERVER_AUTHORIZER_ORGANIZATION_NAME=NestJSModFullstack
SERVER_AUTHORIZER_IS_EMAIL_SERVICE_ENABLED=true
SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED=false
SERVER_AUTHORIZER_RESET_PASSWORD_URL=/reset-password
SERVER_AUTHORIZER_ROLES=user,admin
SERVER_AUTHORIZER_DEFAULT_ROLES=user
SERVER_AUTHORIZER_JWT_ROLE_CLAIM=role

SERVER_MINIO_SERVER_HOST=nestjs-mod-fullstack-minio
SERVER_MINIO_ACCESS_KEY=FWGmrAGaeMKM
SERVER_MINIO_SECRET_KEY=QatVJuLoZRARlJguoZMpoKvZMJHzvuOR
SERVER_MINIO_ROOT_USER=FWGmrAGaeMKM
SERVER_MINIO_ROOT_PASSWORD=QatVJuLoZRARlJguoZMpoKvZMJHzvuOR
SERVER_MINIO_MINIO_ROOT_USER=FWGmrAGaeMKM
SERVER_MINIO_MINIO_ROOT_PASSWORD=QatVJuLoZRARlJguoZMpoKvZMJHzvuOR
```

### 12. Создаем E2E-тест для проверки обновления профиля и загрузки файла на сервер

Создаем файл _apps/client-e2e/src/profile-as-user.spec.ts_

```typescript
import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Work with profile as "User" role', () => {
  test.describe.configure({ mode: 'serial' });

  const user = {
    email: faker.internet.email({
      provider: 'example.fakerjs.dev',
    }),
    password: faker.internet.password({ length: 8 }),
    site: `http://${faker.internet.domainName()}`,
  };
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: join(__dirname, 'video'),
        size: { width: 1920, height: 1080 },
      },
    });
    await page.goto('/', {
      timeout: 7000,
    });
    await page.evaluate((authorizerURL) => localStorage.setItem('authorizerURL', authorizerURL), get('SERVER_AUTHORIZER_URL').required().asString());
  });

  test.afterAll(async () => {
    await setTimeout(1000);
    await page.close();
  });

  test('sign up as user', async () => {
    await page.goto('/sign-up', {
      timeout: 7000,
    });

    await page.locator('auth-sign-up-form').locator('[placeholder=email]').click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(page.locator('auth-sign-up-form').locator('[placeholder=email]')).toHaveValue(user.email.toLowerCase());

    await page.locator('auth-sign-up-form').locator('[placeholder=password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-sign-up-form').locator('[placeholder=password]')).toHaveValue(user.password);

    await page.locator('auth-sign-up-form').locator('[placeholder=confirm_password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-sign-up-form').locator('[placeholder=confirm_password]')).toHaveValue(user.password);

    await expect(page.locator('auth-sign-up-form').locator('button[type=submit]')).toHaveText('Sign-up');

    await page.locator('auth-sign-up-form').locator('button[type=submit]').click();

    await setTimeout(1500);

    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('sign out after sign-up', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last()).toContainText(`Sign-out`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last().click();

    await setTimeout(4000);

    await expect(page.locator('nz-header').locator('[nz-menu-item]').last()).toContainText(`Sign-in`);
  });

  test('sign in as user', async () => {
    await page.goto('/sign-in', {
      timeout: 7000,
    });

    await page.locator('auth-sign-in-form').locator('[placeholder=email]').click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(page.locator('auth-sign-in-form').locator('[placeholder=email]')).toHaveValue(user.email.toLowerCase());

    await page.locator('auth-sign-in-form').locator('[placeholder=password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-sign-in-form').locator('[placeholder=password]')).toHaveValue(user.password);

    await expect(page.locator('auth-sign-in-form').locator('button[type=submit]')).toHaveText('Sign-in');

    await page.locator('auth-sign-in-form').locator('button[type=submit]').click();

    await setTimeout(1500);

    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should change password in profile', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').first()).toContainText(`Profile`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').first().click();

    await setTimeout(4000);
    //
    await page.locator('auth-profile-form').locator('[placeholder=old_password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-profile-form').locator('[placeholder=old_password]')).toHaveValue(user.password);

    await page.locator('auth-profile-form').locator('[placeholder=new_password]').click();
    await page.keyboard.type(user.password + user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-profile-form').locator('[placeholder=new_password]')).toHaveValue(user.password + user.password);

    await page.locator('auth-profile-form').locator('[placeholder=confirm_new_password]').click();
    await page.keyboard.type(user.password + user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-profile-form').locator('[placeholder=confirm_new_password]')).toHaveValue(user.password + user.password);

    const fileChooserPromise = page.waitForEvent('filechooser');
    page.locator('nz-upload').locator('button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(join(__dirname, 'dep.jpg'));
    await setTimeout(1000);

    await expect(page.locator('auth-profile-form').locator('button[type=submit]')).toHaveText('Update');

    await page.locator('auth-profile-form').locator('button[type=submit]').click();

    await setTimeout(1500);
  });

  test('sign out', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last()).toContainText(`Sign-out`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last().click();

    await setTimeout(4000);

    await expect(page.locator('nz-header').locator('[nz-menu-item]').last()).toContainText(`Sign-in`);
  });

  test('sign in as user with new password', async () => {
    await page.goto('/sign-in', {
      timeout: 7000,
    });

    await page.locator('auth-sign-in-form').locator('[placeholder=email]').click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(page.locator('auth-sign-in-form').locator('[placeholder=email]')).toHaveValue(user.email.toLowerCase());

    await page.locator('auth-sign-in-form').locator('[placeholder=password]').click();
    await page.keyboard.type(user.password + user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-sign-in-form').locator('[placeholder=password]')).toHaveValue(user.password + user.password);

    await expect(page.locator('auth-sign-in-form').locator('button[type=submit]')).toHaveText('Sign-in');

    await page.locator('auth-sign-in-form').locator('button[type=submit]').click();

    await setTimeout(1500);

    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });
});
```

### Заключение

В данном посте и проекте конфигурация для файлового сервера `Minio` написана без учета больших нагрузок и без репликаций, все описывается в качестве примера, при деплое в реальный продакшен нужно будет почитать дополнительный материал.

Текущий проект использует одного админа файлового сервера `Minio` для всех пользователей приложения, если вам не потходит такой вариант, то вы можете взять в качестве сервера авторизации `Keycloak`, и настроить его связку с `Minio` для использования общих пользователей.

### Планы

В следующем посте я подключу к проекту `Redis` и настрою кэширование информации о профиле пользователя...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/414980df21e585cb798e1ff756300c4547e68a42..2e4639867c55e350f0c52dee4cb581fc624b5f9d - изменения
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/11729520686/artifacts/2159651164 - видео тестов

#angular #minio #nestjsmod #fullstack
