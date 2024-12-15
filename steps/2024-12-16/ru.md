## [2024-12-16] Интеграция и сохранение выбранного языка пользователя в базу данных в фулстек-приложении на "Angular" и "NestJS"

Этот пост не претендует на масштабность, но поскольку я последовательно документирую все этапы разработки бойлерплейта в формате статей, решил описать и эту задачу.

Здесь я приведу пример миграции базы данных для добавления нового поля, а также покажу, как реализовать соответствующий функционал на бэкенде и фронтенде для изменения этого значения.

Язык пользователя, как и временная зона, будет храниться в базе данных `Auth`.

### Создание миграции для добавления нового поля

На данном этапе мы выполним миграцию базы данных, добавив новое поле для хранения выбранной информации.

_Команды_

```bash
# Create empty migration
npm run flyway:create:auth --args=AddFieldLangToAuthUser
```

Заполняем файл миграции `SQL`-скриптами, необходимыми для создания требуемых таблиц и индексов.

Обновляем файл _libs/core/auth/src/migrations/V202412141339\_\_AddFieldLangToAuthUser.sql_

```sql
DO $$
BEGIN
    ALTER TABLE "AuthUser"
        ADD "lang" varchar(2);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;
```

### Применение созданных миграций и обновление схем "Prisma"

После завершения создания миграций необходимо применить их, обновить схемы `Prisma` для всех баз данных и перезапустить генераторы `Prisma`.

_Команды_

```bash
npm run db:create-and-fill
npm run prisma:pull
npm run generate
```

Файл схемы для новой базы данных _libs/core/auth/src/prisma/schema.prisma_

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../../../../../node_modules/@prisma/auth-client"
  binaryTargets = ["native", "linux-musl", "debian-openssl-1.1.x", "linux-musl-openssl-3.0.x"]
  engineType    = "binary"
}

generator prismaClassGenerator {
  provider                        = "prisma-generator-nestjs-dto"
  output                          = "../lib/generated/rest/dto"
  flatResourceStructure           = "false"
  dtoSuffix                       = "Dto"
  entityPrefix                    = ""
  prettier                        = "true"
  annotateAllDtoProperties        = "true"
  fileNamingStyle                 = "kebab"
  noDependencies                  = "false"
  updateDtoPrefix                 = "Update"
  exportRelationModifierClasses   = "true"
  entitySuffix                    = ""
  outputToNestJsResourceStructure = "false"
  reExport                        = "false"
  definiteAssignmentAssertion     = "true"
  createDtoPrefix                 = "Create"
  classValidation                 = "true"
}

datasource db {
  provider = "postgres"
  url      = env("SERVER_AUTH_DATABASE_URL")
}

model AuthUser {
  id             String   @id(map: "PK_AUTH_USER") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  externalUserId String   @unique(map: "UQ_AUTH_USER") @db.Uuid
  userRole       AuthRole
  timezone       Float?
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  createdAt      DateTime @default(now()) @db.Timestamp(6)
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  updatedAt      DateTime @default(now()) @db.Timestamp(6)
  lang           String?  @db.VarChar(2)  // <--updates

  @@index([userRole], map: "IDX_AUTH_USER__USER_ROLE")
}

model migrations {
  installed_rank Int      @id(map: "__migrations_pk")
  version        String?  @db.VarChar(50)
  description    String   @db.VarChar(200)
  type           String   @db.VarChar(20)
  script         String   @db.VarChar(1000)
  checksum       Int?
  installed_by   String   @db.VarChar(100)
  installed_on   DateTime @default(now()) @db.Timestamp(6)
  execution_time Int
  success        Boolean

  @@index([success], map: "__migrations_s_idx")
  @@map("__migrations")
}

enum AuthRole {
  Admin
  User
}

```

После успешного перезапуска генераторов во всех `DTO`, связанных с таблицей `AuthUser`, появится новое поле `lang`.

Обновленный файл _libs/core/auth/src/lib/generated/rest/dto/auth-user.entity.ts_

```typescript
import { AuthRole } from '../../../../../../../../node_modules/@prisma/auth-client';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUser {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  externalUserId!: string;
  @ApiProperty({
    enum: AuthRole,
    enumName: 'AuthRole',
  })
  userRole!: AuthRole;
  @ApiProperty({
    type: 'number',
    format: 'float',
    nullable: true,
  })
  timezone!: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  lang!: string | null; // <--updates
}
```

### Изменения в DTO и методы получения и обновления профиля пользователя

Чтобы обновить новое поле `lang`, можно создать отдельный метод либо адаптировать уже имеющиеся методы для получения и обновления профиля. В рамках данного материала мы выберем второй вариант – модификация существующих методов.

Обновляем DTO-файл _libs/core/auth/src/lib/types/auth-profile.dto.ts_

```typescript
import { PickType } from '@nestjs/swagger';
import { CreateAuthUserDto } from '../generated/rest/dto/create-auth-user.dto';

