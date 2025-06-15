## [2024-12-12] Поддержка временных зон в фулстек-приложении на основе NestJS и Angular: работа с REST и WebSockets

**Предыдущая статья:** [Добавление поддержки нескольких языков в NestJS и Angular приложениях](https://habr.com/ru/articles/863590/)

В этой статье я хотел бы поделиться своим опытом по внедрению поддержки временных зон в фулстек-приложение, построенное на `NestJS` и `Angular`. Мы узнаем, как сохранить настройки таймзоны пользователя в базе данных и правильно использовать их при взаимодействии с сервером через `REST` и веб-сокеты.

### 1. Устанавливаем все необходимые библиотеки

Установим библиотеку `date-fns`, которая необходима для работы с датами и временными зонами.

_Команды_

```bash
npm install --save date-fns
```

### 2. Добавляем поддержку Prisma и миграций от Flyway в модуль авторизации

Подключим модули `Prisma` и `Flyway` в файл `main.ts`, чтобы настроить взаимодействие с новой базой данных `Auth`.

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

Генерируем дополнительный код по инфраструктуре.

_Команды_

```bash
npm run docs:infrastructure
```

Добавляем новую переменную окружения с логином и паролем для подключения к новой базе данных.

Обновляем файлы _.env_ и _example.env_

```sh
SERVER_AUTH_DATABASE_URL=postgres://auth:auth_password@localhost:5432/auth?schema=public
```

### 3. Создание таблицы для хранения временной зоны пользователя

Для хранения данных о временных зонах пользователей я предпочёл использовать модуль авторизации `Auth`, что обусловлено архитектурными особенностями нашего проекта. В иных ситуациях можно было бы рассмотреть создание отдельного поля в базе данных `Accounts` или даже специального модуля `TimezoneModule` для управления задачами, связанными с временными зонами.

Теперь создадим миграцию для формирования всех нужных таблиц в базе данных `Auth`.

_Команды_

```bash
# Create migrations folder
mkdir -p ./libs/core/auth/src/migrations

# Create empty migration
npm run flyway:create:auth --args=Init
```

Заполняем файл миграции SQL-скриптами для создания необходимых таблиц и индексов.

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

Теперь база данных `Auth` будет содержать таблицу `AuthUser`, в которой будет храниться информация о временной зоне каждого пользователя.

Применяем созданные миграции и пересоздаем `Prisma`-схемы для всех баз данных.

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

### 4. Генерация "DTO" для новой базы данных "Auth"

Подключаем генератор `DTO` к `Prisma`-схеме и исключаем некоторые поля из процесса генерации.

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

Поскольку сгенерированные файлы могут содержать ошибки форматирования, которые выявляет `eslint`, мы исключаем эти файлы из проверки `eslint`.

Обновляем файлы _.eslintignore_

```
...
libs/core/auth/src/lib/generated/rest/dto
```

### 5. Обновляем параметры импорта модуля `PrismaModule` для базы данных `Auth`

Изменяем конфигурацию импорта модуля `PrismaModule` для базы данных `Auth`, чтобы учесть новые требования к взаимодействию с базой данных.

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

### 6. Создаем сервис кэширования для пользователей базы данных `Auth`

Создаем сервис для кэширования пользователей базы данных `Auth`, чтобы ускорить доступ к данным из сервисов `AuthGuard` и `AuthTimezoneInterceptor`.

Создаем файл _libs\core\auth\src\lib\services\auth-cache.service.ts_

```typescript
import { CacheManagerService } from '@nestjs-mod/cache-manager';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { AuthUser, PrismaClient } from '@prisma/auth-client';
import { AUTH_FEATURE } from '../auth.constants';
import { AuthEnvironments } from '../auth.environments';

@Injectable()
export class AuthCacheService {
  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly cacheManagerService: CacheManagerService,
    private readonly authEnvironments: AuthEnvironments,
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const authUsers = await this.prismaClient.authUser.findMany({
      where: { externalUserId },
    });
    for (const authUser of authUsers) {
      await this.cacheManagerService.del(this.getUserCacheKey(authUser));
    }
  }

  async getCachedUserByExternalUserId(externalUserId: string) {
    const cached = await this.cacheManagerService.get<AuthUser | null>(
      this.getUserCacheKey({
        externalUserId,
      }),
    );
    if (cached) {
      return cached;
    }
    const user = await this.prismaClient.authUser.findFirst({
      where: {
        externalUserId,
      },
    });
    if (user) {
      await this.cacheManagerService.set(this.getUserCacheKey({ externalUserId }), user, this.authEnvironments.cacheTTL);
      return user;
    }
    return null;
  }

  private getUserCacheKey({ externalUserId }: { externalUserId: string }): string {
    return `authUser.${externalUserId}`;
  }
}
```

### 7. Разработка контроллера для работы с информацией о временной зоне пользователя

Создадим контроллер, который будет отвечать за получение текущих настроек временной зоны пользователя и обновление этих параметров при необходимости.

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
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: AuthProfileDto })
  async profile(@CurrentAuthUser() authUser: AuthUser): Promise<AuthProfileDto> {
    return { timezone: authUser.timezone };
  }

  @Post('update-profile')
  @ApiOkResponse({ type: StatusResponse })
  async updateProfile(@CurrentAuthUser() authUser: AuthUser, @Body() args: AuthProfileDto, @InjectTranslateFunction() getText: TranslateFunction) {
    await this.prismaClient.authUser.update({
      where: { id: authUser.id },
      data: {
        timezone: args.timezone,
        updatedAt: new Date(),
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(authUser.externalUserId);
    return { message: getText('ok') };
  }
}
```

### 8. Создаем сервис для рекурсивного преобразования полей типа "Date" в заданную временную зону

Разработаем сервис, который будет выполнять рекурсивное преобразование полей типа "Date" в указанную временную зону.

Создаем файл _libs/core/auth/src/lib/services/auth-timezone.service.ts_

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { addHours } from 'date-fns';

export type TObject = Record<string, unknown>;

export type TData = unknown | unknown[] | TObject | TObject[];

@Injectable()
export class AuthTimezoneService {
  private logger = new Logger(AuthTimezoneService.name);

  convertObject(data: TData, timezone: number | null | undefined, depth = 10): TData {
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

### 9. Добавляем интерцептор для автоматической коррекции времени в данных

Создадим интерцептор, который будет автоматически конвертировать временные значения в данных в соответствии с выбранной пользователем временной зоной. Это гарантирует корректное отображение дат и времени в пользовательском интерфейсе.

Создаем файл _libs/core/auth/src/lib/interceptors/auth-timezone.interceptor.ts_

```typescript
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { isObservable, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthTimezoneService, TData } from '../services/auth-timezone.service';
import { AuthRequest } from '../types/auth-request';
import { AuthEnvironments } from '../auth.environments';

@Injectable()
export class AuthTimezoneInterceptor implements NestInterceptor<TData, TData> {
  constructor(
    private readonly authTimezoneService: AuthTimezoneService,
    private readonly authCacheService: AuthCacheService,
    private readonly authEnvironments: AuthEnvironments,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const result = next.handle();

    if (!this.authEnvironments.useInterceptors) {
      return result;
    }

    const req: AuthRequest = getRequestFromExecutionContext(context);
    const userId = req.authUser?.externalUserId;

    if (!userId) {
      return result;
    }

    if (isObservable(result)) {
      return result.pipe(
        concatMap(async (data) => {
          const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
          return this.authTimezoneService.convertObject(data, user?.timezone);
        }),
      );
    }
    if (result instanceof Promise && typeof result?.then === 'function') {
      return result.then(async (data) => {
        if (isObservable(result)) {
          return result.pipe(
            concatMap(async (data) => {
              const user = await this.authCacheService.getCachedUserByExternalUserId(userId);
              return this.authTimezoneService.convertObject(data, user?.timezone);
            }),
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
  }
}
```

### 10. Добавляем "AuthGuard" для автоматического создания пользователей в базе данных "Auth"

Интегрируем "AuthGuard", чтобы пользователи могли автоматически регистрироваться в базе данных "Auth" при работе с системой.

Создаем файл _libs/core/auth/src/lib/auth.module.ts_

```typescript
import { AllowEmptyUser } from '@nestjs-mod/authorizer';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRole, PrismaClient } from '@prisma/auth-client';
import { AUTH_FEATURE } from './auth.constants';
import { CheckAuthRole, SkipAuthGuard } from './auth.decorators';
import { AuthError, AuthErrorEnum } from './auth.errors';
import { AuthCacheService } from './services/auth-cache.service';
import { AuthRequest } from './types/auth-request';
import { AuthEnvironments } from './auth.environments';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly reflector: Reflector,
    private readonly authCacheService: AuthCacheService,
    private readonly authEnvironments: AuthEnvironments,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.authEnvironments.useGuards) {
      return true;
    }

    try {
      const { skipAuthGuard, checkAuthRole, allowEmptyUserMetadata } = this.getHandlersReflectMetadata(context);

      if (skipAuthGuard) {
        return true;
      }

      const req: AuthRequest = this.getRequestFromExecutionContext(context);

      if (req.authorizerUser?.id) {
        await this.tryGetOrCreateCurrentUserWithExternalUserId(req, req.authorizerUser.id);
      }

      this.throwErrorIfCurrentUserNotSet(req, allowEmptyUserMetadata);

      this.throwErrorIfCurrentUserNotHaveNeededRoles(checkAuthRole, req);
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
      throw err;
    }
    return true;
  }

  private throwErrorIfCurrentUserNotHaveNeededRoles(checkAuthRole: AuthRole[] | undefined, req: AuthRequest) {
    if (checkAuthRole && req.authUser && !checkAuthRole?.includes(req.authUser.userRole)) {
      throw new AuthError(AuthErrorEnum.FORBIDDEN);
    }
  }

  private throwErrorIfCurrentUserNotSet(req: AuthRequest, allowEmptyUserMetadata?: boolean) {
    if (!req.skippedByAuthorizer && !req.authUser && !allowEmptyUserMetadata) {
      throw new AuthError(AuthErrorEnum.USER_NOT_FOUND);
    }
  }

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
    }
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as AuthRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const allowEmptyUserMetadata = Boolean((typeof context.getHandler === 'function' && this.reflector.get(AllowEmptyUser, context.getHandler())) || (typeof context.getClass === 'function' && this.reflector.get(AllowEmptyUser, context.getClass())) || undefined);

    const skipAuthGuard = (typeof context.getHandler === 'function' && this.reflector.get(SkipAuthGuard, context.getHandler())) || (typeof context.getClass === 'function' && this.reflector.get(SkipAuthGuard, context.getClass())) || undefined;

    const checkAuthRole = (typeof context.getHandler === 'function' && this.reflector.get(CheckAuthRole, context.getHandler())) || (typeof context.getClass === 'function' && this.reflector.get(CheckAuthRole, context.getClass())) || undefined;
    return { allowEmptyUserMetadata, skipAuthGuard, checkAuthRole };
  }
}
```

### 11. Регистрация созданных классов в "AuthModule"

Зарегистрируем все созданные классы в модуле "AuthModule", чтобы они стали доступны для использования в нашем приложении.

Обновляем файл _libs/core/auth/src/lib/auth.module.ts_

```typescript
import { AuthorizerGuard, AuthorizerModule } from '@nestjs-mod/authorizer';
import { createNestModule, getFeatureDotEnvPropertyNameFormatter, NestModuleCategory } from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AUTH_FEATURE, AUTH_MODULE } from './auth.constants';
import { AuthEnvironments } from './auth.environments';
import { AuthExceptionsFilter } from './auth.filter';
import { AuthGuard } from './auth.guard';
import { AuthController } from './controllers/auth.controller';
import { AuthorizerController } from './controllers/authorizer.controller';
import { AuthTimezoneInterceptor } from './interceptors/auth-timezone.interceptor';
import { AuthAuthorizerBootstrapService } from './services/auth-authorizer-bootstrap.service';
import { AuthAuthorizerService } from './services/auth-authorizer.service';
import { AuthTimezoneService } from './services/auth-timezone.service';
import { CacheManagerModule } from '@nestjs-mod/cache-manager';
import { AuthCacheService } from './services/auth-cache.service';

