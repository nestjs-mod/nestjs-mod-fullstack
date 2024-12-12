## [2024-12-12] Timezone support in a full-stack application based on NestJS and Angular: working with REST and WebSockets

In this article, I would like to share my experience in implementing timezone support in a full stack application built on `NestJS` and `Angular`. We will learn how to save user time zone settings in the database and use them correctly when interacting with the server via `REST` and web sockets.

### 1. Install all necessary libraries

Install the `date-fns` library, which is necessary for working with dates and time zones.

_Commands_

```bash
npm install --save date-fns
```

### 2. Adding support for Prisma and Flyway migrations to the authorization module

Let's include the `Prisma` and `Flyway` modules in the `main.ts` file to set up interaction with the new `Auth` database.

Update the file _apps/server/src/main.ts_

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

We generate additional code for the infrastructure.

_Commands_

```bash
npm run docs:infrastructure
```

Add a new environment variable with login and password to connect to the new database.

Update the _.env_ and _example.env_ files

```sh
SERVER_AUTH_DATABASE_URL=postgres://auth:auth_password@localhost:5432/auth?schema=public
```

### 3. Creating a table to store the user's time zone

I chose to use the `Auth` authorization module to store data about user time zones, due to the architectural features of our project. In other situations, we could consider creating a separate field in the `Accounts` database or even a special `TimezoneModule` module to manage time zone-related tasks.

Now let's create a migration to generate all the necessary tables in the `Auth` database.

_Commands_

```bash
# Create migrations folder
mkdir -p ./libs/core/auth/src/migrations

# Create empty migration
npm run flyway:create:auth --args=Init
```

We fill the migration file with SQL scripts to create the necessary tables and indexes.

Update the file _libs/core/auth/src/migrations/V202412071217\_\_Init.sql_

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

Now the `Auth` database will contain the `AuthUser` table, which will store information about the time zone of each user.

Apply the created migrations and recreate the `Prisma` schemas for all databases.

_Commands_

```bash
npm run docker-compose:start-prod:server
npm run db:create-and-fill
npm run prisma:pull
```

Schema file for the new database _libs/core/auth/src/prisma/schema.prisma_

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

### 4.Generating "DTO" for the new "Auth" database

Connecting the `DTO` generator to the `Prisma` schema and excluding some fields from the generation process.

Update the file _libs/core/auth/src/prisma/schema.prisma_

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

We restart generators for all databases.

_Commands_

```bash
npm run prisma:generate
```

After the command has successfully completed, we get new files in the `libs/core/auth/src/lib/generated/rest/dto` folder:

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

Since the generated files may contain formatting errors that `eslint` detects, we exclude these files from `eslint` checking.

Updating _.eslintignore_ files

```
...
libs/core/auth/src/lib/generated/rest/dto
```

### 5. Updating the "PrismaModule" module import parameters for the "Auth" database

Changing the `PrismaModule` module import configuration for the `Auth` database to accommodate new requirements for interacting with the database.

Update the file _apps/server/src/main.ts_

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

### 6. Create a caching service for "Auth" database users

Create a service for caching `Auth` database users to speed up access to data from the `AuthGuard` and `AuthTimezoneInterceptor` services.

Create a file _libs\core\auth\src\lib\services\auth-cache.service.ts_

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

### 7. Developing a controller for working with user time zone information

Let's create a controller that will be responsible for receiving the user's current time zone settings and updating these parameters when necessary.

Create a file _libs/core/auth/src/lib/controllers/auth.controller.ts_

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

### 8. Create a service for recursive conversion of "Date" type fields to a specified time zone

We will develop a service that will perform a recursive conversion of "Date" type fields to a specified time zone.

Create a file _libs/core/auth/src/lib/services/auth-timezone.service.ts_

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

### 10. Adding an interceptor for automatic time correction in data

Let's create an interceptor that will automatically convert time values ​​in data according to the time zone selected by the user. This will ensure that dates and times are displayed correctly in the user interface.

Create a file _libs/core/auth/src/lib/interceptors/auth-timezone.interceptor.ts_

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
  constructor(private readonly authTimezoneService: AuthTimezoneService, private readonly authCacheService: AuthCacheService, private readonly authEnvironments: AuthEnvironments) {}

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

