## [2024-12-29] Конвертация даты по временной зоне пользователя в "NestJS", а также ввод и отображение даты в "Angular"

**Предыдущая статья:** [Интеграция и сохранение выбранного языка пользователя в базу данных в фулстек-приложении на "Angular" и "NestJS"](https://habr.com/ru/articles/866858/)

В этой статье я расскажу о добавлении нового поля `workUntilDate` с типом `timestamp(6)` в таблицу `Webhook` базы данных `Webhook`.

На стороне фронтенда (в `Angular`-приложении) для этого поля будет реализован удобный календарь с возможностью выбора времени.

Пользователи смогут задавать дату и время в своей временной зоне, тогда как бэкенд (`NestJS`-приложение) будет сохранять введённые данные в базе данных в формате `UTC+0`.

Кроме того, интерфейс календаря и другие элементы, отображающие даты, будут адаптированы под язык и временную зону пользователя.

### 1. Установка необходимых библиотек

Для начала установим требуемые пакеты:

_Команды_

```bash
npm install --save @jsverse/transloco-locale @jsverse/transloco-messageformat --prefer-offline --no-audit --progress=false
```

### 2. Создание миграции

Мои миграции написаны таким образом, чтобы их можно было запускать повторно.

Это полезно в тех случаях, когда требуется отменить применение миграции и запустить её заново.

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

### 3. Применение миграции и обновление "Prisma"-схем

Теперь применим созданную миграцию, пересоздадим схемы `Prisma` и запустим `Prisma`-генераторы.

_Команды_

```bash
npm run docker-compose:start-prod:server
npm run db:create-and-fill
npm run prisma:pull
npm run generate
```

После выполнения этих шагов, во всех соответствующих `DTO` появится новое поле `workUntilDate`.

Пример обновления `DTO`-файла _libs/feature/webhook/src/lib/generated/rest/dto/webhook.dto.ts_

```typescript
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

Пример обновления `Prisma`-схемы _libs/feature/webhook/src/prisma/schema.prisma_

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

### 4. Использование "AsyncLocalStorage" для хранения текущей временной зоны пользователя

Ранее мы применяли `AuthTimezoneInterceptor` для преобразования выходных данных с датами в формате `UTC-0` в формат с учетом временной зоны пользователя.

Преобразование входящей даты из временной зоны пользователя в дату в формате `UTC-0`, в котором она хранится в базе данных, осуществляется в `AuthTimezonePipe`.

Однако в этом контексте у нас отсутствует доступ к данным запроса, поэтому невозможно определить пользователя и его временную зону.

Чтобы решить эту проблему, мы обернем каждый входящий запрос в `AsyncLocalStorage`, что позволит получать информацию о временной зоне пользователя.

Обновляем файл _libs/core/auth/src/lib/interceptors/auth-timezone.interceptor.ts_

```typescript
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

### 5. Создание "Pipe" для преобразования входного объекта

Мы реализуем `Pipe`, который будет вычитать временную зону пользователя из всех полей входящего объекта, содержащих строки с датами.

Если временная зона самого бэкенд-сервера отличается от `UTC-0`, то отнимаем разницу.

Обновляем файл _libs/core/auth/src/lib/pipes/auth-timezone.pipe.ts_

```typescript
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

### 6. Регистрация интерцептора и сервиса для хранения асинхронного состояния в модуле авторизации

Теперь добавим созданный интерцептор и сервис для хранения асинхронного состояния в модуль авторизации.

Обновляем файл _libs/core/auth/src/lib/auth.module.ts_

```typescript
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

### 7. Добавление нового типа поля "date-input" для "Formly"

Несмотря на то, что стандартное `HTML`-поле ввода поддерживает ввод и отображение данных с типом `Date`, его внешний вид отличается от компонентов, предоставляемых `ng.ant.design`.

Чтобы сохранить единообразие интерфейса, мы создадим новый контрол `date-input` для `Formly`.

Создаем файл _libs/common-angular/src/lib/formly/date-input.component.ts_

```typescript
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

Календарь теперь корректно отображает кнопки на выбранной локализации, однако содержимое самого поля ввода остаётся неизменным.

Чтобы решить эту проблему, создадим список основных локалей и форматов вывода и настариваем установку формата в качестве вывода даты в `input`.

Создаем файл _libs/common-angular/src/lib/constants/date-input-formats.ts_

```typescript
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

Определим новые типы в переменной, которую впоследствии подключим в конфигурации приложения.

Создаем файл _libs/common-angular/src/lib/formly/formly-fields.ts_

```typescript
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

### 8. Разработка сервиса для смены локали в различных компонентах фронтенд-приложения

Поскольку разные компоненты используют свои уникальные механизмы для смены языка, мы объединим их в единый сервис и метод.

Создаем файл _libs/common-angular/src/lib/services/active-lang.service.ts_

```typescript
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

### 9. Подключение необходимых элементов в конфигурацию приложения для переключения локали в компонентах работающих с датами

Теперь подключим всё необходимое в конфигурацию нашего приложения, чтобы обеспечить корректное переключение локали в компонентах для работы с датами.

Обновляем файл _apps/client/src/app/app.config.ts_

```typescript
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

### 10. Добавление нового поля ввода на фронте в модуле "Webhook"

Новое поле формы может функционировать как в виде стандартного элемента `type=input` с типом `props.type=datetime-local`, так и в виде кастомного поля `type=date-input`.

Обновляем файл _libs/feature/webhook-angular/src/lib/services/webhook-form.service.ts_

```typescript
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

Для конвертации входящих и исходящих данных на стороне клиента потребуется создание мапперов, которые мы опишем в специализированном сервисе.

Учитывая возможное смещение временной зоны браузера пользователя, при преобразовании строки с датой, полученной с сервера, в объект даты браузера, необходимо учитывать смещение временной зоны браузера.

Создаем файл _libs/feature/webhook-angular/src/lib/services/webhook-mapper.service.ts_

```typescript
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

### 11. Подключение пайпа локализации для отображения дат на фронте

Во всех местах, где мы выводим дату, следует добавить обработку через пайп.

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

### 12. Адаптация тестов, связанных с локализацией интерфейса

До сих пор в интерфейсе мы отображали даты в формате, полученном с бэкенда.

Теперь, благодаря реализации локализации в реальном времени, все данные с датами автоматически адаптируются под настройки пользователя.

Соответственно, все наши тесты, проверяющие выводимые данные, содержащие даты, перестали работать корректно.

Количество необходимых изменений велико, но принцип адаптации везде одинаков.

Пример обновления теста _apps/client-e2e/src/ru-example.spec.ts_

```typescript
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

### 13. Генерация дополнительных файлов, обновление словарей и запуск инфраструктуры в режиме разработки

Теперь запустим генерацию дополнительных файлов, обновим словари и активируем инфраструктуру приложений в режиме разработки.

После этого проведем финальную проверку функциональности через E2E-тесты.

_Команды_

```bash
npm run manual:prepare
npm run translates
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Заключение

Хотя моя цель заключалась в минимальном изменении кода, снова получилось довольно объёмное обновление, несмотря на добавление всего одного поля с типом `Date`.

Новые типы полей редко требуют добавления, потому что перед началом проекта обычно проводится тщательный анализ будущих задач и определяются основные типы объектов, для которых разрабатываются соответствующие компоненты ввода и вывода.

На данный момент в проекте представлены примеры работы с различными типами данных: строковые значения, числа, словари, переключатели, файлы и дата-время.

Эти типы вполне достаточны для создания небольшой `CRM`-системы.

Если понадобится дополнительная кастомизация, можно посмотреть реализацию кастомных компонент для `файл` и `дата-время`.

### Планы

Основные аспекты написания типового `REST` кода уже освещены в предыдущих статьях.

Я намеренно не затрагивал вопросы интеграции очередей и работы с микросервисами, так как они заслуживают отдельных циклов статей, не связанных с текущим `REST` бойлерплейтом.

На сегодняшний день продакшен часть проекта жестко связана с созданием `Docker`-образов и развертыванием в `Kubernetes`, это может представлять собой избыточную сложность для многих разработчиков фронтенда и бэкенда.

В следующей статье я постараюсь описать упрощенный подход к `DevOps`, ориентированный на бесплатные или условно-бесплатные облачные решения.

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/4f495dbd6b9b4efd8d8e13a60c5f66b895c483af..ac8ce1e94a24f912f73c5eb1950458ebc77c12d4 - изменения
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/12537857829/artifacts/2369701323 - видео с E2E-тестов фронтенда

### P.S.

С наступающим Новым 2025 годом! Желаю всем здоровья, любви и удачи! 🥳🥳🥳

#angular #timezone #nestjsmod #fullstack
