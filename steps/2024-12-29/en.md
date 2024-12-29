## [2024-12-29] Converting date by user time zone in "NestJS", and entering and displaying date in "Angular"

In this article, I will talk about adding a new field `workUntilDate` with the type `timestamp(6)` to the `Webhook` table of the `Webhook` database.

On the frontend side (in the `Angular` application), a convenient calendar with the ability to select a time will be implemented for this field.

Users will be able to set the date and time in their time zone, while the backend (`NestJS` application) will save the entered data in the database in the `UTC+0` format.

In addition, the calendar interface and other elements displaying dates will be adapted to the user's language and time zone.

### 1. Installing the required libraries

First, let's install the required packages:

_Commands_

```bash
npm install --save @jsverse/transloco-locale @jsverse/transloco-messageformat --prefer-offline --no-audit --progress=false
```

### 2. Creating a migration

My migrations are written in a way that they can be re-run.

This is useful in cases where you need to undo the migration and re-run it.

_Commands_

```bash
npm run flyway:create:webhook --args=AddFieldWorkUntilDateToAuthUser
```

Updating the file _libs/feature/webhook/src/migrations/V202412200905\_\_AddFieldWorkUntilDateToAuthUser.sql_

```sql
DO $$
BEGIN
    ALTER TABLE "Webhook"
        ADD "workUntilDate" timestamp(6);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;


```

### 3. Applying migration and updating "Prisma" schemas

Now let's apply the created migration, recreate the `Prisma` schemas and run the `Prisma` generators.

_Commands_

```bash
npm run docker-compose:start-prod:server
npm run db:create-and-fill
npm run prisma:pull
npm run generate
```

After completing these steps, all relevant `DTO`s will have a new field `workUntilDate`.

Example of updating `DTO` file _libs/feature/webhook/src/lib/generated/rest/dto/webhook.dto.ts_

```ts
import { Prisma } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
  // ...
  // updates
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  workUntilDate!: Date | null;
}
```

Example of updating a `Prisma` schema _libs/feature/webhook/src/prisma/schema.prisma_

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "binary"
  output   = "../../../../../node_modules/@prisma/webhook-client"
  binaryTargets = ["native","linux-musl","debian-openssl-1.1.x","linux-musl-openssl-3.0.x"]
}

// ...

model Webhook {
  id                                         String       @id(map: "PK_WEBHOOK") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  // ...
  workUntilDate                              DateTime?    @db.Timestamp(6) /// <-- updates
}
```

### 4. Using "AsyncLocalStorage" to store the user's current timezone

Previously, we used `AuthTimezoneInterceptor` to convert the output of dates in `UTC-0` format to a format that respects the user's timezone.

The conversion of the incoming date from the user's timezone to the `UTC-0` date in which it is stored in the database is done in `AuthTimezonePipe`.

However, in this context, we do not have access to the request data, so it is not possible to determine the user and their timezone.

To solve this problem, we wrap each incoming request in `AsyncLocalStorage`, which will allow us to obtain the user's timezone information.

Updating the file _libs/core/auth/src/lib/interceptors/auth-timezone.interceptor.ts_

```ts
// ...
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthAsyncLocalStorageData } from '../types/auth-async-local-storage-data';

@Injectable()
export class AuthTimezoneInterceptor implements NestInterceptor<TData, TData> {
  constructor(
    // ...
    private readonly asyncLocalStorage: AsyncLocalStorage<AuthAsyncLocalStorageData>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: AuthRequest = getRequestFromExecutionContext(context);
    const userId = req.authUser?.externalUserId;

    if (!this.authEnvironments.useInterceptors) {
      return next.handle();
    }

    if (!userId) {
      return next.handle();
    }

    const run = () => {
      const result = next.handle();

      if (isObservable(result)) {
        return result.pipe(
          concatMap(async (data) => {
            const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
            return this.authTimezoneService.convertObject(data, user?.timezone);
          })
        );
      }
      if (result instanceof Promise && typeof result?.then === 'function') {
        return result.then(async (data) => {
          if (isObservable(data)) {
            return data.pipe(
              concatMap(async (data) => {
                const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
                return this.authTimezoneService.convertObject(data, user?.timezone);
              })
            );
          } else {
            const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
            // need for correct map types with base method of NestInterceptor
            return this.authTimezoneService.convertObject(data, user?.timezone) as Observable<TData>;
          }
        });
      }
      // need for correct map types with base method of NestInterceptor
      return this.authTimezoneService.convertObject(result, req.authUser?.timezone) as Observable<TData>;
    };

    if (!this.authEnvironments.usePipes) {
      return run();
    }

    return this.asyncLocalStorage.run({ authTimezone: req.authUser?.timezone || 0 }, () => run());
  }
}
```

### 5. Creating a "Pipe" to transform the input object

We implement a `Pipe` that will subtract the user's time zone from all fields of the input object that contain date strings.

If the time zone of the backend server itself is different from `UTC-0`, then we subtract the difference.

Updating the file _libs/core/auth/src/lib/pipes/auth-timezone.pipe.ts_

```ts
import { SERVER_TIMEZONE_OFFSET } from '@nestjs-mod-fullstack/common';
import { Injectable, PipeTransform } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthEnvironments } from '../auth.environments';
import { AuthTimezoneService } from '../services/auth-timezone.service';
import { AuthAsyncLocalStorageData } from '../types/auth-async-local-storage-data';

