## [2024-12-08] Реализуем поддержку временных зон в фулстек-приложении на NestJS и Angular: сохранение и применение настроек таймзоны пользователя

**Предыдущая статья:** [Добавление поддержки нескольких языков в NestJS и Angular приложениях](https://habr.com/ru/articles/863590/)

Приветствую всех, кто интересуется веб-разработкой! В этой статье я расскажу о своём опыте внедрения поддержки временных зон в фулстек-приложение на основе `NestJS` и `Angular`. Мы рассмотрим, как сохранить настройки таймзоны пользователя в базе данных и применять их при взаимодействии с сервером.

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

### Создаем сервис кэширования пользователей базы данных "Auth", для ускоренного доступа из "AuthGuard" и "AuthTimezoneInterceptor"

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
    private readonly authEnvironments: AuthEnvironments
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
      })
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
    private readonly authCacheService: AuthCacheService
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

### Создаем сервис с функцией рекурсивного конвертирования полей с типом "Date" по определенному значению "Timezone"

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

### Добавляем интерцептор для автоматической коррекции времени в данных

Создадим интерцептор, который будет автоматически конвертировать время в данных в соответствии с выбранной пользователем временной зоной. Это обеспечит корректное отображение дат и времени в интерфейсе.

Создаем файл _libs/core/auth/src/lib/interceptors/auth-timezone.interceptor.ts_

```typescript
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { isObservable, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthTimezoneService, TData } from '../services/auth-timezone.service';
import { AuthRequest } from '../types/auth-request';

@Injectable()
export class AuthTimezoneInterceptor implements NestInterceptor<TData, TData> {
  private logger = new Logger(AuthTimezoneInterceptor.name);

  constructor(private readonly authTimezoneService: AuthTimezoneService, private readonly authCacheService: AuthCacheService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: AuthRequest = getRequestFromExecutionContext(context);
    const userId = req.authUser?.externalUserId;
    const result = next.handle();

    if (!userId) {
      return result;
    }

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
        if (isObservable(result)) {
          return result.pipe(
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
  }
}
```

### Добавим "AuthGuard", для того чтобы пользователи автоматически создавались в базе данных "Auth"

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

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly reflector: Reflector,
    private readonly authCacheService: AuthCacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

### Добавляем все созданные классы в AuthModule

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

### Создаем новый e2e-тест для проверки трансформации полей с типом "Date"

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
        .pipe(take(3), toArray())
    );

    expect(last3ChangeTimeEvents).toHaveLength(3);

    await restClientHelper.getAuthApi().authControllerUpdateProfile({ timezone: -3 });

    const newLast3ChangeTimeEvents = await lastValueFrom(
      restClientHelper
        .webSocket<string>({
          path: `/ws/time?token=${restClientHelper.authorizationTokens?.access_token}`,
          eventName: 'ChangeTimeStream',
        })
        .pipe(take(3), toArray())
    );

    expect(newLast3ChangeTimeEvents).toHaveLength(3);

    expect(+new Date(last3ChangeTimeEvents[0].data as unknown as string) - +new Date(newLast3ChangeTimeEvents[0].data as unknown as string)).toBeGreaterThanOrEqual(3 * 60 * 1000);
    expect(+new Date(last3ChangeTimeEvents[1].data as unknown as string) - +new Date(newLast3ChangeTimeEvents[1].data as unknown as string)).toBeGreaterThanOrEqual(3 * 60 * 1000);
    expect(+new Date(last3ChangeTimeEvents[2].data as unknown as string) - +new Date(newLast3ChangeTimeEvents[2].data as unknown as string)).toBeGreaterThanOrEqual(3 * 60 * 1000);
  });
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