export const { AuthModule } = createNestModule({
  moduleName: AUTH_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: AuthEnvironments,
  imports: [
    AuthorizerModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
    }),
    CacheManagerModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
  ],
  controllers: [AuthorizerController, AuthController],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
    }),
    CacheManagerModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
  ],
  sharedProviders: [AuthTimezoneService, AuthCacheService],
  providers: [{ provide: APP_GUARD, useClass: AuthorizerGuard }, { provide: APP_GUARD, useClass: AuthGuard }, { provide: APP_FILTER, useClass: AuthExceptionsFilter }, { provide: APP_INTERCEPTOR, useClass: AuthTimezoneInterceptor }, AuthAuthorizerService, AuthAuthorizerBootstrapService],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(AUTH_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: AUTH_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
```

### 12. Настраиваем обработку запросов через "WebSocket"-гейтвей

Хотя мы объявили глобальные гард и интерцептор в модуле `AuthModule`, они не будут автоматически применяться к обработке запросов через "WebSocket"-гейтвей. Поэтому для обработки запросов через гейтвей создадим специальный декоратор и применим его к контроллеру `TimeController`.

Создаем файл _libs/core/auth/src/lib/auth.decorators.ts_

```typescript
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext, UseGuards, UseInterceptors } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRole } from '@prisma/auth-client';
import { AuthRequest } from './types/auth-request';

