## [2024-12-03] Adding multi-language support to NestJS and Angular applications

In this article I will add support for multiple languages ​​in `NestJS` and `Angular` applications, for error messages, notifications and data retrieved from the database.

### 1. We install all the necessary libraries

_Commands_

```bash
npm install --save @jsverse/transloco nestjs-translates class-validator-multi-lang class-transformer-global-storage @jsverse/transloco-keys-manager
```

Since we use external generators, we do not have access to the generated code, but to be able to translate validation errors, we need to use the `class-validator-multi-lang` library instead of `class-validator`, which the generator adds.

To replace imports in typescript files, we will install and connect the webpack plugin for replacing strings.

_Commands_

```bash
npm install --save string-replace-loader
```

We register replacement rules in our webpack config.

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

### 2. Adding translation support to an Angular application

Adding a new module to the frontend config.

Updating the file _apps/client/src/app/app.config.ts_

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

To download translations from the Internet, you need to create a special downloader.

Create a file _apps/client/src/app/integrations/transloco-http.loader.ts_

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

Translations will be loaded when the application is launched.

Updating the file _apps/client/src/app/app-initializer.ts_

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

The default language will be `English`. To switch the language in the navigation menu, we will add a drop-down list with the languages ​​available for switching.

Updating the file _apps/client/src/app/app.component.ts_

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

### 3. We update the existing code and templates for the subsequent launch of parsing words and sentences for translating the Angular application

There are a lot of changes in the files, here I will list the main principles of implementing translation support in the `Angular` application files.

**Using the translation directive (transloco=)**

Sample file _libs/core/auth-angular/src/lib/forms/auth-profile-form/auth-profile-form.component.ts_

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

**Using the translation pipe (| transloco)**

Sample file _apps/client/src/app/pages/demo/forms/demo-form/demo-form.component.html_

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

**Using the translation service (translocoService: TranslocoService)**

Sample file _apps/client/src/app/pages/demo/forms/demo-form/demo-form.component.html_

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

**Using a marker**

The output of the translation via a directive, pipe and service is used not only for translation, but also as a marker for compiling dictionaries with sentences for translation. The project contains files without directives, pipes and services that contain sentences for translation, such sentences must be wrapped in the `marker` function.

Sample file _apps/client/src/app/app.config.ts_

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

### 4. Adding translation support to the NestJS application

Adding a new module to `AppModule`.

Updating the file _apps/server/src/app/app.module.ts_

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

In order for validation errors to be sent to the frontend in the language that was specified in the request to the backend, it is necessary to connect the corresponding dictionaries with translations to the `NX` project.

Updating the file _apps/server/project.json_

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

### 5. Updating the existing code for subsequent launch of parsing of words and sentences for translation of the NestJS application

There are a lot of changes in the files, here I will list the main principles of implementing support for translations in the files of the `NestJS` application.

**Using a decorator with a translation function (@InjectTranslateFunction() getText: TranslateFunction)**

Sample file _apps/server/src/app/app.controller.ts_

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

**Using the translation service (translatesService: TranslatesService)**

Sample file _libs/feature/webhook/src/lib/controllers/webhook.controller.ts_

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

**Using a marker (getText)**

The output of the translation via a decorator with a function and a service is used not only for translation, but also as a marker for compiling dictionaries with sentences for translation.

If you want to mark a sentence so that it gets into a dictionary with translations, then you need to wrap the sentence in the `getText` function.

Sample file _libs/core/auth/src/lib/auth.errors.ts_

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

### 6. Automatic generation of dictionaries for translations

The markup of sentences and words for backend and frontend translations differs. A long time ago I made a utility for myself that collects dictionaries for such projects, and I will use it in this project.

If the utility was not previously installed or the version was old, then you need to reinstall it.

_Commands_

```bash
npm install --save-dev rucken@latest
```

Launch the utility

_Commands_

```bash
./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false
```

After running this command, the project will have many files with extensions: po, pot, json.

**Example files**

The file with the extension `XXX.pot` contains the keys of the sentences for translation.

Sample file _apps/client/src/assets/i18n/template.pot_

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

Files with the extension `<lang>.po` contain translations into the required language.

Sample file _apps/client/src/assets/i18n/en.po_

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

Sample file _apps/client/src/assets/i18n/ru.po_

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

Files with the extension `<lang>.json` contain translations into the required language in `json` format.

Sample file _apps/client/src/assets/i18n/ru.json_

```json
{
  "Create new": "",
  "app.locale.name.english": "",
  "app.locale.name.russian": ""
}
```

Sample file _apps/client/src/assets/i18n/en.json_

```json
{
  "Create new": "Create new",
  "app.locale.name.english": "app.locale.name.english",
  "app.locale.name.russian": "app.locale.name.russian"
}
```

### 7. Adding translations for all dictionaries

For bulk translation of dictionaries, I usually use the cross-platform program [poedit.net](https://poedit.net/).

I already wrote a post with an example of using this program - https://dev.to/endykaufman/add-new-dictionaries-with-translations-to-nestjs-application-using-poeditnet-3ei2.

Now I will simply give an example of manual translation of dictionaries.

Sample file _apps/client/src/assets/i18n/ru.po_

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

Sample file _apps/client/src/assets/i18n/en.po_

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

Translations can be added for both `po` files and `json`.

After adding all the necessary translations, you need to run a command that will combine all the translations and create dictionaries at the application level.

_Commands_

```bash
./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false
```

Translation workflow:

1. Collect translation dictionaries `./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false`;
2. Add translations to all `*.po` files;
3. Generate `json` version of translations `./node_modules/.bin/rucken prepare --locales=en,ru --update-package-version=false`;
4. Launch applications and they load `json` files with translations.

### 8. Add a test to check translated responses from the backend

Create a file _apps/server-e2e/src/server/ru-validation.spec.ts_

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

### 9. Add a test to check the correct switching of translations in the frontend application

Create a file _apps/client-e2e/src/ru-validation.spec.ts_

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

    await expect(page.locator('webhook-form').locator('formly-validation-message').first()).toContainText('endpoint не может быть пустым');
    await expect(page.locator('webhook-form').locator('formly-validation-message').last()).toContainText('eventName не может быть пустым');
  });
});
```

### 10. We launch the infrastructure with applications in development mode and check the operation through E2E tests

_Commands_

```bash
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Conclusion

In this post I added support for working with multiple languages ​​in `NestJS` and `Angular` applications, as well as switching them in real time.

I created dictionaries for all sentences that need to be translated and added translations into English and Russian.

The user's selected language is saved in `localstorage` and is used as the active one when the page is fully reloaded, in future posts it will be saved to the database.

### Plans

In the next post I will add support for working with time zones, as well as saving the user-selected time zone to the database...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/a5efa43f571a7b48402275e1ee6a9b1e325d0eb0..2c14d02af439c0884a4052a3b0197a9ee94c571d - current changes

#angular #translates #nestjsmod #fullstack
