## [2024-12-08] Реализуем поддержку временных зон в фулстек-приложении на NestJS и Angular: сохранение и применение настроек таймзоны пользователя

**Предыдущая статья:** [Добавление поддержки нескольких языков в NestJS и Angular приложениях](https://habr.com/ru/articles/863590/)

Приветствую всех, кто интересуется веб-разработкой! В этой статье я расскажу о своём опыте внедрения поддержки временных зон в фулстек-приложение на основе `NestJS` и `Angular`. Мы рассмотрим, как сохранить настройки таймзоны пользователя в базе данных и применять их при взаимодействии с сервером.

Проект реализовывался совместно с `GigaChat`: я описывал свои идеи, а он помогал их уточнять, оценивать и декомпозировать. Запросы к нему были многочисленными, так как я только начинаю осваивать работу с нейронными сетями.

### Устанавливаем все необходимые библиотеки

_Команды_

```bash
npm install --save date-fns
```

### Добавляем поддержку Prisma и миграций от Flyway в модуль авторизации

Добавляем в main.ts инфраструктурные модули для Prisma и Flyway

Обновляем файл _apps/server/src/main.ts_

```typescript
import { AUTH_FEATURE, AUTH_FOLDER, AuthModule } from '@nestjs-mod-fullstack/auth';
// ...

bootstrapNestApplication({
  modules: {
    // ...
    core: [
      // ...
      PrismaModule.forRoot({
        contextName: AUTH_FEATURE,
        staticConfiguration: {
          featureName: AUTH_FEATURE,
          schemaFile: join(rootFolder, AUTH_FOLDER, 'src', 'prisma', PRISMA_SCHEMA_FILE),
          prismaModule: isInfrastructureMode() ? import(`@nestjs-mod/prisma`) : import(`@nestjs-mod/prisma`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
        },
      }),
    ],
    infrastructure: [
      // ...
      DockerComposePostgreSQL.forFeatureAsync({
        featureModuleName: AUTH_FEATURE,
        featureConfiguration: {
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
        },
      }),
      Flyway.forRoot({
        staticConfiguration: {
          featureName: AUTH_FEATURE,
          migrationsFolder: join(rootFolder, AUTH_FOLDER, 'src', 'migrations'),
          configFile: join(rootFolder, FLYWAY_JS_CONFIG_FILE),
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
        },
      }),
    ],
  },
});
```

Запускаем генерацию дополнительного кода по инфраструктуре.

_Команды_

```bash
npm run docs:infrastructure
```

Добавляем новую переменную окружения с логином и паролем для новой базы данных.

Обновляем файл _.env_ и _example.env_

```sh
SERVER_AUTH_DATABASE_URL=postgres://auth:auth_password@localhost:5432/auth?schema=public
```

### Создание таблицы для хранения таймзоны пользователя

Для хранения данных о временных зонах пользователей я выбрал модуль авторизации `Auth`. Этот выбор обусловлен особенностями архитектуры текущего проекта. В других случаях, возможно, стоило бы создать отдельное поле в базе данных `Accounts` или даже отдельный модуль `TimezoneModule` для задач, связанных с временными зонами.

Создаем миграцию для создания всех необходимых таблиц в базе данных `Auth`.

_Команды_

```bash
# Create migrations folder
mkdir -p ./libs/core/auth/src/migrations

# Create empty migration
npm run flyway:create:auth --args=Init
```

Наполняем файл миграции sql-скриптами

Обновляем файл _libs/core/auth/src/migrations/V202412071217\_\_Init.sql_

```sql
DO $$
BEGIN
    CREATE TYPE "AuthRole" AS enum(
        'Admin',
        'User'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "AuthUser"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "externalUserId" uuid NOT NULL,
    "userRole" "AuthRole" NOT NULL,
    "timezone" double precision,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_AUTH_USER" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_AUTH_USER" ON "AuthUser"("externalUserId");

CREATE INDEX IF NOT EXISTS "IDX_AUTH_USER__USER_ROLE" ON "AuthUser"("userRole");
```

Применяем миграции и пересоздаем `Prisma`-схемы для всех баз данных.

_Команды_

```bash
npm run docker-compose:start-prod:server
npm run db:create-and-fill
npm run prisma:pull
```

Файл схемы для новой базы данных _libs/core/auth/src/prisma/schema.prisma_

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../../../../../node_modules/@prisma/auth-client"
  engineType = "binary"
}