import { AllowEmptyUser, AuthorizerGuard } from '@nestjs-mod/authorizer';
import { applyDecorators } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthTimezoneInterceptor } from './interceptors/auth-timezone.interceptor';

export const SkipAuthGuard = Reflector.createDecorator<true>();
export const CheckAuthRole = Reflector.createDecorator<AuthRole[]>();

export const CurrentAuthRequest = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = getRequestFromExecutionContext(ctx) as AuthRequest;
  return req;
});

export const CurrentAuthUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = getRequestFromExecutionContext(ctx) as AuthRequest;
  return req.authUser;
});

function AddHandleConnection() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    constructor.prototype.handleConnection = function (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: any[]
    ) {
      const authorizationHeader = args[0]?.headers.authorization;
      const queryToken = args[0]?.url?.split('token=')?.[1];
      client.headers = {
        authorization: authorizationHeader || queryToken ? `Bearer ${queryToken}` : '',
      };
    };
  };
}

export function UseAuthInterceptorsAndGuards(options?: { allowEmptyUser?: boolean }) {
  return applyDecorators(UseInterceptors(AuthTimezoneInterceptor), UseGuards(AuthorizerGuard, AuthGuard), AddHandleConnection(), ...(options?.allowEmptyUser ? [AllowEmptyUser()] : []));
}
```

Обновляем файл _apps/server/src/app/time.controller.ts_

```typescript
import { UseAuthInterceptorsAndGuards } from '@nestjs-mod-fullstack/auth';
import { Controller, Get } from '@nestjs/common';