@Injectable()
export class AuthTimezonePipe implements PipeTransform {
  constructor(private readonly asyncLocalStorage: AsyncLocalStorage<AuthAsyncLocalStorageData>, private readonly authTimezoneService: AuthTimezoneService, private readonly authEnvironments: AuthEnvironments) {}

  transform(value: unknown) {
    if (!this.authEnvironments.usePipes) {
      return value;
    }
    const result = this.authTimezoneService.convertObject(value, -1 * (this.asyncLocalStorage.getStore()?.authTimezone || 0) - SERVER_TIMEZONE_OFFSET);
    return result;
  }
}
```

### 6. Registering an interceptor and a service for storing asynchronous state in the authorization module

Now let's add the created interceptor and a service for storing asynchronous state to the authorization module.

Updating the file _libs/core/auth/src/lib/auth.module.ts_

```ts
// ...
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
// ...
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthTimezonePipe } from './pipes/auth-timezone.pipe';

export const { AuthModule } = createNestModule({
  // ...
  sharedProviders: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    AuthTimezoneService,
    AuthCacheService,
  ],
  providers: [
    // ...
    { provide: APP_PIPE, useClass: AuthTimezonePipe },
    AuthAuthorizerService,
    AuthAuthorizerBootstrapService,
  ],
  // ...
});
```

### 7. Adding a new field type "date-input" for "Formly"

Although the standard `HTML` input field supports entering and displaying data with the `Date` type, its appearance differs from the components provided by `ng.ant.design`.

To keep the interface consistent, we will create a new `date-input` control for `Formly`.

Create a file _libs/common-angular/src/lib/formly/date-input.component.ts_

```ts
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { map, Observable } from 'rxjs';
import { DATE_INPUT_FORMATS } from '../constants/date-input-formats';
import { ActiveLangService } from '../services/active-lang.service';

@Component({
  selector: 'date-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormlyModule, NzDatePickerModule, AsyncPipe],
  template: ` <nz-date-picker [formControl]="formControl" [formlyAttributes]="field" [nzShowTime]="true" [nzFormat]="(format$ | async)!"></nz-date-picker> `,
})
export class DateInputComponent extends FieldType<FieldTypeConfig> {
  format$: Observable<string>;