export class AuthProfileDto extends PickType(CreateAuthUserDto, ['timezone', 'lang']) {}
```

Поскольку допустимые языки ограничены определенным набором значений, необходимо проверить корректность входящих данных на сервере.

Существует несколько подходов к реализации такой проверки. В данном случае я выполню проверку внутри метода и выброшу ошибку валидации, аналогично тому, как это делает пайп валидации. Такой подход поможет унифицировать обработку ошибок полей на клиентской стороне.

Теперь обновим контроллер _libs/core/auth/src/lib/controllers/auth.controller.ts_.

```typescript
import { StatusResponse } from '@nestjs-mod-fullstack/common';
import { ValidationError, ValidationErrorEnum } from '@nestjs-mod-fullstack/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { AuthRole, PrismaClient } from '@prisma/auth-client';
import { InjectTranslateFunction, TranslateFunction, TranslatesService, TranslatesStorage } from 'nestjs-translates';
import { AUTH_FEATURE } from '../auth.constants';
import { CheckAuthRole, CurrentAuthUser } from '../auth.decorators';
import { AuthError } from '../auth.errors';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { AuthEntities } from '../types/auth-entities';
import { AuthProfileDto } from '../types/auth-profile.dto';
import { AuthCacheService } from '../services/auth-cache.service';

@ApiExtraModels(AuthError, AuthEntities, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(AuthError, ValidationError) },
})
@ApiTags('Auth')
@CheckAuthRole([AuthRole.User, AuthRole.Admin])
@Controller('/auth')
export class AuthController {
  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly authCacheService: AuthCacheService,
    private readonly translatesStorage: TranslatesStorage
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: AuthProfileDto })
  async profile(@CurrentAuthUser() authUser: AuthUser): Promise<AuthProfileDto> {
    return {
      lang: authUser.lang, // <--updates
      timezone: authUser.timezone,
    };
  }

  @Post('update-profile')
  @ApiOkResponse({ type: StatusResponse })
  async updateProfile(@CurrentAuthUser() authUser: AuthUser, @Body() args: AuthProfileDto, @InjectTranslateFunction() getText: TranslateFunction) {
    if (args.lang && !this.translatesStorage.locales.includes(args.lang)) {
      // <--updates
      throw new ValidationError(undefined, ValidationErrorEnum.COMMON, [
        {
          property: 'lang',
          constraints: {
            isNotEmpty: getText('lang must have one of the values: {{values}}', this.translatesStorage.locales.join(', ')),
          },
        },
      ]);
    }
    await this.prismaClient.authUser.update({
      where: { id: authUser.id },
      data: {
        ...(args.lang === undefined // <--updates
          ? {}
          : {
              lang: args.lang,
            }),
        ...(args.timezone === undefined // <--updates
          ? {}
          : {
              timezone: args.timezone,
            }),
        updatedAt: new Date(),
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(authUser.externalUserId);
    return { message: getText('ok') };
  }
}
```

### Адаптация "AuthGuard" для получения языка пользователя из базы данных

Теперь изменим поведение `AuthGuard`, чтобы значение языка пользователя извлекалось не из фронтенд-запроса, а из настроек, сохраненных в базе данных.

Для этого обновим файл _libs/core/auth/src/lib/auth.guard.ts_.

```typescript
// ...

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    // ...
    private readonly translatesStorage: TranslatesStorage
  ) {}

  // ...

  private async tryGetOrCreateCurrentUserWithExternalUserId(req: AuthRequest, externalUserId: string) {
    if (!req.authUser && externalUserId) {
      const authUser = await this.authCacheService.getCachedUserByExternalUserId(externalUserId);
      req.authUser =
        authUser ||
        (await this.prismaClient.authUser.upsert({
          create: { externalUserId, userRole: 'User' },
          update: {},
          where: { externalUserId },
        }));

      if (req.authUser.lang) {
        req.headers[ACCEPT_LANGUAGE] = req.authUser.lang;
      }
    }

    if (req.headers[ACCEPT_LANGUAGE] && !this.translatesStorage.locales.includes(req.headers[ACCEPT_LANGUAGE])) {
      req.headers[ACCEPT_LANGUAGE] = this.translatesStorage.defaultLocale;
    }
  }
  // ...
}
```

### Обновление "SDK" для взаимодействия с бэкендом

Теперь необходимо пересоздать все `SDK`, обеспечивающие взаимодействие с нашим сервером.

_Команды_

```bash
npm run manual:prepare
```

### Разработка нового теста для бэкенда на смену и использование языка из базы данных

Для проверки корректности работы функционала создадим специальный тестовый сценарий, который подтвердит, что смена языка и его последующее извлечение из базы данных происходят без ошибок.

Создаем файл _apps/server-e2e/src/server/store-lang-in-db.spec.ts_

```typescript
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { AxiosError } from 'axios';