import { ApiOkResponse } from '@nestjs/swagger';
import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { interval, map, Observable } from 'rxjs';

export const ChangeTimeStream = 'ChangeTimeStream';

@UseAuthInterceptorsAndGuards({ allowEmptyUser: true })
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/time',
  transports: ['websocket'],
})
@Controller()
export class TimeController {
  @Get('/time')
  @ApiOkResponse({ type: Date })
  time() {
    return new Date();
  }

  @SubscribeMessage(ChangeTimeStream)
  onChangeTimeStream(): Observable<WsResponse<Date>> {
    return interval(1000).pipe(
      map(() => ({
        data: new Date(),
        event: ChangeTimeStream,
      })),
    );
  }
}
```

### 13. Создаем новый "e2e"-тест для проверки корректности преобразования полей типа "Date".

Создадим новый e2e-тест, который проверяет правильность преобразования полей типа "Date" в различные временные зоны.

Обновляем файл _apps/server-e2e/src/server/timezone-time.spec.ts_

```typescript
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { isDateString } from 'class-validator';
import { get } from 'env-var';
import { lastValueFrom, take, toArray } from 'rxjs';

describe('Get server time from rest api and ws (timezone)', () => {
  jest.setTimeout(60000);

  const correctStringDateLength = '0000-00-00T00:00:00.000Z'.length;
  const restClientHelper = new RestClientHelper({
    serverUrl: process.env.IS_DOCKER_COMPOSE ? get('CLIENT_URL').asString() : undefined,
  });

  beforeAll(async () => {
    await restClientHelper.createAndLoginAsUser();
  });

  it('should return time from rest api in two different time zones', async () => {
    const time = await restClientHelper.getTimeApi().timeControllerTime();

    expect(time.status).toBe(200);
    expect(time.data).toHaveLength(correctStringDateLength);
    expect(isDateString(time.data)).toBeTruthy();

    await restClientHelper.getAuthApi().authControllerUpdateProfile({ timezone: -3 });

    const time2 = await restClientHelper.getTimeApi().timeControllerTime();

    expect(time2.status).toBe(200);
    expect(time2.data).toHaveLength(correctStringDateLength);
    expect(isDateString(time2.data)).toBeTruthy();

    expect(+new Date(time.data as unknown as string) - +new Date(time2.data as unknown as string)).toBeGreaterThanOrEqual(3 * 60 * 1000);
  });

  it('should return time from ws in two different time zones', async () => {
    await restClientHelper.getAuthApi().authControllerUpdateProfile({ timezone: null });

    const last3ChangeTimeEvents = await lastValueFrom(
      restClientHelper
        .webSocket<string>({
          path: `/ws/time?token=${restClientHelper.authorizationTokens?.access_token}`,
          eventName: 'ChangeTimeStream',
        })
        .pipe(take(3), toArray()),
    );

    expect(last3ChangeTimeEvents).toHaveLength(3);

    await restClientHelper.getAuthApi().authControllerUpdateProfile({ timezone: -3 });

    const newLast3ChangeTimeEvents = await lastValueFrom(
      restClientHelper
        .webSocket<string>({
          path: `/ws/time?token=${restClientHelper.authorizationTokens?.access_token}`,
          eventName: 'ChangeTimeStream',
        })
        .pipe(take(3), toArray()),
    );

    expect(newLast3ChangeTimeEvents).toHaveLength(3);

    expect(+new Date(last3ChangeTimeEvents[0].data as unknown as string) - +new Date(newLast3ChangeTimeEvents[0].data as unknown as string)).toBeGreaterThanOrEqual(3 * 60 * 1000);
    expect(+new Date(last3ChangeTimeEvents[1].data as unknown as string) - +new Date(newLast3ChangeTimeEvents[1].data as unknown as string)).toBeGreaterThanOrEqual(3 * 60 * 1000);
    expect(+new Date(last3ChangeTimeEvents[2].data as unknown as string) - +new Date(newLast3ChangeTimeEvents[2].data as unknown as string)).toBeGreaterThanOrEqual(3 * 60 * 1000);
  });
});
```

### 14. Перезапускаем инфраструктуру и все приложения, проверяем корректность выполнения e2e-тестов

_Команды_

```bash
npm run pm2-full:dev:stop
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### 15. Передача токена авторизации для веб-сокетов через "query"-строку

