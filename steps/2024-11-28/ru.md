## [2024-11-28] Добавление поддержки нескольких языков в NestJS и Angular приложениях

Предыдущая статья: [Получение серверного времени через WebSockets и отображение его в Angular-приложении](https://nestjs-mod.com/docs/ru-posts/fullstack/2024-11-21)

В этой статье добавим поддержку нескольких языков в `NestJS` и `Angular`приложениях, для сообщений в ошибках и уведомлениях, а также добавим сохранение и смену языка пользователя в базе данных.

### 1. Устанавливаем все необходимые библиотеки

Устанавливаем новый генератор `DTO` из `Prisma`-схемы и удаляем старый, так как в старом нет добавления декораторов валидации с помощью `class-validator`.

_Команды_

```bash
npm install --save @jsverse/transloco nestjs-translates class-validator-multi-lang class-transformer-global-storage @jsverse/transloco-keys-manager
```

Так как мы используем внешние генераторы, то мы не имеем доступа к сгенерированному коду, но для возможности перевода ошибок валидации нам нужно использовать библиотеку `class-validator-multi-lang` вместо `class-validator`, которую добаляет генератор.

Для подмены импортов в тайпскрипт файлах установим и подключим веб-пак плагин для замены строк.

_Команды_

```bash
npm install --save string-replace-loader
```

Прописываем правила замены в нашем веб-пак конфиге.

```javascript
const { composePlugins, withNx } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    sourceMap: true,
    target: 'node',
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`

    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(ts)$/,
        loader: 'string-replace-loader',
        options: {
          search: `class-validator`,
          replace: `class-validator-multi-lang`,
          flags: 'g',
        },
      },
      {
        test: /\.(ts)$/,
        loader: 'string-replace-loader',
        options: {
          search: 'class-transformer',
          replace: 'class-transformer-global-storage',
          flags: 'g',
        },
      },
    ];
    return config;
  }
);
```

### 2. Добавляем поддержку переводов в Angular-приложении

Добавляем новый модуль в конфиг фронтенда.

Обновляем файл _apps/client/src/app/app.config.ts_

```typescript
import { provideTransloco } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { AUTHORIZER_URL } from '@nestjs-mod-fullstack/auth-angular';
import { TranslocoHttpLoader } from './integrations/transloco-http.loader';

export const appConfig = ({ authorizerURL, minioURL }: { authorizerURL: string; minioURL: string }): ApplicationConfig => {
  return {
    providers: [
      // ...
      provideTransloco({
        config: {
          availableLangs: [
            {
              id: 'en',
              label: marker('app.locale.name.english'),
            },
            {
              id: 'ru',
              label: marker('app.locale.name.russian'),
            },
          ],
          defaultLang: 'en',
          fallbackLang: 'en',
          reRenderOnLangChange: true,
          prodMode: true,
          missingHandler: {
            logMissingKey: true,
            useFallbackTranslation: true,
            allowEmpty: true,
          },
        },
        loader: TranslocoHttpLoader,
      }),
    ],
  };
};
```

Для загрузки переводов из интернета необходимо создать загрузчик.

Создаем файл _apps/client/src/app/integrations/transloco-http.loader.ts_

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { catchError, forkJoin, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private readonly httpClient: HttpClient) {}

  getTranslation(lang: string) {
    return forkJoin({
      translation: this.httpClient.get<Translation>(`./assets/i18n/${lang}.json`).pipe(
        catchError(() => {
          return of({});
        })
      ),
      vendor: this.httpClient.get(`./assets/i18n/${lang}.vendor.json`).pipe(
        catchError(() => {
          return of({});
        })
      ),
    }).pipe(
      map(({ translation, vendor }) => {
        const dictionaries = {
          ...translation,
          ...Object.keys(vendor).reduce((all, key) => ({ ...all, ...vendor[key] }), {}),
        };

        for (const key in dictionaries) {
          if (Object.prototype.hasOwnProperty.call(dictionaries, key)) {
            const value = dictionaries[key];
            if (!value && value !== 'empty') {
              delete dictionaries[key];
            }
          }
        }
        return dictionaries;
      })
    );
  }
}
```

Загрузка переводов будет происходить при запуске приложения

Обновляем файл _apps/client/src/app/app-initializer.ts_

