## [2024-12-03] Добавление поддержки нескольких языков в NestJS и Angular приложениях

Предыдущая статья: [Валидация REST-запросов в NestJS-приложении и отображение ошибок в формах Angular-приложения](https://habr.com/ru/articles/863396/)

В этой статье я добавлю поддержку нескольких языков в `NestJS` и `Angular` приложениях, для сообщений в ошибках, уведомлениях и данных полученных из базы данных.

### 1. Устанавливаем все необходимые библиотеки

_Команды_

```bash
npm install --save @jsverse/transloco nestjs-translates class-validator-multi-lang class-transformer-global-storage @jsverse/transloco-keys-manager
```

Так как мы используем внешние генераторы, то мы не имеем доступа к сгенерированному коду, но для возможности перевода ошибок валидации нам нужно использовать библиотеку `class-validator-multi-lang` вместо `class-validator`, которую добавляет генератор.

Для подмены импортов в тайпскрипт файлах установим и подключим веб-пак плагин для замены строк.

_Команды_

```bash
npm install --save string-replace-loader
```

Прописываем правила замены в нашем веб-пак конфиге.

Обновляем файл _apps/server/webpack.config.js_

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
              id: marker('en'),
              label: marker('app.locale.name.english'),
            },
            {
              id: marker('ru'),
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

Для загрузки переводов из интернета необходимо создать специальный загрузчик.

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
        const lang = localStorage.getItem('activeLang') || this.translocoService.getDefaultLang();

        this.translocoService.setActiveLang(lang);
        localStorage.setItem('activeLang', lang);

        return this.translocoService.load(lang);
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

Язык по умолчанию будет стоять `Английский`. Для переключения языка в навигационном меню добавим выпадающий список с доступными для переключения языками.

Обновляем файл _apps/client/src/app/app.component.ts_

```typescript
import { LangDefinition, TranslocoDirective, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { AppRestService, TimeRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
// ...

@UntilDestroy()
@Component({
  standalone: true,
  imports: [RouterModule, NzMenuModule, NzLayoutModule, NzTypographyModule, AsyncPipe, NgForOf, NgFor, TranslocoPipe, TranslocoDirective],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = marker('client');
  serverMessage$ = new BehaviorSubject('');
  serverTime$ = new BehaviorSubject('');
  authUser$?: Observable<User | undefined>;
  lang$ = new BehaviorSubject<string>('');
  availableLangs$ = new BehaviorSubject<LangDefinition[]>([]);

  constructor(
    // ...
    private readonly appRestService: AppRestService,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit() {
    this.loadAvailableLangs();
    this.subscribeToLangChanges();

    this.fillServerMessage().pipe(untilDestroyed(this)).subscribe();
    // ...
  }

  setActiveLang(lang: string) {
    this.translocoService.setActiveLang(lang);
    localStorage.setItem('activeLang', lang);
  }

  private loadAvailableLangs() {
    this.availableLangs$.next(this.translocoService.getAvailableLangs() as LangDefinition[]);
  }

  private subscribeToLangChanges() {
    this.translocoService.langChanges$
      .pipe(
        tap((lang) => this.lang$.next(lang)),
        mergeMap(() => this.fillServerMessage()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  // ...

  private fillServerMessage() {
    return this.appRestService.appControllerGetData().pipe(tap((result) => this.serverMessage$.next(result.message)));
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

Вывод перевода через директиву, пайп и сервис используется не только для перевода, но и как маркер для составления словарей с предложениями для перевода. В проекте есть файлы без директив, пайпов и сервиса в которых содержаться предложения для перевода, такие предложения необходимо оборачивать в функцию `marker`.

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
              id: marker('en'),
              label: marker('app.locale.name.english'),
            },
            {
              id: marker('ru'),
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

Пример файла _libs/core/webhook/src/lib/controllers/webhook.controller.ts_

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

Разметка предложений и слов для перевода бэкенда и фронтенда отличаются, очень давно я сделал для себя утилиту которая собирает словари для таких проектов, ее и буду использовать в этом проекте.

Если утилита ранее не была установлена или версия стояла старая, то необходимо ее переустановить.

_Команды_

```bash
npm install --save-dev rucken@latest
```

Запускаем утилиту

_Команды_

```bash
./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false
```

После запуска этой команды в проекте появятся множество файлов с расширениями: po, pot, json.

**Примеры файлов**

Файл с расширением `XXX.pot` содержит ключи предложений для перевода.

Пример файла _apps/client/src/assets/i18n/template.pot_

```sh
msgid ""
msgstr ""
"Project-Id-Version: i18next-conv\n"
"mime-version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"

msgid "Create new"
msgstr "Create new"

msgid "app.locale.name.english"
msgstr "app.locale.name.english"

msgid "app.locale.name.russian"
msgstr "app.locale.name.russian"

```

Файлы с расширением `<lang>.po` содержат переводы на необходимый язык.

Пример файла _apps/client/src/assets/i18n/en.po_

```sh
msgid ""
msgstr ""
"Project-Id-Version: i18next-conv\n"
"mime-version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"

msgid "Create new"
msgstr "Create new"

msgid "app.locale.name.english"
msgstr "app.locale.name.english"

msgid "app.locale.name.russian"
msgstr "app.locale.name.russian"

```

Пример файла _apps/client/src/assets/i18n/ru.po_

```sh
msgid ""
msgstr ""
"Project-Id-Version: i18next-conv\n"
"mime-version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"

msgid "Create new"
msgstr ""

msgid "app.locale.name.english"
msgstr ""

msgid "app.locale.name.russian"
msgstr ""

```

Файлы с расширением `<lang>.json` содержат переводы на необходимый язык в формате `json`.

Пример файла _apps/client/src/assets/i18n/ru.json_

```json
{
  "Create new": "",
  "app.locale.name.english": "",
  "app.locale.name.russian": ""
}
```

Пример файла _apps/client/src/assets/i18n/en.json_

```json
{
  "Create new": "Create new",
  "app.locale.name.english": "app.locale.name.english",
  "app.locale.name.russian": "app.locale.name.russian"
}
```

### 7. Добавляем переводы для всех словарей

Для массового перевода словарей я обычно использую кроссплатформенную программу [poedit.net](https://poedit.net/).

Я уже писал пост с примером использования этой программы - https://dev.to/endykaufman/add-new-dictionaries-with-translations-to-nestjs-application-using-poeditnet-3ei2.

Сейчас просто приведу пример ручного перевода словарей.

Пример файла _apps/client/src/assets/i18n/ru.po_

```sh
msgid ""
msgstr ""
"Project-Id-Version: i18next-conv\n"
"mime-version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"

msgid "Create new"
msgstr "Создать"

msgid "app.locale.name.english"
msgstr "Английский"

msgid "app.locale.name.russian"
msgstr "Русский"

```

Пример файла _apps/client/src/assets/i18n/en.po_

```sh
msgid ""
msgstr ""
"Project-Id-Version: i18next-conv\n"
"mime-version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"

msgid "app.locale.name.english"
msgstr "English"

msgid "app.locale.name.russian"
msgstr "Russian"

```

Переводы можно добавлять как для `po` файлов, так и для `json`.

После добавления всех необходимых переводов нужно запустить команду, которая объединит все переводы и создаст словари на уровне приложения.

_Команды_

```bash
./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false
```

Алгоритм работы с переводами:

1. Собираем словари для переводов `./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false`;
2. Добавляем переводы во все `*.po` файлы;
3. Генерируем `json` версию переводов `./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false`;
4. Запускаем приложения и они подгружают в себя `json` файлы с переводами.

### 8. Добавляем тест для проверки переведенных ответов с бэкенда

Создаем файл _apps/server-e2e/src/server/ru-validation.spec.ts_

```typescript
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { AxiosError } from 'axios';

describe('Validation (ru)', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper({ activeLang: 'ru' });

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
  });

  it('should catch error on create new webhook as user1', async () => {
    try {
      await user1.getWebhookApi().webhookControllerCreateOne({
        enabled: false,
        endpoint: '',
        eventName: '',
      });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'eventName',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'eventName не может быть пустым',
              },
            ],
          },
          {
            property: 'endpoint',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'endpoint не может быть пустым',
              },
            ],
          },
        ],
      });
    }
  });
});
```

### 9. Добавляем тест для проверки корректного переключения переводов в фронтенд приложении

Создаем файл _apps/client-e2e/src/ru-validation.spec.ts_

```typescript
import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Validation (ru)', () => {
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
    await page.evaluate((minioURL) => localStorage.setItem('minioURL', minioURL), get('SERVER_MINIO_URL').required().asString());
  });

  test.afterAll(async () => {
    await setTimeout(1000);
    await page.close();
  });

  test('should change language to RU', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`EN`);
    await page.locator('nz-header').locator('[nz-submenu]').last().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last()).toContainText(`Russian`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last().click();

    await setTimeout(4000);
    //

    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`RU`);
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

    await expect(page.locator('auth-sign-up-form').locator('button[type=submit]')).toHaveText('Зарегистрироваться');

    await page.locator('auth-sign-up-form').locator('button[type=submit]').click();

    await setTimeout(5000);

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(`Вы вошли в систему как ${user.email.toLowerCase()}`);
  });

  test('should catch error on create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(7000);

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(4000);

    await expect(page.locator('webhook-form').locator('formly-validation-message').first()).toContainText('поле "адрес" не может быть пустым');
    await expect(page.locator('webhook-form').locator('formly-validation-message').last()).toContainText('поле "событие" не может быть пустым');
  });
});
```

### 10. Запускаем инфраструктуру с приложениями в режиме разработки и проверяем работу через E2E-тесты

_Команды_

```bash
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Заключение

В этом посте я добавил поддержку работы с несколькими языками в `NestJS` и `Angular` приложениях, а также их переключение в реальном времени.

Создал словари для всех предложений которые необходимо перевести и добавил переводы на английский и русский языки.

Выбранный язык пользователя сохраняется в `localstorage` и используется в качестве активного при полной перезагрузке страницы, в дальнейших постах он будет сохраняться в базу данных.

### Планы

В следующем посте я добавлю поддержку работы с тайм зонами, а также сохранение выбранной пользователем тайм зоны в базу данных...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/2c14d02af439c0884a4052a3b0197a9ee94c571d..43979334656d63c8d4250b17f81fbd26793b5d78 - изменения

#angular #translates #nestjsmod #fullstack