datasource db {
  provider = "postgresql"
  url      = env("SERVER_AUTH_DATABASE_URL")
}

model AuthUser {
  id             String   @id(map: "PK_AUTH_USER") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  externalUserId String   @unique(map: "UQ_AUTH_USER") @db.Uuid
  userRole       AuthRole
  timezone       Float?
  createdAt      DateTime @default(now()) @db.Timestamp(6)
  updatedAt      DateTime @default(now()) @db.Timestamp(6)

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

### Генерация ДТО для новой базы данных Auth

Подключаем генератор ДТО в `Prisma`-схему и исключаем часть полей из генерации.

Обновляем файл _libs/core/auth/src/prisma/schema.prisma_

```prisma
// ...

generator prismaClassGenerator {
  provider                        = "prisma-generator-nestjs-dto"
  output                          = "../lib/generated/rest/dto"
  updateDtoPrefix                 = "Update"
  entityPrefix                    = ""
  entitySuffix                    = ""
  definiteAssignmentAssertion     = "true"
  flatResourceStructure           = "false"
  exportRelationModifierClasses   = "true"
  fileNamingStyle                 = "kebab"
  createDtoPrefix                 = "Create"
  classValidation                 = "true"
  noDependencies                  = "false"
  outputToNestJsResourceStructure = "false"
  annotateAllDtoProperties        = "true"
  dtoSuffix                       = "Dto"
  reExport                        = "false"
  prettier                        = "true"
}
// ...

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

  @@index([userRole], map: "IDX_AUTH_USER__USER_ROLE")
}
// ...

```

Перезапускаем генераторы для всех баз данных.

_Команды_

```bash
npm run prisma:generate
```

После успешного выполнения команды мы получаем новые файлы в папке `libs/core/auth/src/lib/generated/rest/dto`:

```
auth-user.dto.ts
connect-auth-user.dto.ts
create-auth-user.dto.ts
migrations.dto.ts
update-auth-user.dto.ts
auth-user.entity.ts
connect-migrations.dto.ts
create-migrations.dto.ts
migrations.entity.ts
update-migrations.dto.ts
```

Так как сгенерированные файлы могут иметь ошибки форматирования по `eslint`, то исключаем эти файлы из проверки `eslint`.

Обновляем файлы _.eslintignore_

```
...
libs/core/auth/src/lib/generated/rest/dto
```

### Обновляем опции с которыми импортируется PrismaModule для базы данных Auth

Обновляем файл _apps/server/src/main.ts_

```typescript
// ...

bootstrapNestApplication({
  modules: {
    // ...
    core: [
      // ...
      PrismaModule.forRoot({
        contextName: AUTH_FEATURE,
        staticConfiguration: {
          featureName: AUTH_FEATURE,
          schemaFile: join(rootFolder, AUTH_FOLDER, 'src', 'prisma', PRISMA_SCHEMA_FILE),
          prismaModule: isInfrastructureMode() ? import(`@nestjs-mod/prisma`) : import(`@prisma/auth-client`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
        },
      }),
    ],
    // ...
  },
});
```

### Разработка контроллера для получения и записи информации о таймзоне пользователя

Создадим контроллер, который позволит получать текущие настройки временной зоны пользователя и изменять их при необходимости.

Создаем файл _libs/core/auth/src/lib/controllers/auth.controller.ts_

```typescript
import { StatusResponse } from '@nestjs-mod-fullstack/common';
import { ValidationError } from '@nestjs-mod-fullstack/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { AuthRole, PrismaClient } from '@prisma/auth-client';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { AUTH_FEATURE } from '../auth.constants';
import { CheckAuthRole, CurrentAuthUser } from '../auth.decorators';
import { AuthError } from '../auth.errors';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { AuthEntities } from '../types/auth-entities';
import { AuthProfileDto } from '../types/auth-profile.dto';

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
    private readonly prismaClient: PrismaClient
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: AuthProfileDto })
  async profile(@CurrentAuthUser() authUser: AuthUser): Promise<AuthProfileDto> {
    return { timezone: authUser.timezone };
  }

  @Post('update-profile')
  @ApiOkResponse({ type: StatusResponse })
  async updateProfile(@CurrentAuthUser() authUser: AuthUser, @Body() authProfile: AuthProfileDto, @InjectTranslateFunction() getText: TranslateFunction) {
    await this.prismaClient.authUser.update({
      where: { id: authUser.id },
      data: {
        timezone: authProfile.timezone,
      },
    });
    return { message: getText('ok') };
  }
}
```

### Интерцептор для автоматической коррекции времени в данных

Создадим интерцептор, который будет автоматически конвертировать время в данных в соответствии с выбранной пользователем временной зоной. Это обеспечит корректное отображение дат и времени в интерфейсе.

Создаем файл _libs/core/auth/src/lib/interceptors/auth-timezone.interceptor.ts_

```typescript
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { addHours } from 'date-fns';
import { isObservable, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthRequest } from '../types/auth-request';

type TObject = Record<string, unknown>;

type TReturn = unknown | unknown[] | TObject | TObject[];

@Injectable()
export class AuthTimezoneInterceptor implements NestInterceptor<TReturn, TReturn> {
  private logger = new Logger(AuthTimezoneInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: AuthRequest = getRequestFromExecutionContext(context);
    const timezone = req.authUser?.timezone;

    const result = next.handle();

    if (isObservable(result)) {
      return result.pipe(
        map((data) => {
          return this.convertObject(data, timezone);
        })
      );
    }
    if (result instanceof Promise && typeof result?.then === 'function') {
      return result.then(async (data) => {
        if (isObservable(result)) {
          return result.pipe(map((data) => this.convertObject(data, timezone)));
        } else {
          // need for correct map types with base method of NestInterceptor
          return this.convertObject(data, timezone) as Observable<TReturn>;
        }
      });
    }
    // need for correct map types with base method of NestInterceptor
    return this.convertObject(result, timezone) as Observable<TReturn>;
  }

  convertObject(data: TReturn, timezone: number | null | undefined, depth = 10): TReturn {
    if (depth === 0) {
      return data;
    }
    if (Array.isArray(data)) {
      const newArray: unknown[] = [];
      for (const item of data) {
        newArray.push(this.convertObject(item, timezone, depth - 1));
      }
      return newArray;
    }
    if ((typeof data === 'string' || typeof data === 'number' || typeof data === 'function') && !this.isValidStringDate(data) && !this.isValidDate(data)) {
      return data;
    }
    try {
      if (data && timezone) {
        if (this.isValidStringDate(data) || this.isValidDate(data)) {
          if (this.isValidStringDate(data) && typeof data === 'string') {
            data = new Date(data);
          }
          data = addHours(data as Date, timezone);
        } else {
          const keys = Object.keys(data);
          for (const key of keys) {
            (data as TObject)[key] = this.convertObject((data as TObject)[key], timezone, depth - 1);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(err, err.stack);
      }
    }
    return data;
  }

  private isValidStringDate(data: string | number | unknown) {
    return typeof data === 'string' && data.length === '0000-00-00T00:00:00.000Z'.length && !isNaN(+new Date(data));
  }

  private isValidDate(data: string | number | Date | object | unknown) {
    if (data && typeof data === 'object') {
      return !isNaN(+data);
    }
    return typeof data === 'string' && !isNaN(+new Date(data));
  }
}
```

### Добавляем контроллер и интерцептор в AuthModule

Создаем файл _libs/core/auth/src/lib/auth.module.ts_

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { AuthController } from './controllers/auth.controller';
import { AuthTimezoneInterceptor } from './interceptors/auth-timezone.interceptor';
// ...

export const { AuthModule } = createNestModule({
  moduleName: AUTH_MODULE,
  // ...
  imports: [
    // ...
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
    }),
  ],
  controllers: [
    // ...
    AuthController,
  ],
  providers: [
    // ...
    { provide: APP_INTERCEPTOR, useClass: AuthTimezoneInterceptor },
  ],
  // ...
});
```

### Перезапускаем инфраструктуру с перегенирацией всего дополнительного кода и проверяем что текущие e2e-тесты работают правильно

_Команды_

```bash
npm run pm2-full:dev:stop
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Добавление поля для выбора временной зоны на фронте

На стороне клиента создадим интерфейс, позволяющий пользователю выбирать свою временную зону. Это поле будет синхронизироваться с сервером через созданный контроллер.

### Написание end-to-end тестов для проверки функционала

Для обеспечения надёжности реализуем e2e-тесты как для бэкенда, так и для фронта. Тесты помогут убедиться, что установка и изменение настроек временной зоны работают корректно.

### Компонент для корректного отображения дат с учётом временной зоны

Разрабатываем компонент, который будет отвечать за правильное отображение дат с учётом выбранной временной зоны. Это поможет избежать путаницы и недоразумений при работе с датами и временем.