Передаем токен авторизации для веб-сокетов через параметр запроса, чтобы обеспечить аутентификацию пользователей при использовании веб-сокетов.

Обновляем файл _apps/client/src/app/app.component.ts_

```typescript
// ...
import { AuthService, TokensService } from '@nestjs-mod-fullstack/auth-angular';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [RouterModule, NzMenuModule, NzLayoutModule, NzTypographyModule, AsyncPipe, NgForOf, NgFor, TranslocoPipe, TranslocoDirective],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  // ...

  constructor(
    // ...
    private readonly tokensService: TokensService,
  ) {}

  // ...

  private fillServerTime() {
    return merge(
      this.timeRestService.timeControllerTime(),
      merge(of(this.tokensService.tokens$.value), this.tokensService.tokens$.asObservable())
        .pipe(
          switchMap((token) =>
            webSocket<string>({
              address: this.timeRestService.configuration.basePath + (token?.access_token ? `/ws/time?token=${token?.access_token}` : '/ws/time'),
              eventName: 'ChangeTimeStream',
            }),
          ),
        )
        .pipe(map((result) => result.data)),
    ).pipe(tap((result) => this.serverTime$.next(result as string)));
  }
}
```

### 16. Замена оригинальных полей формы профиля и изменение метода обновления профиля