```typescript
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AppRestService, AuthorizerRestService, FilesRestService, TimeRestService, WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthService, TokensService } from '@nestjs-mod-fullstack/auth-angular';
import { catchError, map, merge, mergeMap, of, Subscription, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    // ..
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return (
      this.authService.getAuthorizerClientID()
        ? of(null)
        : this.authorizerRestService.authorizerControllerGetAuthorizerClientID().pipe(
            map(({ clientID }) => {
              this.authService.setAuthorizerClientID(clientID);
              return null;
            })
          )
    ).pipe(
      // ..
      mergeMap(() => {
        const defaultLang = this.translocoService.getDefaultLang();
        this.translocoService.setActiveLang(defaultLang);
        return this.translocoService.load(defaultLang);
      })
      // ..
    );
  }

  private subscribeToTokenUpdates() {
    if (this.subscribeToTokenUpdatesSubscription) {
      this.subscribeToTokenUpdatesSubscription.unsubscribe();
      this.subscribeToTokenUpdatesSubscription = undefined;
    }
    this.subscribeToTokenUpdatesSubscription = merge(this.tokensService.tokens$, this.translocoService.langChanges$)
      .pipe(
        tap(() => {
          // ..
        })
      )
      .subscribe();
  }
}
```

Язык по умолчанию будет стоять `Английский`. Для переключения языка в навигационном меню добавим выподающий список с доступных для переключения языков.

Обновление файла _apps/client/src/app/app.component.ts_

```typescript
import { LangDefinition, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
// ...

@Component({
  standalone: true,
  imports: [
    // ...
    TranslocoPipe,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  // ...
  lang$ = new BehaviorSubject<string>('');
  availableLangs$ = new BehaviorSubject<LangDefinition[]>([]);

  constructor(
    // ...
    private readonly translocoService: TranslocoService
  ) {
    // ...
    this.availableLangs$.next(this.translocoService.getAvailableLangs() as LangDefinition[]);
    this.translocoService.langChanges$
      .pipe(
        tap((lang) => this.lang$.next(lang)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  // ...

  setActiveLang(lang: string) {
    this.translocoService.setActiveLang(lang);
  }
}
```

### 3. Обновляем существующий код и шаблоны, для последующего запуска парсинга слов и предложений для перевода Angular-приложения

Изменений в файлах очень много, тут перечислю основные принципы внедрения поддержки переводов в файлах `Angular`-приложения.

**Использование директивы перевода (transloco=)**

Пример файла _libs/core/auth-angular/src/lib/forms/auth-profile-form/auth-profile-form.component.ts_

```typescript
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [
    // ...
    TranslocoDirective,
  ],
  selector: 'auth-profile-form',
  template: `@if (formlyFields$ | async; as formlyFields) {
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
      <formly-form [model]="formlyModel$ | async" [fields]="formlyFields" [form]="form"> </formly-form>
      @if (!hideButtons) {
      <nz-form-control>
        <div class="flex justify-between">
          <div></div>
          <button nz-button nzType="primary" type="submit" [disabled]="!form.valid" transloco="Update"></button>
        </div>
      </nz-form-control>
      }
    </form>
    } `,
})
export class AuthProfileFormComponent implements OnInit {}
```

**Использование пайпа перевода (| transloco)**

Пример файла _apps/client/src/app/pages/demo/forms/demo-form/demo-form.component.html_

```html
@if (formlyFields$ | async; as formlyFields) {
<form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
  <formly-form [model]="formlyModel$ | async" [fields]="formlyFields" [form]="form"> </formly-form>
  @if (!hideButtons) {
  <nz-form-control>
    <button nzBlock nz-button nzType="primary" type="submit" [disabled]="!form.valid">{{ id ? ('Save' | transloco) : ('Create' | transloco) }}</button>
  </nz-form-control>
  }
</form>
}
```

**Использование сервиса перевода (translocoService: TranslocoService)**

Пример файла _apps/client/src/app/pages/demo/forms/demo-form/demo-form.component.html_

```typescript
// ...
import { TranslocoService } from '@jsverse/transloco';

@Component({
  // ...
})
export class AuthSignInFormComponent implements OnInit {
  // ...

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthSignInFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.setFieldsAndModel({ password: '' });
  }

  setFieldsAndModel(data: LoginInput = { password: '' }) {
    this.formlyFields$.next([
      {
        key: 'email',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: this.translocoService.translate(`auth.sign-in-form.fields.email`),
          placeholder: 'email',
          required: true,
        },
      },
      // ...
    ]);
    // ...
  }
  // ...
}
```

**Использование маркера (marker)**

Вывод перевода через директиву, пайп и сервис используется не только для перевода, но и как маркер для составления словарей с предложениями для перевода. В проекте есть файлы без директив, пайпов и сервиса в которых содержаться предложения для перевода, такие предложнения необходимо оборачивать в функцию `marker`.

Пример файла _apps/client/src/app/app.config.ts_

