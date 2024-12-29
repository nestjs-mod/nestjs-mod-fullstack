## [2024-12-21]

В этой статье я добавлю новое поле `workUntilDate` с типом `timestamp(6)` в таблицу `Webhook` базы данных `Webhook`.

На стороне фронтенда (в `Angular`-приложении) для этого поля будет добавлено поле с календарём и выбором времени.

Пользователь сможет выбирать дату и время в своей временной зоне, однако бэкенд (`NestJS`-приложение) будет сохранять эти данные в базе данных в формате `UTC+0`.

Календарь, а также другие элементы интерфейса, отображающие даты, будут формироваться в соответствии с языком пользователя и его таймзоной.

### 1. Устанавливаем все необходимые библиотеки

_Команды_

```bash
npm install --save @jsverse/transloco-locale @jsverse/transloco-messageformat --prefer-offline --no-audit --progress=false
```

### Создаем миграцию

_Команды_

```bash
npm run flyway:create:webhook --args=AddFieldWorkUntilDateToAuthUser
```

Обновляем файл _libs/feature/webhook/src/migrations/V202412200905\_\_AddFieldWorkUntilDateToAuthUser.sql_

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

### Применяем миграцию и пересоздаем Prisma-схемы и запускаем Prisma-генераторы

_Команды_

```bash
npm run docker-compose:start-prod:server
npm run db:create-and-fill
npm run prisma:pull
npm run generate
```

Во всех наших ДТО появится поле `workUntilDate`.

Пример обновления ДТО файла _libs/feature/webhook/src/lib/generated/rest/dto/webhook.dto.ts_

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

Пример обновления Prisma-схемы _libs/feature/webhook/src/prisma/schema.prisma_

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

### Оборачиваем в "AsyncLocalStorage" все входящие запросы и храним там текущую таймзону пользователя

Ранее мы использовали `AuthTimezoneInterceptor` для трансформации выходных данных с датами в формате UTC-0 в даты с пользовательским таймзон.

Трансформация из входящей даты в таймзоне пользователя в дату UTC-0, в этой таймзоне дата хранится в базе данных, происходит в `AuthTimezonePipe`, но там у нас нет доступа к контексту запроса и мы не можем определить пользователя и его таймзону.

Для того чтобы у нас появилась возможность получить таймзон пользователя, мы каждый входящий запрос оборачиваем в `AsyncLocalStorage`.

Обновляем файл _libs/core/auth/src/lib/interceptors/auth-timezone.interceptor.ts_

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

### Создаем "Pipe" для трансформации входящего объекта

Отнимаем таймзон пользователя со всех полей во входящем объекте которые содержат поля строки с датами.

Если сам бэкенд сервер имеет таймзон отличную от UTC-0, то отнимаем разницу.

Обновляем файл _libs/core/auth/src/lib/pipes/auth-timezone.pipe.ts_

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

### Добавляем интерцептор и сервис для хранения асинхронного состояния в модуль авторизации

Обновляем файл _libs/core/auth/src/lib/auth.module.ts_

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

### Добавляем новый тип поля "date-input" для "Formly"

Хотя нативное `HTML` - поле и позволяет вводить и отображать данные с типом `Date`, но оно отличается визуально от интерфейса который мы имеем после подключения `ng.ant.design` - компонент, для того чтобы все интерфейсы выглядили одинаково создаем новый `Formly`-контрол: "date-input".

Создаем файл _libs/common-angular/src/lib/formly/date-input.component.ts_

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

Календарь успешно отображает кнопки на выбранной локали, но вывод в самом поле не меняется, для этого создаем список с основными локалями и форматами вывода и настариваем его установку в качестве формата вывода даты в `input`.

Создаем файл _libs/common-angular/src/lib/constants/date-input-formats.ts_

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

Определяем новый типы в переменной которую подключим в конфигурации приложения.

Создаем файл _libs/common-angular/src/lib/formly/formly-fields.ts_

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