  constructor(private readonly translocoService: TranslocoService, private readonly activeLangService: ActiveLangService) {
    super();
    this.format$ = translocoService.langChanges$.pipe(
      map((lang) => {
        const { locale } = this.activeLangService.normalizeLangKey(lang);
        return DATE_INPUT_FORMATS[locale] ? DATE_INPUT_FORMATS[locale] : DATE_INPUT_FORMATS['en-US'];
      })
    );
  }
}
```

The calendar now correctly displays buttons in the selected locale, but the content of the input field itself remains unchanged.

To solve this problem, let's create a list of main locales and output formats and set the format to be set as the date output in `input`.

Create a file _libs/common-angular/src/lib/constants/date-input-formats.ts_

```ts
export const DATE_INPUT_FORMATS = {
  'en-US': 'MM/dd/yyyy HH:mm:ss',
  'en-GB': 'dd/MM/yyyy HH:mm:ss',
  'ar-SA': 'dd/MM/yyyy هه:sس',
  'bg-BG': 'd.M.yyyy H:m:s ч.',
  'ca-ES': 'dd/MM/yyyy H:mm:ss',
  'cs-CZ': 'd.M.yyyy H:mm:ss',
  'da-DK': 'dd-MM-yyyy HH:mm:ss',
  'de-DE': 'dd.MM.yyyy HH:mm:ss',
  'el-GR': 'd/M/yyyy h:mm:ss πμ|μμ',
  'es-MX': 'dd/MM/yyyy H:mm:ss',
  'fi-FI': 'd.M.yyyy klo H.mm.ss',
  'fr-FR': 'dd/MM/yyyy HH:mm:ss',
  'he-IL': 'dd/MM/yyyy HH:mm:ss',
  'hi-IN': 'dd-MM-yyyy hh:mm:ss बजे',
  'hr-HR': 'd.M.yyyy. H:mm:ss',
  'hu-HU': 'yyyy.MM.dd. H:mm:ss',
  'id-ID': 'dd/MM/yyyy HH:mm:ss',
  'is-IS': 'd.M.yyyy kl. HH:mm:ss',
  'it-IT': 'dd/MM/yyyy HH:mm:ss',
  'ja-JP': 'yyyy/MM/dd HH:mm:ss',
  'ko-KR': 'yyyy년 MM월 dd일 HH시 mm분 ss초',
  'lt-LT': 'yyyy.MM.dd. HH:mm:ss',
  'lv-LV': 'yyyy.gada MM.mēnesis dd.diena HH:mm:ss',
  'ms-MY': 'dd/MM/yyyy HH:mm:ss',
  'nl-NL': 'dd-MM-yyyy HH:mm:ss',
  'no-NO': 'dd.MM.yyyy HH:mm:ss',
  'pl-PL': 'dd.MM.yyyy HH:mm:ss',
  'pt-BR': 'dd/MM/yyyy HH:mm:ss',
  'ro-RO': 'dd.MM.yyyy HH:mm:ss',
  'ru-RU': 'dd.MM.yyyy HH:mm:ss',
  'sk-SK': 'd. M. yyyy H:mm:ss',
  'sl-SI': 'd.M.yyyy H:mm:ss',
  'sr-RS': 'dd.MM.yyyy. HH:mm:ss',
  'sv-SE': 'yyyy-MM-dd HH:mm:ss',
  'th-TH': 'วันที่ d เดือน M ปี yyyy เวลา H:mm:ss',
  'tr-TR': 'dd.MM.yyyy HH:mm:ss',
  'uk-UA': 'dd.MM.yyyy HH:mm:ss',
  'vi-VN': 'dd/MM/yyyy HH:mm:ss',
  'zh-CN': 'yyyy年MM月dd日 HH时mm分ss秒',
  'zh-TW': 'yyyy年MM月dd日 HH時mm分ss秒',
};
```

Let's define new types in a variable, which we will later include in the application configuration.

Create a file _libs/common-angular/src/lib/formly/formly-fields.ts_

```ts
import { TypeOption } from '@ngx-formly/core/lib/models';
import { DateInputComponent } from './date-input.component';

export const COMMON_FORMLY_FIELDS: TypeOption[] = [
  {
    name: 'date-input',
    component: DateInputComponent,
    extends: 'input',
  },
];
```

### 8. Developing a service for changing locale in different components of a frontend application

Since different components use their own unique mechanisms for changing the language, we will combine them into a single service and method.

Create a file _libs/common-angular/src/lib/services/active-lang.service.ts_

```ts
import { Inject, Injectable } from '@angular/core';
import { toCamelCase, TranslocoService } from '@jsverse/transloco';
import { LangToLocaleMapping, TRANSLOCO_LOCALE_LANG_MAPPING, TranslocoLocaleService } from '@jsverse/transloco-locale';
import * as dateFnsLocales from 'date-fns/locale';
import * as ngZorroLocales from 'ng-zorro-antd/i18n';
import { NzI18nService } from 'ng-zorro-antd/i18n';

@Injectable({ providedIn: 'root' })
export class ActiveLangService {
  constructor(
    private readonly translocoService: TranslocoService,
    private readonly translocoLocaleService: TranslocoLocaleService,
    private readonly nzI18nService: NzI18nService,
    @Inject(TRANSLOCO_LOCALE_LANG_MAPPING)
    readonly langToLocaleMapping: LangToLocaleMapping
  ) {}

  applyActiveLang(lang: string) {
    const { locale, localeInSnakeCase, localeInCamelCase } = this.normalizeLangKey(lang);

    this.translocoService.setActiveLang(lang);
    this.translocoLocaleService.setLocale(locale);

    if (ngZorroLocales[localeInSnakeCase]) {
      this.nzI18nService.setLocale(ngZorroLocales[localeInSnakeCase]);
    }

    if (dateFnsLocales[lang]) {
      this.nzI18nService.setDateLocale(dateFnsLocales[lang]);
    }
    if (dateFnsLocales[localeInCamelCase]) {
      this.nzI18nService.setDateLocale(dateFnsLocales[localeInCamelCase]);
    }
  }