Многие изменения на фронтенде были внесены в рамках этого поста, и хотя я не буду описывать каждую деталь, важно отметить, что работа с формами стала проще благодаря использованию механизма инъекции зависимостей (`Dependency Injection`).

Теперь, чтобы добавить новое поле в форму профиля или изменить существующие поля, не нужно редактировать исходники непосредственно в модуле. Вместо этого создается новый класс с необходимой реализацией, который заменяет оригинальный класс через механизм `DI`.

Новое поле `Timezone` будет представлять собой перечислимое значение (`Enum`), которое хранится в соответствующем классе.

Создаем файл _apps/client/src/app/integrations/custom-auth-profile-form.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { LoginInput, UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthProfileFormService } from '@nestjs-mod-fullstack/auth-angular';
import { marker } from '@ngneat/transloco-keys-manager/marker';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class CustomAuthProfileFormService extends AuthProfileFormService {
  private utcTimeZones = [
    {
      label: marker('UTC−12:00: Date Line (west)'),
      value: -12,
    },
    // ...
    {
      label: marker('UTC−09:30: Marquesas Islands'),
      value: -9.5,
    },
    // ...
    {
      label: marker('UTC+14:00: Date Line (east)'),
      value: 14,
    },
  ];

  constructor(protected override readonly translocoService: TranslocoService) {
    super(translocoService);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override getFormlyFields(options?: { data?: LoginInput; errors?: ValidationErrorMetadataInterface[] }): FormlyFieldConfig[] {
    return super.appendServerErrorsAsValidatorsToFields(
      [
        ...super.getFormlyFields(),
        {
          key: 'timezone',
          type: 'select',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`auth.sign-in-form.fields.timezone`),
            placeholder: 'timezone',
            required: false,
            options: this.utcTimeZones.map((z) => ({
              ...z,
              label: this.translocoService.translate(z.label),
            })),
          },
        },
      ],
      options?.errors || [],
    );
  }

  override toModel(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }

  override toJson(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }
}
```

Кроме работы с полями формы, нам также нужно реализовать загрузку и сохранение часового пояса пользователя в форму и из формы. Для этого создадим новую реализацию сервиса, который будет работать с профилем пользователя в базе данных `Auth`.

Создаем файл _apps/client/src/app/integrations/custom-auth.service.ts_

```typescript
import { Inject, Injectable, Optional } from '@angular/core';
import { UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AUTH_CONFIGURATION_TOKEN, AuthConfiguration, AuthorizerService, AuthService, TokensService } from '@nestjs-mod-fullstack/auth-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError, map, mergeMap, of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class CustomAuthService extends AuthService {
  constructor(
    protected readonly authRestService: AuthRestService,
    protected override readonly authorizerService: AuthorizerService,
    protected override readonly tokensService: TokensService,
    @Optional()
    @Inject(AUTH_CONFIGURATION_TOKEN)
    protected override readonly authConfiguration?: AuthConfiguration,
  ) {
    super(authorizerService, tokensService, authConfiguration);
  }

  override setProfile(result: User | undefined) {
    return this.authRestService.authControllerProfile().pipe(
      catchError(() => of(null)),
      mergeMap((profile) => {
        if (result && profile) {
          Object.assign(result, profile);
        }
        return super.setProfile(result);
      }),
    );
  }

  override updateProfile(data: UpdateProfileInput & { timezone: number }) {
    const { timezone, ...profile } = data;
    return super.updateProfile(profile).pipe(
      mergeMap((result) =>
        this.authRestService.authControllerUpdateProfile({ timezone }).pipe(
          map(() => {
            if (result) {
              Object.assign(result, { timezone });
            }
            return result;
          }),
        ),
      ),
    );
  }
}
```

Чтобы новое поле появилось в форме профиля, нужно добавить правила переопределения классов в конфигурацию фронтенд-приложения.

Обновляем файл _apps/client/src/app/integrations/custom-auth.service.ts_

```typescript
import { AUTHORIZER_URL, AuthProfileFormService, AuthService } from '@nestjs-mod-fullstack/auth-angular';
import { CustomAuthProfileFormService } from './integrations/custom-auth-profile-form.service';
import { CustomAuthService } from './integrations/custom-auth.service';
// ...