### Создаем сервис для смены локали в различных компонентах фронтенд приложения

Так как различные компоненты имеют собственные способы смены языка, то мы все эти способы обединим в один сервис и метод.

Создаем файл _libs/common-angular/src/lib/services/active-lang.service.ts_

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

### Подключаем в конфиге приложения все что необходимо для переключения локали в контроле для работы с датой

Обновляем файл _apps/client/src/app/app.config.ts_

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

### Добавляем новое поле ввода на фронтеде "Webhook" - модуля

Новое поле формы может работать как в виде нативного `type=input` с типом `props.type=datetime-local` так и в виде кастомного `type=date-input`.

Обновляем файл _libs/feature/webhook-angular/src/lib/services/webhook-form.service.ts_

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

Для конвертации входящих и выходящих данных на фронтенде нужно описать мапперы, их описываем в специальном сервисе.

Так как браузер пользователя может иметь смещение по таймзон, то при конвертации серверной строки с датой в обьект даты браузера нам нужно добавлять браузерное смещение по таймзон.

Создаем файл _libs/feature/webhook-angular/src/lib/services/webhook-mapper.service.ts_

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

### Подключаем на фронтенде пайп локализации при выводе дат

Везде где мы выводим дату, нам необходимо добавить обработку через пайп.

Пример добавления пайпа _apps/client/src/app/app.component.html_

```html
<nz-layout class="layout">
  <!-- ... -->
  <nz-footer class="flex justify-between">
    <!-- ... -->
    <div id="serverTime">{{ (serverTime$ | async)! | translocoDate : { dateStyle: 'medium', timeStyle: 'medium' } }}</div>
  </nz-footer>
</nz-layout>
```

### Модифицируем все тесты где происходит локализация интерфейса

Ранее мы в интерфейсе выводили дату в формате который приходит нам с бэкенда, но теперь у нас происходит локализация в реальном времени всех данных с датами, и соответственно все наши тесты в которых мы проверяли выводимые данные содержащие даты - сломались.

Модификаций тестов очень много, но суть примерно одна и таже.

Пример обновления теста _apps/client-e2e/src/ru-example.spec.ts_

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

### Запускаем генерацию дополнительных файлов, перегенерацию словарей и запускаем инфраструктуру с приложениями в режиме разработки и проверяем работу через E2E-тесты

_Команды_

```bash
npm run manual:prepare
npm run translates
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Заключение

Хотел сделать минимальным колличеством изменений, но опять вышло много кода, хотя по идее добавилось всего лишь одно поле с типом `Date`.

Новые типы полей не так часто добавляются, обычно происходит анализ предстоящих работ по проекту и выделяются основные типы обьектов и под них создаются различные компоненты для ввода и вывода информации.

Сейчас в проекте имется примеры с вводом и выводом данных различных типов: строка, число, словарь, переключатель, файл, дата-время.

Этих типов достаточно для разработки небольшой `CRM`-системы, а если нужно будет добавлять некую кастомизацию, можно изучить как она добавлена в этом проекте на примере типов: файл и дата-время.

### Планы

В принципе основные статьи о том как я пишу типовой `REST` код я описал, не стал расписывать каким образом подключаются очереди и работа с микросервисами, это все отдельные темы, их раскрою в других статьях не связанных с текущим `REST` бойлерплейтом.

Сейчас продакшен девопс часть проекта жестко связана с билдом докер образов и деплоем в кубернетес, для большинства разработчиков фронтенда и бэкенда это некий оверехед, в следующем посте я постараюь описать легкий девопс на бесплатное или условно бесплатное облако...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/3019d982ca9605479a8b917f71a8ae268f3582bc..4f495dbd6b9b4efd8d8e13a60c5f66b895c483af - изменения
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/12347665539/artifacts/2324579763 - видео с E2E-тестов фронтенда

### P.S.

С наступающим новым 2025 годом, желаю всем здоровья, любви и удачи! 🥳🥳🥳

#angular #timezone #nestjsmod #fullstack