  normalizeLangKey(lang: string) {
    const locale = this.langToLocaleMapping[lang];
    const localeInCamelCase = toCamelCase(locale);
    const localeInSnakeCase = locale.split('-').join('_');
    return { locale, localeInSnakeCase, localeInCamelCase };
  }
}
```

### 9. Connecting the necessary elements to the application configuration for switching the locale in components working with dates

Now we will connect everything necessary to the configuration of our application to ensure correct switching of the locale in components for working with dates.

Updating the file _apps/client/src/app/app.config.ts_

```ts
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

// ...

import { COMMON_FORMLY_FIELDS } from '@nestjs-mod-fullstack/common-angular';
import { FILES_FORMLY_FIELDS } from '@nestjs-mod-fullstack/files-angular';

// ...

export const appConfig = ({ authorizerURL, minioURL }: { authorizerURL: string; minioURL: string }): ApplicationConfig => {
  return {
    providers: [
      // ...
      importProvidersFrom(
        // ...
        FormlyModule.forRoot({
          // <--updates
          types: [...FILES_FORMLY_FIELDS, ...COMMON_FORMLY_FIELDS],
        })
      ),
      // ...
      provideTranslocoLocale({
        // <--updates
        defaultLocale: 'en-US',
        langToLocaleMapping: {
          en: 'en-US',
          ru: 'ru-RU',
        },
      }),
      provideTranslocoMessageformat({
        // <--updates
        locales: ['en-US', 'ru-RU'],
      }),
      // ...
    ],
  };
};
```

### 10. Adding a new input field on the front end in the "Webhook" module

The new form field can function as a standard `type=input` element with the `props.type=datetime-local` type, or as a custom `type=date-input` field.

Updating the file _libs/feature/webhook-angular/src/lib/services/webhook-form.service.ts_

```ts
import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { UpdateWebhookDtoInterface, ValidationErrorMetadataInterface, WebhookEventInterface, WebhookScalarFieldEnumInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { WebhookEventsService } from './webhook-events.service';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookFormService {
  protected events: WebhookEventInterface[] = [];

  constructor(protected readonly webhookEventsService: WebhookEventsService, protected readonly translocoService: TranslocoService, protected readonly validationService: ValidationService) {}

  init() {
    return this.webhookEventsService.findMany().pipe(
      tap((events) => {
        this.events = events;
      })
    );
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: UpdateWebhookDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: WebhookScalarFieldEnumInterface.enabled,
          type: 'checkbox',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`webhook.form.fields.enabled`),
            placeholder: 'enabled',
            required: true,
          },
        },
        {
          key: WebhookScalarFieldEnumInterface.endpoint,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`webhook.form.fields.endpoint`),
            placeholder: 'endpoint',
            required: true,
          },
        },
        {
          key: WebhookScalarFieldEnumInterface.eventName,
          type: 'select',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`webhook.form.fields.event-name`),
            placeholder: 'eventName',
            required: true,
            options: (this.events || []).map((e) => ({
              value: e.eventName,
              label: `${e.eventName} - ${e.description}`,
            })),
          },
        },
        {
          key: WebhookScalarFieldEnumInterface.headers,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`webhook.form.fields.headers`),
            placeholder: 'headers',
          },
        },
        {
          key: WebhookScalarFieldEnumInterface.requestTimeout,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            type: 'number',
            label: this.translocoService.translate(`webhook.form.fields.request-timeout`),
            placeholder: 'requestTimeout',
            required: false,
          },
        },
        {
          key: WebhookScalarFieldEnumInterface.workUntilDate, // <-- updates
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            type: 'datetime-local',
            label: this.translocoService.translate(`webhook.form.fields.work-until-date`),
            placeholder: 'workUntilDate',
            required: false,
          },
        },
      ],
      options?.errors || []
    );
  }
}
```

To convert incoming and outgoing data on the client side, you will need to create mappers, which we will describe in a specialized service.

Considering the possible offset of the user's browser time zone, when converting a string with a date received from the server into a browser date object, it is necessary to take into account the offset of the browser time zone.

Create a file _libs/feature/webhook-angular/src/lib/services/webhook-mapper.service.ts_

```ts
import { Injectable } from '@angular/core';
import { WebhookInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { BROWSER_TIMEZONE_OFFSET, safeParseJson } from '@nestjs-mod-fullstack/common-angular';
import { addHours, format } from 'date-fns';

export interface WebhookModel extends Partial<Omit<WebhookInterface, 'workUntilDate' | 'createdAt' | 'updatedAt' | 'headers'>> {
  headers?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  workUntilDate?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class WebhookMapperService {
  toModel(item?: WebhookInterface): WebhookModel {
    return {
      ...item,
      headers: item?.headers ? JSON.stringify(item.headers) : '',
      requestTimeout: item?.requestTimeout ? +item.requestTimeout : null,
      workUntilDate: item?.workUntilDate ? addHours(new Date(item.workUntilDate), BROWSER_TIMEZONE_OFFSET) : null,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), BROWSER_TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), BROWSER_TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: WebhookModel) {
    return {
      ...model,
      requestTimeout: model.requestTimeout ? model.requestTimeout : '',
      workUntilDate: model.workUntilDate ? format(model.workUntilDate, 'yyyy-MM-dd HH:mm:ss') : null,
    };
  }

  toJson(data: WebhookModel) {
    return {
      enabled: data.enabled === true,
      endpoint: data.endpoint || '',
      eventName: data.eventName || '',
      headers: data.headers ? safeParseJson(data.headers) : null,
      requestTimeout: data.requestTimeout ? +data.requestTimeout : null,
      workUntilDate: data.workUntilDate ? format(new Date(data.workUntilDate), 'yyyy-MM-dd HH:mm:ss') : undefined,
    };
  }
}
```

### 11. Connecting a localization pipe to display dates on the front

In all places where we display the date, we should add processing via a pipe.

Example of adding a pipe _apps/client/src/app/app.component.html_

```html
<nz-layout class="layout">
  <!-- ... -->
  <nz-footer class="flex justify-between">
    <!-- ... -->
    <div id="serverTime">{{ (serverTime$ | async)! | translocoDate : { dateStyle: 'medium', timeStyle: 'medium' } }}</div>
  </nz-footer>
</nz-layout>
```

### 12. Adaptation of tests related to interface localization

Until now, in the interface, we displayed dates in the format received from the backend.

Now, thanks to the implementation of real-time localization, all data with dates is automatically adapted to the user's settings.

Accordingly, all our tests that check the output data containing dates stopped working correctly.

The number of necessary changes is large, but the principle of adaptation is the same everywhere.

Example of updating the test _apps/client-e2e/src/ru-example.spec.ts_

```ts
import { expect, Page, test } from '@playwright/test';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('basic usage (ru)', () => {
  // ...

  // <-- updates
  test('has serverTime format should be equal to "21 дек. 2024 г., 13:56:00" without "13:56:00"', async () => {
    await page.goto('/', {
      timeout: 7000,
    });

    await setTimeout(4000);

    const serverTime = await page.locator('#serverTime').innerText();
    expect(
      serverTime
        .split(' ')
        .filter((p, i) => i !== 4)
        .join(' ')
    ).toEqual(
      new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
        .format(new Date())
        .split(' ')
        .filter((p, i) => i !== 4)
        .join(' ')
    );
  });
});
```

### 13. Generating additional files, updating dictionaries and launching the infrastructure in development mode

Now we will start generating additional files, update dictionaries and activate the application infrastructure in development mode.

After that, we will perform a final functionality check through E2E tests.

_Commands_

```bash
npm run manual:prepare
npm run translates
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Conclusion

Although my goal was to change the code as little as possible, it turned out to be quite a large update again, despite adding only one field with the `Date` type.

New field types rarely need to be added, because before starting a project, a thorough analysis of future tasks is usually carried out and the main types of objects are determined, for which the corresponding input and output components are developed.

At the moment, the project provides examples of working with various data types: string values, numbers, dictionaries, switches, files and date-time.

These types are quite sufficient for creating a small `CRM` system.

If additional customization is needed, you can look at the implementation of custom components for `file` and `date-time`.

### Plans

The main aspects of writing typical `REST` code have already been covered in previous articles.

I intentionally did not touch upon the issues of queue integration and working with microservices, as they deserve separate series of articles not related to the current `REST` boilerplate.

To date, the production part of the project is tightly linked to the creation of `Docker` images and deployment to `Kubernetes`, which can be excessively complex for many frontend and backend developers.

In the next article, I will try to describe a simplified approach to `DevOps`, focused on free or shareware cloud solutions.

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/4f495dbd6b9b4efd8d8e13a60c5f66b895c483af..ac8ce1e94a24f912f73c5eb1950458ebc77c12d4 - current changes
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/12537857829/artifacts/2369701323 - video from E2E frontend tests

### P.S.

Happy New Year 2025! I wish you all health, love and good luck! 🥳🥳🥳

#angular #timezone #nestjsmod #fullstack