export const appConfig = ({ authorizerURL, minioURL }: { authorizerURL: string; minioURL: string }): ApplicationConfig => {
  return {
    providers: [
      // ...
      {
        provide: AuthProfileFormService,
        useClass: CustomAuthProfileFormService,
      },
      {
        provide: AuthService,
        useClass: CustomAuthService,
      },
    ],
  };
};
```

### 17. Создание "E2E"-теста для "Angular"-приложения по проверке переключения временной зоны

Для тестирования поведения приложения в контексте смены временной зоны пользователя создадим `End-to-End` тест для `Angular`-приложения, который будет проверять корректность переключения временной зоны в интерфейсе.

Создаем файл _apps/client-e2e/src/timezone-profile-as-user.spec.ts_

```typescript
import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { isDateString } from 'class-validator';
import { differenceInHours } from 'date-fns';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Work with profile as "User" role (timezone', () => {
  test.describe.configure({ mode: 'serial' });

  const correctStringDateLength = '0000-00-00T00:00:00.000Z'.length;

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

    await setTimeout(3000);

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('sign out after sign-up', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
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

    await setTimeout(3000);

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should change timezone in profile', async () => {
    const oldServerTime = await page.locator('#serverTime').innerText();
    expect(oldServerTime).toHaveLength(correctStringDateLength);
    expect(isDateString(oldServerTime)).toBeTruthy();

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').first()).toContainText(`Profile`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').first().click();

    await setTimeout(4000);
    //
    await page.locator('auth-profile-form').locator('[placeholder=timezone]').click();
    await page.keyboard.press('Enter', { delay: 100 });
    await expect(page.locator('auth-profile-form').locator('[placeholder=timezone]')).toContainText('UTC−12:00: Date Line (west)');

    await expect(page.locator('auth-profile-form').locator('button[type=submit]')).toHaveText('Update');

    await page.locator('auth-profile-form').locator('button[type=submit]').click();

    await setTimeout(5000);

    const newServerTime = await page.locator('#serverTime').innerText();
    expect(newServerTime).toHaveLength(correctStringDateLength);
    expect(isDateString(newServerTime)).toBeTruthy();

    expect(differenceInHours(new Date(oldServerTime), new Date(newServerTime))).toBeGreaterThanOrEqual(11);
  });
});
```

Давайте запустим тест и посмотрим, проходит ли он успешно.

_Команды_

```bash
npm run nx -- run client-e2e:e2e timezone
```

Если тест завершился успешно, значит, переключение временной зоны в приложении работает корректно.

### Заключение

В рамках данной статьи была реализована поддержка временных зон пользователей, при этом информация о зоне сохраняется в базе данных.

Основную логику обработки временных зон мы разместили на серверной части приложения. На клиентской стороне свойство временной зоны добавляется посредством механизма внедрения зависимостей (`Dependency Injection`).

Функционал был тщательно протестирован с использованием E2E-тестирования.

### Планы

В следующем посте я расскажу о том, как добавить возможность сохранять выбранный пользователем язык в базу данных. Это важно, поскольку сейчас язык может различаться на разных устройствах одного и того же пользователя.

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/43979334656d63c8d4250b17f81fbd26793b5d78..3019d982ca9605479a8b917f71a8ae268f3582bc - изменения
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/12304209080/artifacts/2314033540 - видео с E2E-тестов фронтенда

#angular #timezone #nestjsmod #fullstack