```typescript
// ...
import { marker } from '@jsverse/transloco-keys-manager/marker';
// ...

export const appConfig = ({ authorizerURL, minioURL }: { authorizerURL: string; minioURL: string }): ApplicationConfig => {
  return {
    providers: [
      // ...
      provideTransloco({
        config: {
          availableLangs: [
            {
              id: 'en',
              label: marker('app.locale.name.english'),
            },
            {
              id: 'ru',
              label: marker('app.locale.name.russian'),
            },
          ],
          defaultLang: 'en',
          fallbackLang: 'en',
          reRenderOnLangChange: true,
          prodMode: true,
          missingHandler: {
            logMissingKey: true,
            useFallbackTranslation: true,
            allowEmpty: true,
          },
        },
        loader: TranslocoHttpLoader,
      }),
    ],
  };
};
```

### 4. Добавляем поддержку переводов в NestJS-приложении

Добавляем новый модуль в `AppModule`.

Обновляем файл _apps/server/src/app/app.module.ts_

```typescript
import { TranslatesModule } from 'nestjs-translates';
// ...

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    // ...
    TranslatesModule.forRootDefault({
      localePaths: [join(__dirname, 'assets', 'i18n'), join(__dirname, 'assets', 'i18n', 'getText'), join(__dirname, 'assets', 'i18n', 'class-validator-messages')],
      vendorLocalePaths: [join(__dirname, 'assets', 'i18n')],
      locales: ['en', 'ru'],
      validationPipeOptions: {
        validatorPackage: require('class-validator'),
        transformerPackage: require('class-transformer'),
        transform: true,
        whitelist: true,
        validationError: {
          target: false,
          value: false,
        },
        exceptionFactory: (errors) => new ValidationError(ValidationErrorEnum.COMMON, undefined, errors),
      },
      usePipes: true,
      useInterceptors: true,
    }),
    // ...
  ],
  // ...
});
```

Для того чтобы валидационные ошибки отправлялись на фронтенд в языке которые был указан в запросе к бэкенду, необходимо подключить соответствующие словари с переводами в `NX`-проект.

Обновляем файл _apps/server/project.json_

```json
{
  "name": "server",
  // ...
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      // ...
      "options": {
        // ...
        "assets": [
          "apps/server/src/assets",
          {
            "glob": "**/*.json",
            "input": "./node_modules/class-validator-multi-lang/i18n/",
            "output": "./assets/i18n/class-validator-multi-lang-messages/"
          }
        ],
        "webpackConfig": "apps/server/webpack.config.js"
      }
    }
    // ...
  }
}
```

### 5. Обновляем существующий код, для последующего запуска парсинга слов и предложений для перевода NestJS-приложения

Изменений в файлах очень много, тут перечислю основные принципы внедрения поддержки переводов в файлах `NestJS`-приложения.

**Использование декоратора с функцией перевода (@InjectTranslateFunction() getText: TranslateFunction)**

Пример файла _apps/server/src/app/app.controller.ts_

```typescript
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
// ...
@AllowEmptyUser()
@Controller()
export class AppController {
  @Get('/get-data')
  @ApiOkResponse({ type: AppData })
  getData(@InjectTranslateFunction() getText: TranslateFunction) {
    return this.appService.getData(getText);
  }
}
```

**Использование сервиса перевода (translatesService: TranslatesService)**

Пример файла _libs/feature/webhook/src/lib/controllers/webhook.controller.ts_

```typescript
// ...
import { CurrentLocale, TranslatesService } from 'nestjs-translates';

// ...
@Controller('/webhook')
export class WebhookController {
  constructor(
    // ...
    private readonly translatesService: TranslatesService
  ) {}

  // ...

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    // ...
    @CurrentLocale() locale: string
  ) {
    // ...
    return { message: this.translatesService.translate('ok', locale) };
  }
}
```

**Использование маркера (getText)**

Вывод перевода через декоратор с функцией и сервис используется не только для перевода, но и как маркер для составления словарей с предложениями для перевода.

Если вы хотите пометить предложение так, чтобы оно попало в словарь с переводами, то нужно обернуть предложение в функцию `getText`.

Пример файла _libs/core/auth/src/lib/auth.errors.ts_

```typescript
// ...
import { getText } from 'nestjs-translates';

// ...

export const AUTH_ERROR_ENUM_TITLES: Record<AuthErrorEnum, string> = {
  [AuthErrorEnum.COMMON]: getText('Auth error'),
  // ...
};

// ...
```

### 6. Автоматическое формирование словарей для переводов

### 7. Добавляем переводы для всех словарей

### 8. Добавляем тест для проверки переведенных ответов с бэкенда

### 9. Добавляем тест для проверки корректного переключения переводов в фронтенд приложении

### Заключение

### Планы