### 11. Adding "AuthGuard" to automatically create users in the "Auth" database

Integrating `AuthGuard` so that users can automatically register in the `Auth` database when working with the system.

Create a file _libs/core/auth/src/lib/auth.module.ts_

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
    private readonly authEnvironments: AuthEnvironments
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

### 12. Registering the created classes in "AuthModule"

Let's register all the created classes in the `AuthModule` module so that they become available for use in our application.

Update the file _libs/core/auth/src/lib/auth.module.ts_

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

### 13. Setting up request processing via the "WebSocket" gateway

Although we declared global guard and interceptor in the `AuthModule` module, they will not be automatically applied to request processing via the "WebSocket" gateway. Therefore, to process requests via the gateway, we will create a special decorator and apply it to the `TimeController` controller.

Create a file _libs/core/auth/src/lib/auth.decorators.ts_

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

Update the file _apps/server/src/app/time.controller.ts_

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
      }))
    );
  }
}
```

### 14. Create a new "e2e" test to check the correctness of the conversion of fields of the "Date" type.

Let's create a new `e2e` test that checks the correctness of the conversion of fields of the `Date` type to different time zones.

Update the file _apps/server-e2e/src/server/timezone-time.spec.ts_

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

### 15. We restart the infrastructure and all applications, check the correctness of the execution of e2e tests

_Commands_

```bash
npm run pm2-full:dev:stop
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### 16. Passing an authorization token for websockets via a "query" line

We pass the authorization token for websockets through the request parameter to provide user authentication when using websockets.

Update the file _apps/client/src/app/app.component.ts_

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
    private readonly tokensService: TokensService
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
            })
          )
        )
        .pipe(map((result) => result.data))
    ).pipe(tap((result) => this.serverTime$.next(result as string)));
  }
}
```

### 17.Replacing the original profile form fields and changing the profile update method

A lot of the changes on the frontend were made in this post, and while I won't cover every detail, it's important to note that working with forms has been simplified by using the `Dependency Injection` mechanism.

Now, to add a new field to the profile form or change existing fields, you don't need to edit the source directly in the module. Instead, a new class with the necessary implementation is created, which replaces the original class via the `DI` mechanism.

The new `Timezone` field will be an enumeration value (`Enum`), which is stored in the corresponding class.

Create a file _apps/client/src/app/integrations/custom-auth-profile-form.service.ts_

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
      options?.errors || []
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

In addition to working with form fields, we also need to implement loading and saving the user's time zone to and from the form. To do this, we will create a new implementation of the service that will work with the user profile in the `Auth` database.

Create a file _apps/client/src/app/integrations/custom-auth.service.ts_

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
    protected override readonly authConfiguration?: AuthConfiguration
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
      })
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
          })
        )
      )
    );
  }
}
```

To make the new field appear in the profile form, you need to add class override rules to the frontend application configuration.

Update the file _apps/client/src/app/integrations/custom-auth.service.ts_

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

### 18. Creating an E2E test for an Angular application to check time zone switching

To test the application's behavior in the context of changing the user's time zone, we will create an End-to-End test for an Angular application that will check the correctness of time zone switching in the interface.

Create a file _apps/client-e2e/src/timezone-profile-as-user.spec.ts_

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

Let's run the test and see if it passes.

_Commands_

```bash
npm run nx -- run client-e2e:e2e timezone
```

If the test is successful, then the time zone switching in the application works correctly.

### Conclusion

Within the framework of this article, support for user time zones was implemented, and the information about the zone is stored in the database.

We placed the main logic for processing time zones on the server side of the application. On the client side, the time zone property is added using the dependency injection mechanism (`Dependency Injection`).

The functionality was thoroughly tested using E2E testing.

### Plans

In the next post I will talk about how to add the ability to save the user's selected language to the database. This is important, since the language can now differ on different devices of the same user.

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/43979334656d63c8d4250b17f81fbd26793b5d78..3019d982ca9605479a8b917f71a8ae268f3582bc - current changes

#angular #timezone #nestjsmod #fullstack