describe('Store lang in db', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
  });

  it('should catch error on try use not exists language code', async () => {
    try {
      await user1.getAuthApi().authControllerUpdateProfile({ lang: 'tt' });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'lang',
            constraints: [
              {
                name: 'isWrongEnumValue',
                description: 'lang must have one of the values: en, ru',
              },
            ],
          },
        ],
      });
    }
  });

  it('should catch error in Russian language on create new webhook as user1', async () => {
    await user1.getAuthApi().authControllerUpdateProfile({ lang: 'ru' });
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

### Выполнение всех серверных "E2E"-тестов

Запустим все тесты уровня `E2E` для сервера, чтобы убедиться, что весь функционал работает корректно и без сбоев.

_Команды_

```bash
npm run nx -- run server-e2e:e2e
```

### Создание сервиса для управления активным языком пользователя во фронтенде

Во фронтенд-приложении создадим сервис, который будет управлять активным языком как для авторизованных, так и для неавторизованных пользователей.

Логика работы с активным языком для неавторизованных пользователей останется прежней: она будет использовать `localStorage`.

Однако, после авторизации активный язык будет сохраняться в профиле пользователя.

Создаем файл _libs/core/auth-angular/src/lib/services/auth-active-lang.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AuthErrorEnumInterface, AuthErrorInterface, AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { catchError, map, of, tap, throwError } from 'rxjs';

const AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY = 'activeLang';

@Injectable({ providedIn: 'root' })
export class AuthActiveLangService {
  constructor(private readonly authRestService: AuthRestService, private readonly translocoService: TranslocoService) {}

  getActiveLang() {
    return this.authRestService.authControllerProfile().pipe(
      map((profile) => {
        return profile.lang || this.translocoService.getDefaultLang();
      }),
      catchError((err) => {
        if ('error' in err && (err.error as AuthErrorInterface).code === AuthErrorEnumInterface._001) {
          return of(localStorage.getItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY) || this.translocoService.getDefaultLang());
        }
        return throwError(() => err);
      })
    );
  }

  setActiveLang(lang: string) {
    return this.authRestService.authControllerUpdateProfile({ lang }).pipe(
      tap(() => {
        this.translocoService.setActiveLang(lang);
      }),
      catchError((err) => {
        if ('error' in err && (err.error as AuthErrorInterface).code === AuthErrorEnumInterface._001) {
          localStorage.setItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY, lang);
          this.translocoService.setActiveLang(lang);
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }
}
```

Теперь заменим все случаи использования `localStorage` для хранения языка на `AuthActiveLangService` по всему коду фронтенда.

### Разработка нового теста для фронтенда на смену и использование языка из базы данных

В рамках теста мы выполним следующие шаги: зарегистрируемся, сменим язык на русский, затем изменим язык в `localStorage` с русского на английский и попробуем создать новый веб-хук с пустыми полями. Ожидаемый результат — получение ошибки валидации на русском языке.

Создаем файл _apps/client-e2e/src/ru-validation-with-store-lang-in-db.spec.ts_.

```typescript
import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Validation with store lang in db (ru)', () => {
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

    await setTimeout(5000);

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should change language to RU', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]').last()).toContainText(`EN`);
    await page.locator('nz-header').locator('[nz-submenu]').last().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last()).toContainText(`Russian`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last().click();

    await setTimeout(4000);
    //

    await expect(page.locator('nz-header').locator('[nz-submenu]').last()).toContainText(`RU`);
  });

  test('change lang to en in localStorage', async () => {
    await page.evaluate(() => localStorage.setItem('activeLang', 'en'));

    const activeLang = await page.evaluate(() => localStorage.getItem('activeLang'));

    expect(activeLang).toEqual('en');
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

### Выполнение всех тестов уровня E2E для сервера и клиента

Запустим все тесты уровня E2E как для сервера, так и для клиента, чтобы удостовериться, что вся функциональность работает корректно и без ошибок.

_Команды_

```bash
npm run pm2-full:dev:test:e2e
```

### Заключение

Несмотря на кажущуюся простоту задачи, её решение потребовало значительного количества времени и написания немалого объема кода.

Однако, даже для таких минимальных изменений крайне важно обеспечить покрытие E2E-тестами, что и было продемонстрировано в этом посте.

### Планы

В предыдущей статье я внедрил функцию автоматической конвертации выходных данных, содержащих поля типа `Date` или строки в формате `ISOString`. Тем не менее, я еще не реализовал автоматическую конвертацию входных данных. В следующем посте я займусь именно этим вопросом.

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/43979334656d63c8d4250b17f81fbd26793b5d78..3019d982ca9605479a8b917f71a8ae268f3582bc - изменения
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/12304209080/artifacts/2314033540 - видео с E2E-тестов фронтенда

#angular #translates #nestjsmod #fullstack
