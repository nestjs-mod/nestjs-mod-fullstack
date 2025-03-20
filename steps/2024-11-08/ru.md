## [2024-11-08] Интеграция внешнего сервера авторизации https://authorizer.dev в фулстек приложение на NestJS и Angular

Предыдущая статья: [Создание пользовательского интерфейса для модуля Webhook с помощью Angular](https://habr.com/ru/articles/853582/)

В этой статье я подключу в проект внешний сервер авторизации https://authorizer.dev и напишу дополнительные бэкенд и фронтенд модули для интеграции с ним.

Код будет собран для запуска через `Docker Compose` и `Kubernetes`.

### 1. Создаем Angular-библиотеку по авторизации

Создаем пустую `Angular`-библиотеку для хранения компонент с формами авторизации и регистрации, а также различные сервисы и `Guards`.

_Команды_

```bash
# Create Angular library
./node_modules/.bin/nx g @nx/angular:library --name=auth-angular --buildable --publishable --directory=libs/core/auth-angular --simpleName=true --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/auth-angular

# Change file with test options
rm -rf libs/core/auth-angular/src/test-setup.ts
cp apps/client/src/test-setup.ts libs/core/auth-angular/src/test-setup.ts
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx g @nx/angular:library --name=auth-angular --buildable --publishable --directory=libs/core/auth-angular --simpleName=true --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/auth-angular

 NX  Generating @nx/angular:library

CREATE libs/core/auth-angular/project.json
CREATE libs/core/auth-angular/README.md
CREATE libs/core/auth-angular/ng-package.json
CREATE libs/core/auth-angular/package.json
CREATE libs/core/auth-angular/tsconfig.json
CREATE libs/core/auth-angular/tsconfig.lib.json
CREATE libs/core/auth-angular/tsconfig.lib.prod.json
CREATE libs/core/auth-angular/src/index.ts
CREATE libs/core/auth-angular/jest.config.ts
CREATE libs/core/auth-angular/src/test-setup.ts
CREATE libs/core/auth-angular/tsconfig.spec.json
CREATE libs/core/auth-angular/src/lib/auth-angular/auth-angular.component.css
CREATE libs/core/auth-angular/src/lib/auth-angular/auth-angular.component.html
CREATE libs/core/auth-angular/src/lib/auth-angular/auth-angular.component.spec.ts
CREATE libs/core/auth-angular/src/lib/auth-angular/auth-angular.component.ts
CREATE libs/core/auth-angular/.eslintrc.json
UPDATE tsconfig.base.json

 NX   👀 View Details of auth-angular

Run "nx show project auth-angular" to view details about this project.
```

</spoiler>

### 2. Создаем NestJS-библиотеку по авторизации

Создаем пустую `NestJS`-библиотеку.

_Команды_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library auth --buildable --publishable --directory=libs/core/auth --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library auth --buildable --publishable --directory=libs/core/auth --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/core/auth/tsconfig.json
CREATE libs/core/auth/src/index.ts
CREATE libs/core/auth/tsconfig.lib.json
CREATE libs/core/auth/README.md
CREATE libs/core/auth/package.json
CREATE libs/core/auth/project.json
CREATE libs/core/auth/.eslintrc.json
CREATE libs/core/auth/jest.config.ts
CREATE libs/core/auth/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/core/auth/src/lib/auth.configuration.ts
CREATE libs/core/auth/src/lib/auth.constants.ts
CREATE libs/core/auth/src/lib/auth.environments.ts
CREATE libs/core/auth/src/lib/auth.module.ts
```

</spoiler>

### 3. Устанавливаем дополнительные библиотеки

Устанавливаем `JS`-клиент и `NestJS`-модуль для работы с сервером `authorizer` с фронтенда и бэкенда.
В тестах мы часто используем случайные данные, для быстрой генерации таких данных устанавливаем пакет `@faker-js/faker`.

_Команды_

```bash
npm install --save @nestjs-mod/authorizer @authorizerdev/authorizer-js @faker-js/faker
```

<spoiler title="Вывод консоли">

```bash
$ npm install --save @nestjs-mod/authorizer @authorizerdev/authorizer-js @faker-js/faker

added 3 packages, removed 371 packages, and audited 2787 packages in 18s

344 packages are looking for funding
  run `npm fund` for details

34 vulnerabilities (3 low, 12 moderate, 19 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

</spoiler>

### 4. Подключаем новые модули в бэкенд

_apps/server/src/main.ts_

```typescript

import {
  AuthorizerModule,
  AuthorizerUser,
  CheckAccessOptions,
  defaultAuthorizerCheckAccessValidator,AUTHORIZER_ENV_PREFIX
} from '@nestjs-mod/authorizer';
// ...
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeAuthorizer,
  DockerComposePostgreSQL,
} from '@nestjs-mod/docker-compose';
// ...

import { ExecutionContext } from '@nestjs/common';
// ...
bootstrapNestApplication({
  modules: {
   // ...

    core: [
      AuthorizerModule.forRoot({
        staticConfiguration: {
          extraHeaders: {
            'x-authorizer-url': `http://localhost:${process.env.SERVER_AUTHORIZER_EXTERNAL_CLIENT_PORT}`,
          },
          checkAccessValidator: async (
            authorizerUser?: AuthorizerUser,
            options?: CheckAccessOptions,
            ctx?: ExecutionContext
          ) => {
            if (
              typeof ctx?.getClass === 'function' &&
              typeof ctx?.getHandler === 'function' &&
              ctx?.getClass().name === 'TerminusHealthCheckController' &&
              ctx?.getHandler().name === 'check'
            ) {
              return true;
            }

            return defaultAuthorizerCheckAccessValidator(
              authorizerUser,
              options
            );
          },
        },
      }),
    ],
    infrastructure: [
      DockerComposePostgreSQL.forFeature({
        featureModuleName: AUTHORIZER_ENV_PREFIX,
      }),
      DockerComposeAuthorizer.forRoot({
        staticEnvironments: {
          databaseUrl: '%SERVER_AUTHORIZER_INTERNAL_DATABASE_URL%',
        },
        staticConfiguration: {
          image: 'lakhansamani/authorizer:1.4.4',
          disableStrongPassword: 'true',
          disableEmailVerification: 'true',
          featureName: AUTHORIZER_ENV_PREFIX,
          organizationName: 'NestJSModFullstack',
          dependsOnServiceNames: {
            'postgre-sql': 'service_healthy',
            redis: 'service_healthy',
          },
          isEmailServiceEnabled: 'true',
          isSmsServiceEnabled: 'false',
          env: 'development',
        },
      }),
    ]}
    );
```

### 5. Запускаем генерацию дополнительного кода по инфраструктуре

_Команды_

```bash
npm run docs:infrastructure
```

### 6. Добавляем весь необходимый код в модуль AuthModule (NestJS-библиотека)

При запуске приложения модуль может создать администратора по умолчанию, его емайл и пароль нужно передавать через переменные окружения, если не передали, то админ по умолчанию не будет создан.

Обновляем файл _libs/core/auth/src/lib/auth.environments.ts_

```typescript
import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class AuthEnvironments {
  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin@example.com',
  })
  adminEmail?: string;

  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin',
  })
  @IsNotEmpty()
  adminUsername?: string;

  @EnvModelProperty({
    description: 'Global admin password',
  })
  adminPassword?: string;
}
```

Создаем сервис для вызова администраторских методов сервера авторизации, добавляем метод создания админа, этот метод будет вызываться при старте приложения и создавать админа системы по умолчанию.

Создаем файл _libs/core/auth/src/lib/services/auth-authorizer.service.ts_

```typescript
import { AuthorizerService } from '@nestjs-mod/authorizer';
import { Injectable, Logger } from '@nestjs/common';
import { AuthError } from '../auth.errors';

@Injectable()
export class AuthAuthorizerService {
  private logger = new Logger(AuthAuthorizerService.name);

  constructor(private readonly authorizerService: AuthorizerService) {}

  authorizerClientID() {
    return this.authorizerService.config.clientID;
  }

  async createAdmin(user: { username?: string; password: string; email: string }) {
    const signupUserResult = await this.authorizerService.signup({
      nickname: user.username,
      password: user.password,
      confirm_password: user.password,
      email: user.email.toLowerCase(),
      roles: ['admin'],
    });
    if (signupUserResult.errors.length > 0) {
      this.logger.error(signupUserResult.errors[0].message, signupUserResult.errors[0].stack);
      if (!signupUserResult.errors[0].message.includes('has already signed up')) {
        throw new AuthError(signupUserResult.errors[0].message);
      }
    } else {
      if (!signupUserResult.data?.user) {
        throw new AuthError('Failed to create a user');
      }

      await this.verifyUser({
        externalUserId: signupUserResult.data.user.id,
        email: signupUserResult.data.user.email,
      });

      this.logger.debug(`Admin with email: ${signupUserResult.data.user.email} successfully created!`);
    }
  }

  async verifyUser({ externalUserId, email }: { externalUserId: string; email: string }) {
    await this.updateUser(externalUserId, { email_verified: true, email });
    return this;
  }

  async updateUser(
    externalUserId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Partial<Record<string, any>>
  ) {
    if (Object.keys(params).length > 0) {
      const paramsForUpdate = Object.entries(params)
        .map(([key, value]) => (typeof value === 'boolean' ? `${key}: ${value}` : `${key}: "${value}"`))
        .join(',');
      const updateUserResult = await this.authorizerService.graphqlQuery({
        query: `mutation {
  _update_user(params: { 
      id: "${externalUserId}", ${paramsForUpdate} }) {
    id
  }
}`,
      });

      if (updateUserResult.errors.length > 0) {
        this.logger.error(updateUserResult.errors[0].message, updateUserResult.errors[0].stack);
        throw new AuthError(updateUserResult.errors[0].message);
      }
    }
  }
}
```

Создаем сервис с `OnModuleInit`-хуком в котором при старте модуля запускаем процесс создания дефолтного админа, если его не существует.

Создаем файл _libs/core/auth/src/lib/services/auth-authorizer-bootstrap.service.ts_

```typescript
import { isInfrastructureMode } from '@nestjs-mod/common';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuthAuthorizerService } from './auth-authorizer.service';
import { AuthEnvironments } from '../auth.environments';

@Injectable()
export class AuthAuthorizerBootstrapService implements OnModuleInit {
  private logger = new Logger(AuthAuthorizerBootstrapService.name);

  constructor(private readonly authAuthorizerService: AuthAuthorizerService, private readonly authEnvironments: AuthEnvironments) {}

  async onModuleInit() {
    this.logger.debug('onModuleInit');
    if (!isInfrastructureMode()) {
      try {
        await this.createAdmin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.logger.error(err, err.stack);
      }
    }
  }

  private async createAdmin() {
    try {
      if (this.authEnvironments.adminEmail && this.authEnvironments.adminPassword) {
        await this.authAuthorizerService.createAdmin({
          username: this.authEnvironments.adminUsername,
          password: this.authEnvironments.adminPassword,
          email: this.authEnvironments.adminEmail,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
  }
}
```

Добавляем созданные сервисы в `AuthModule`, в этом модуле подключаем глобальный `Guard` для постоянной проверки наличия токена авторизации при вызове любых методов бэкенда, а также подключаем фильтр для трансформации ошибок авторизации.

Переменные окружения для этого модуля будут иметь префикс `AUTH_`, для включения этого префикса нужно переопределить опцию `propertyNameFormatters`.

Названия переменных окружения: `SERVER_AUTH_ADMIN_EMAIL`, `SERVER_AUTH_ADMIN_USERNAME`, `SERVER_AUTH_ADMIN_PASSWORD`.

Обновляем файл _libs/core/auth/src/lib/auth.module.ts_

```typescript
import { AuthorizerGuard, AuthorizerModule } from '@nestjs-mod/authorizer';
import { createNestModule, getFeatureDotEnvPropertyNameFormatter, NestModuleCategory } from '@nestjs-mod/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AUTH_FEATURE, AUTH_MODULE } from './auth.constants';
import { AuthEnvironments } from './auth.environments';
import { AuthExceptionsFilter } from './auth.filter';
import { AuthorizerController } from './controllers/authorizer.controller';
import { AuthAuthorizerBootstrapService } from './services/auth-authorizer-bootstrap.service';
import { AuthAuthorizerService } from './services/auth-authorizer.service';

export const { AuthModule } = createNestModule({
  moduleName: AUTH_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: AuthEnvironments,
  imports: [
    AuthorizerModule.forFeature({
      featureModuleName: AUTH_FEATURE,
    }),
  ],
  controllers: [AuthorizerController],
  providers: [{ provide: APP_GUARD, useClass: AuthorizerGuard }, { provide: APP_FILTER, useClass: AuthExceptionsFilter }, AuthAuthorizerService, AuthAuthorizerBootstrapService],
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

### 7. Добавляем логику автоматического создания пользователей для модуля WebhookModule

Так как гард авторизации срабатывает автоматически при вызове любых методов, в том числе методов модуля `WebhookModule`, то мы можем создать нового пользователя для модуля `WebhookModule` в момент валидации токена авторизации.

Метод создания нового пользователя вынесем в отдельный сервис, который будет доступен при импорте модуля как фича `WebhookModule.forFeature()`.

Создаем файл _libs/core/webhook/src/lib/services/webhook-users.service.ts_

```typescript
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/webhook-client';
import { omit } from 'lodash/fp';
import { randomUUID } from 'node:crypto';
import { CreateWebhookUserArgs, WebhookUserObject } from '../types/webhook-user-object';
import { WEBHOOK_FEATURE } from '../webhook.constants';

@Injectable()
export class WebhookUsersService {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient
  ) {}

  async createUser(user: Omit<CreateWebhookUserArgs, 'id'>) {
    const data = {
      externalTenantId: randomUUID(),
      userRole: 'User',
      ...omit(['id', 'createdAt', 'updatedAt', 'Webhook_Webhook_createdByToWebhookUser', 'Webhook_Webhook_updatedByToWebhookUser'], user),
    } as WebhookUserObject;
    const existsUser = await this.prismaClient.webhookUser.findFirst({
      where: {
        externalTenantId: user.externalTenantId,
        externalUserId: user.externalUserId,
      },
    });
    if (!existsUser) {
      return await this.prismaClient.webhookUser.create({
        data,
      });
    }
    return existsUser;
  }
}
```

Экспортируем новый сервис из модуля и призма модуль который он использует.

Обновляем файл _libs/core/webhook/src/lib/webhook.module.ts_

```typescript
import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import { createNestModule, getFeatureDotEnvPropertyNameFormatter, NestModuleCategory } from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { HttpModule } from '@nestjs/axios';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ApiHeaders } from '@nestjs/swagger';
import { WebhookUsersController } from './controllers/webhook-users.controller';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookServiceBootstrap } from './services/webhook-bootstrap.service';
import { WebhookToolsService } from './services/webhook-tools.service';
import { WebhookUsersService } from './services/webhook-users.service';
import { WebhookService } from './services/webhook.service';
import { WebhookConfiguration, WebhookStaticConfiguration } from './webhook.configuration';
import { WEBHOOK_FEATURE, WEBHOOK_MODULE } from './webhook.constants';
import { WebhookEnvironments } from './webhook.environments';
import { WebhookExceptionsFilter } from './webhook.filter';
import { WebhookGuard } from './webhook.guard';

export const { WebhookModule } = createNestModule({
  moduleName: WEBHOOK_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: WebhookEnvironments,
  staticConfigurationModel: WebhookStaticConfiguration,
  configurationModel: WebhookConfiguration,
  imports: [
    HttpModule,
    PrismaModule.forFeature({
      contextName: WEBHOOK_FEATURE,
      featureModuleName: WEBHOOK_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: WEBHOOK_FEATURE,
    }),
  ],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: WEBHOOK_FEATURE,
      featureModuleName: WEBHOOK_FEATURE,
    }),
  ],
  providers: [WebhookToolsService, WebhookServiceBootstrap],
  controllers: [WebhookUsersController, WebhookController],
  sharedProviders: [WebhookService, WebhookUsersService],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(WEBHOOK_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: WEBHOOK_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
  preWrapApplication: async ({ current }) => {
    const staticEnvironments = current.staticEnvironments as WebhookEnvironments;
    const staticConfiguration = current.staticConfiguration as WebhookStaticConfiguration;

    for (const ctrl of [WebhookController, WebhookUsersController]) {
      if (staticEnvironments.useFilters) {
        UseFilters(WebhookExceptionsFilter)(ctrl);
      }
      if (staticEnvironments.useGuards) {
        UseGuards(WebhookGuard)(ctrl);
      }
      if (staticConfiguration.externalUserIdHeaderName && staticConfiguration.externalTenantIdHeaderName) {
        ApiHeaders([
          {
            name: staticConfiguration.externalUserIdHeaderName,
            allowEmptyValue: true,
          },
          {
            name: staticConfiguration.externalTenantIdHeaderName,
            allowEmptyValue: true,
          },
        ])(ctrl);
      }
    }
  },
});
```

Обновляем функцию создания конфигурации модуля `AuthorizerModule`, добавляем использование сервиса из модуля `WebhookModule`.

Обновляем файл _apps/server/src/main.ts_

```typescript
//...

bootstrapNestApplication({
  modules: {
    //...
    core: [
      AuthorizerModule.forRootAsync({
        imports: [WebhookModule.forFeature({ featureModuleName: AUTH_FEATURE })],
        inject: [WebhookUsersService],
        configurationFactory: (webhookUsersService: WebhookUsersService) => {
          return {
            extraHeaders: {
              'x-authorizer-url': `http://localhost:${process.env.SERVER_AUTHORIZER_EXTERNAL_CLIENT_PORT}`,
            },
            checkAccessValidator: async (authorizerUser?: AuthorizerUser, options?: CheckAccessOptions, ctx?: ExecutionContext) => {
              if (typeof ctx?.getClass === 'function' && typeof ctx?.getHandler === 'function' && ctx?.getClass().name === 'TerminusHealthCheckController' && ctx?.getHandler().name === 'check') {
                return true;
              }

              const result = await defaultAuthorizerCheckAccessValidator(authorizerUser, options);

              if (ctx && authorizerUser?.id) {
                const webhookUser = await webhookUsersService.createUser({
                  externalUserId: authorizerUser?.id,
                  externalTenantId: authorizerUser?.id,
                  userRole: authorizerUser.roles?.includes('admin') ? 'Admin' : 'User',
                });
                const req: WebhookRequest = getRequestFromExecutionContext(ctx);
                req.externalTenantId = webhookUser.externalTenantId;
              }

              return result;
            },
          };
        },
      }),
      //...
    ],
    //...
  },
  //...
});
```

### 8. Добавляем весь необходимый код в Angular-библиотеку по авторизации

Экземпляр клиента сервера авторизации создаем с помощью `DI` от `Angular`.

Создаем файл _libs/core/auth-angular/src/lib/services/authorizer.service.ts_

```typescript
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Authorizer, ConfigType } from '@authorizerdev/authorizer-js';

export const AUTHORIZER_URL = new InjectionToken<string>('AuthorizerURL');

@Injectable({ providedIn: 'root' })
export class AuthorizerService extends Authorizer {
  constructor(
    @Inject(AUTHORIZER_URL)
    private readonly authorizerURL: string
  ) {
    super({
      authorizerURL:
        // need for override from e2e-tests
        localStorage.getItem('authorizerURL') ||
        // use from environments
        authorizerURL,
      clientID: '',
      redirectURL: window.location.origin,
    } as ConfigType);
  }
}
```

Все дополнительные методы для работе с сервером авторизации, добавляем в `AuthService`.

Создаем файл _libs/core/auth-angular/src/lib/services/auth.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { AuthToken, LoginInput, SignupInput, User } from '@authorizerdev/authorizer-js';
import { mapGraphqlErrors } from '@nestjs-mod-fullstack/common-angular';
import { BehaviorSubject, catchError, from, map, of, tap } from 'rxjs';
import { AuthorizerService } from './authorizer.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  profile$ = new BehaviorSubject<User | undefined>(undefined);
  tokens$ = new BehaviorSubject<AuthToken | undefined>(undefined);

  constructor(private readonly authorizerService: AuthorizerService) {}

  getAuthorizerClientID() {
    return this.authorizerService.config.clientID;
  }

  setAuthorizerClientID(clientID: string) {
    this.authorizerService.config.clientID = clientID;
  }

  signUp(data: SignupInput) {
    return from(
      this.authorizerService.signup({
        ...data,
        email: data.email?.toLowerCase(),
      })
    ).pipe(
      mapGraphqlErrors(),
      map((result) => {
        this.setProfileAndTokens(result);
        return {
          profile: result?.user,
          tokens: this.tokens$.value,
        };
      })
    );
  }

  signIn(data: LoginInput) {
    return from(
      this.authorizerService.login({
        ...data,
        email: data.email?.toLowerCase(),
      })
    ).pipe(
      mapGraphqlErrors(),
      map((result) => {
        this.setProfileAndTokens(result);
        return {
          profile: result?.user,
          tokens: this.tokens$.value,
        };
      })
    );
  }

  signOut() {
    return from(this.authorizerService.logout(this.getAuthorizationHeaders())).pipe(
      mapGraphqlErrors(),
      tap(() => {
        this.clearProfileAndTokens();
      })
    );
  }

  refreshToken() {
    return from(this.authorizerService.browserLogin()).pipe(
      mapGraphqlErrors(),
      tap((result) => {
        this.setProfileAndTokens(result);
      }),
      catchError((err) => {
        console.error(err);
        this.clearProfileAndTokens();
        return of(null);
      })
    );
  }

  clearProfileAndTokens() {
    this.setProfileAndTokens({} as AuthToken);
  }

  setProfileAndTokens(result: AuthToken | undefined) {
    this.tokens$.next(result as AuthToken);
    this.profile$.next(result?.user);
  }

  getAuthorizationHeaders() {
    if (!this.tokens$.value?.access_token) {
      return undefined;
    }
    return {
      Authorization: `Bearer ${this.tokens$.value.access_token}`,
    };
  }
}
```

Часть страниц имеют ограничения по ролям, для активации такой возможности нам нужно создать `Guard`.

Создаем файл _libs/core/auth-angular/src/lib/services/auth-guard.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
export const AUTH_GUARD_DATA_ROUTE_KEY = 'authGuardData';

export class AuthGuardData {
  roles?: string[];

  constructor(options?: AuthGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(private readonly authAuthService: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot) {
    if (route.data[AUTH_GUARD_DATA_ROUTE_KEY] instanceof AuthGuardData) {
      const authGuardData = route.data[AUTH_GUARD_DATA_ROUTE_KEY];
      const authUser = this.authAuthService.profile$.value;
      const authGuardDataRoles = (authGuardData.roles || []).map((role) => role.toLowerCase());
      return of(Boolean((authUser && authGuardDataRoles.length > 0 && authGuardDataRoles.some((r) => authUser.roles?.includes(r))) || (authGuardDataRoles.length === 0 && !authUser?.roles)));
    }
    return of(true);
  }
}
```

Добавляем компоненту формы регистрации _libs/core/auth-angular/src/lib/forms/auth-sign-up-form/auth-sign-up-form.component.ts_

```typescript
import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthToken, SignupInput } from '@authorizerdev/authorizer-js';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [FormlyModule, NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, AsyncPipe, NgIf, RouterModule],
  selector: 'auth-sign-up-form',
  templateUrl: './auth-sign-up-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSignUpFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSignUp = new EventEmitter<AuthToken>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthSignUpFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.setFieldsAndModel({ password: '', confirm_password: '' });
  }

  setFieldsAndModel(data: SignupInput = { password: '', confirm_password: '' }) {
    this.formlyFields$.next([
      {
        key: 'email',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `auth.form.email`,
          placeholder: 'email',
          required: true,
        },
      },
      {
        key: 'password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `auth.form.password`,
          placeholder: 'password',
          required: true,
          type: 'password',
        },
      },
      {
        key: 'confirm_password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `auth.form.confirm_password`,
          placeholder: 'confirm_password',
          required: true,
          type: 'password',
        },
      },
    ]);
    this.formlyModel$.next(this.toModel(data));
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.toJson(this.form.value);
      this.authService
        .signUp({ ...value })
        .pipe(
          tap((result) => {
            if (result.tokens) {
              this.afterSignUp.next(result.tokens);
              this.nzMessageService.success('Success');
            }
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catchError((err: any) => {
            console.error(err);
            this.nzMessageService.error(err.message);
            return of(null);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning('Validation errors');
    }
  }

  private toModel(data: SignupInput): object | null {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }

  private toJson(data: SignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }
}
```

Добавляем шаблон формы регистрации _libs/core/auth-angular/src/lib/forms/auth-sign-up-form/auth-sign-up-form.component.html_

```html
@if (formlyFields$ | async; as formlyFields) {
<form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
  <formly-form [model]="formlyModel$ | async" [fields]="formlyFields" [form]="form"> </formly-form>
  @if (!hideButtons) {
  <nz-form-control>
    <div class="flex justify-between">
      <div>
        <button nz-button nzType="default" type="button" [routerLink]="'/sign-in'">Sign-in</button>
      </div>
      <button nz-button nzType="primary" type="submit" [disabled]="!form.valid">Sign-up</button>
    </div>
  </nz-form-control>
  }
</form>
}
```

Добавляем компоненту формы авторизации _libs/core/auth-angular/src/lib/forms/auth-sign-in-form/auth-sign-in-form.component.ts_

```typescript
import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthToken, LoginInput } from '@authorizerdev/authorizer-js';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [FormlyModule, NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, AsyncPipe, NgIf, RouterModule],
  selector: 'auth-sign-in-form',
  templateUrl: './auth-sign-in-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSignInFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSignIn = new EventEmitter<AuthToken>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: AuthSignInFormComponent,
    private readonly authService: AuthService,
    private readonly nzMessageService: NzMessageService
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
          label: `auth.form.email`,
          placeholder: 'email',
          required: true,
        },
      },
      {
        key: 'password',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `auth.form.password`,
          placeholder: 'password',
          required: true,
          type: 'password',
        },
      },
    ]);
    this.formlyModel$.next(this.toModel(data));
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.toJson(this.form.value);
      this.authService
        .signIn(value)
        .pipe(
          tap((result) => {
            if (result.tokens) {
              this.afterSignIn.next(result.tokens);
              this.nzMessageService.success('Success');
            }
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catchError((err: any) => {
            console.error(err);
            this.nzMessageService.error(err.message);
            return of(null);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning('Validation errors');
    }
  }

  private toModel(data: LoginInput): object | null {
    return {
      email: data['email'],
      password: data['password'],
    };
  }

  private toJson(data: LoginInput) {
    return {
      email: data['email'],
      password: data['password'],
    };
  }
}
```

Добавляем шаблон формы авторизации _libs/core/auth-angular/src/lib/forms/auth-sign-in-form/auth-sign-in-form.component.html_

```html
@if (formlyFields$ | async; as formlyFields) {
<form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
  <formly-form [model]="formlyModel$ | async" [fields]="formlyFields" [form]="form"> </formly-form>
  @if (!hideButtons) {
  <nz-form-control>
    <div class="flex justify-between">
      <div>
        <button nz-button nzType="default" type="button" [routerLink]="'/sign-up'">Sign-up</button>
      </div>
      <button nz-button nzType="primary" type="submit" [disabled]="!form.valid">Sign-in</button>
    </div>
  </nz-form-control>
  }
</form>
}
```

### 9. Добавляем сервис инициализации в Angular-приложение

В данном сервисе мы пытаемся рефрешить токен авторизации, а также подписываемся на получение токена при регистрации, авторизации и рефреше, полученный токен устанавливаем в `sdk` для работы с бэкендом.

Создаем файл _apps/client/src/app/app-initializer.ts_

```typescript
import { HttpHeaders } from '@angular/common/http';
import { DefaultRestService, WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthService } from '@nestjs-mod-fullstack/auth-angular';
import { catchError, map, mergeMap, of, Subscription, tap, throwError } from 'rxjs';

export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(private readonly defaultRestService: DefaultRestService, private readonly webhookRestService: WebhookRestService, private readonly authService: AuthService) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return (
      this.authService.getAuthorizerClientID()
        ? of(null)
        : this.defaultRestService.authorizerControllerGetAuthorizerClientID().pipe(
            map(({ clientID }) => {
              this.authService.setAuthorizerClientID(clientID);
              return null;
            })
          )
    ).pipe(
      mergeMap(() => this.authService.refreshToken()),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  private subscribeToTokenUpdates() {
    if (this.subscribeToTokenUpdatesSubscription) {
      this.subscribeToTokenUpdatesSubscription.unsubscribe();
      this.subscribeToTokenUpdatesSubscription = undefined;
    }
    this.subscribeToTokenUpdatesSubscription = this.authService.tokens$
      .pipe(
        tap(() => {
          const authorizationHeaders = this.authService.getAuthorizationHeaders();
          if (authorizationHeaders) {
            this.defaultRestService.defaultHeaders = new HttpHeaders(authorizationHeaders);
            this.webhookRestService.defaultHeaders = new HttpHeaders(authorizationHeaders);
          }
        })
      )
      .subscribe();
  }
}
```

### 10. Обновляем конфигурацию Angular-приложения

Обновляем файл _apps/client/src/app/app.config.ts_

```typescript
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DefaultRestService, RestClientApiModule, RestClientConfiguration, WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AUTHORIZER_URL, AuthService } from '@nestjs-mod-fullstack/auth-angular';
import { WEBHOOK_CONFIGURATION_TOKEN, WebhookConfiguration } from '@nestjs-mod-fullstack/webhook-angular';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { serverUrl, webhookSuperAdminExternalUserId } from '../environments/environment';
import { AppInitializer } from './app-initializer';
import { AppErrorHandler } from './app.error-handler';
import { appRoutes } from './app.routes';

export const appConfig = ({ authorizerURL }: { authorizerURL?: string }): ApplicationConfig => {
  return {
    providers: [
      provideClientHydration(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(appRoutes),
      provideHttpClient(),
      provideNzI18n(en_US),
      {
        provide: WEBHOOK_CONFIGURATION_TOKEN,
        useValue: new WebhookConfiguration({ webhookSuperAdminExternalUserId }),
      },
      importProvidersFrom(
        BrowserAnimationsModule,
        RestClientApiModule.forRoot(
          () =>
            new RestClientConfiguration({
              basePath: serverUrl,
            })
        ),
        FormlyModule.forRoot(),
        FormlyNgZorroAntdModule
      ),
      { provide: ErrorHandler, useClass: AppErrorHandler },
      {
        provide: AUTHORIZER_URL,
        useValue: authorizerURL,
      },
      {
        provide: APP_INITIALIZER,
        useFactory: (defaultRestService: DefaultRestService, webhookRestService: WebhookRestService, authService: AuthService) => () => new AppInitializer(defaultRestService, webhookRestService, authService).resolve(),
        multi: true,
        deps: [DefaultRestService, WebhookRestService, AuthService],
      },
    ],
  };
};
```

### 11. Обновляем файлы и добавляем новые для запуска docker-compose и kubernetes

Полностью описывать изменения во всех файлах я не буду, их можно посмотреть по коммиту с изменениями для текущего поста, ниже просто добавлю обновленный `docker-compose-full.yml` и его файл с переменными окружения.

Обновляем файл _.docker/docker-compose-full.yml_

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-postgre-sql:
    image: 'bitnami/postgresql:15.5.0'
    container_name: 'nestjs-mod-fullstack-postgre-sql'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'pg_isready -U postgres'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
    environment:
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
  nestjs-mod-fullstack-authorizer:
    image: 'lakhansamani/authorizer:1.4.4'
    container_name: 'nestjs-mod-fullstack-authorizer'
    ports:
      - '8000:8080'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      DATABASE_URL: '${SERVER_AUTHORIZER_DATABASE_URL}'
      DATABASE_TYPE: '${SERVER_AUTHORIZER_DATABASE_TYPE}'
      DATABASE_NAME: '${SERVER_AUTHORIZER_DATABASE_NAME}'
      ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
      PORT: '${SERVER_AUTHORIZER_PORT}'
      AUTHORIZER_URL: '${SERVER_AUTHORIZER_URL}'
      COOKIE_NAME: '${SERVER_AUTHORIZER_COOKIE_NAME}'
      SMTP_HOST: '${SERVER_AUTHORIZER_SMTP_HOST}'
      SMTP_PORT: '${SERVER_AUTHORIZER_SMTP_PORT}'
      SMTP_USERNAME: '${SERVER_AUTHORIZER_SMTP_USERNAME}'
      SMTP_PASSWORD: '${SERVER_AUTHORIZER_SMTP_PASSWORD}'
      SENDER_EMAIL: '${SERVER_AUTHORIZER_SENDER_EMAIL}'
      SENDER_NAME: '${SERVER_AUTHORIZER_SENDER_NAME}'
      DISABLE_PLAYGROUND: '${SERVER_AUTHORIZER_DISABLE_PLAYGROUND}'
      ACCESS_TOKEN_EXPIRY_TIME: '${SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME}'
      DISABLE_STRONG_PASSWORD: '${SERVER_AUTHORIZER_DISABLE_STRONG_PASSWORD}'
      DISABLE_EMAIL_VERIFICATION: '${SERVER_AUTHORIZER_DISABLE_EMAIL_VERIFICATION}'
      ORGANIZATION_NAME: '${SERVER_AUTHORIZER_ORGANIZATION_NAME}'
      IS_SMS_SERVICE_ENABLED: '${SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED}'
      IS_EMAIL_SERVICE_ENABLED: '${SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED}'
      ENV: '${SERVER_AUTHORIZER_ENV}'
      RESET_PASSWORD_URL: '${SERVER_AUTHORIZER_RESET_PASSWORD_URL}'
      ROLES: '${SERVER_AUTHORIZER_ROLES}'
      DEFAULT_ROLES: '${SERVER_AUTHORIZER_DEFAULT_ROLES}'
      JWT_ROLE_CLAIM: '${SERVER_AUTHORIZER_JWT_ROLE_CLAIM}'
      ORGANIZATION_LOGO: '${SERVER_AUTHORIZER_ORGANIZATION_LOGO}'
    tty: true
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
      SERVER_AUTHORIZER_DATABASE_URL: '${SERVER_AUTHORIZER_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-server:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-server:${SERVER_VERSION}'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:${SERVER_PORT}/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_PORT: '${SERVER_PORT}'
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
      SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID: '${SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}'
      SERVER_AUTH_ADMIN_EMAIL: '${SERVER_AUTH_ADMIN_EMAIL}'
      SERVER_AUTH_ADMIN_USERNAME: '${SERVER_AUTH_ADMIN_USERNAME}'
      SERVER_AUTH_ADMIN_PASSWORD: '${SERVER_AUTH_ADMIN_PASSWORD}'
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
      SERVER_AUTHORIZER_URL: '${SERVER_AUTHORIZER_URL}'
      SERVER_AUTHORIZER_REDIRECT_URL: '${SERVER_AUTHORIZER_REDIRECT_URL}'
      SERVER_AUTHORIZER_AUTHORIZER_URL: '${SERVER_AUTHORIZER_AUTHORIZER_URL}'
      SERVER_AUTHORIZER_ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx:${CLIENT_VERSION}'
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'curl -so /dev/null http://localhost:${NGINX_PORT} || exit 1']
      interval: 30s
      timeout: 10s
      retries: 10
    environment:
      SERVER_PORT: '${SERVER_PORT}'
      NGINX_PORT: '${NGINX_PORT}'
      CLIENT_AUTHORIZER_URL: '${CLIENT_AUTHORIZER_URL}'
      CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID: '${CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '${NGINX_PORT}:${NGINX_PORT}'
  nestjs-mod-fullstack-e2e-tests:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-e2e-tests'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      IS_DOCKER_COMPOSE: 'true'
      BASE_URL: 'http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
      SERVER_AUTHORIZER_URL: 'http://nestjs-mod-fullstack-authorizer:8080'
      SERVER_URL: 'http://nestjs-mod-fullstack-server:8080'
      SERVER_AUTH_ADMIN_EMAIL: '${SERVER_AUTH_ADMIN_EMAIL}'
      SERVER_AUTH_ADMIN_USERNAME: '${SERVER_AUTH_ADMIN_USERNAME}'
      SERVER_AUTH_ADMIN_PASSWORD: '${SERVER_AUTH_ADMIN_PASSWORD}'
      SERVER_AUTHORIZER_ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-https-portal:
    image: steveltn/https-portal:1
    container_name: 'nestjs-mod-fullstack-https-portal'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '80:80'
      - '443:443'
    links:
      - nestjs-mod-fullstack-nginx
    restart: always
    environment:
      STAGE: '${HTTPS_PORTAL_STAGE}'
      DOMAINS: '${SERVER_DOMAIN} -> http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    volumes:
      - nestjs-mod-fullstack-https-portal-volume:/var/lib/https-portal
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
  nestjs-mod-fullstack-https-portal-volume:
    name: 'nestjs-mod-fullstack-https-portal-volume'
```

Обновляем файл _.docker/docker-compose-full.env_

```sh
SERVER_PORT=9090
NGINX_PORT=8080
SERVER_ROOT_DATABASE_URL=postgres://postgres:postgres_password@nestjs-mod-fullstack-postgre-sql:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:app_password@nestjs-mod-fullstack-postgre-sql:5432/app?schema=public
SERVER_WEBHOOK_DATABASE_URL=postgres://webhook:webhook_password@nestjs-mod-fullstack-postgre-sql:5432/webhook?schema=public
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_DOMAIN=example.com
HTTPS_PORTAL_STAGE=local # local|stage|production

CLIENT_AUTHORIZER_URL=http://localhost:8000
SERVER_AUTHORIZER_REDIRECT_URL=http://localhost:8080
SERVER_AUTH_ADMIN_EMAIL=nestjs-mod-fullstack@site15.ru
SERVER_AUTH_ADMIN_USERNAME=admin
SERVER_AUTH_ADMIN_PASSWORD=SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA
SERVER_URL=http://localhost:9090/api
SERVER_AUTHORIZER_URL=http://localhost:8000
SERVER_AUTHORIZER_ADMIN_SECRET=VfKSfPPljhHBXCEohnitursmgDxfAyiD
SERVER_AUTHORIZER_DATABASE_TYPE=postgres
SERVER_AUTHORIZER_DATABASE_URL=postgres://Yk42KA4sOb:B7Ep2MwlRR6fAx0frXGWVTGP850qAxM6@nestjs-mod-fullstack-postgre-sql:5432/authorizer
SERVER_AUTHORIZER_DATABASE_NAME=authorizer
SERVER_AUTHORIZER_PORT=8080
SERVER_AUTHORIZER_AUTHORIZER_URL=http://nestjs-mod-fullstack-authorizer:8080
SERVER_AUTHORIZER_COOKIE_NAME=authorizer
SERVER_AUTHORIZER_DISABLE_PLAYGROUND=true
SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME=30m
SERVER_AUTHORIZER_DISABLE_STRONG_PASSWORD=true
SERVER_AUTHORIZER_DISABLE_EMAIL_VERIFICATION=true
SERVER_AUTHORIZER_ORGANIZATION_NAME=NestJSModFullstack
SERVER_AUTHORIZER_IS_EMAIL_SERVICE_ENABLED=true
SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED=false
SERVER_AUTHORIZER_RESET_PASSWORD_URL=/reset-password
SERVER_AUTHORIZER_ROLES=user,admin
SERVER_AUTHORIZER_DEFAULT_ROLES=user
SERVER_AUTHORIZER_JWT_ROLE_CLAIM=role
```

### 12. Обновляем E2E-тесты

При написании и запуске E2E-тестов много кода дублируется, для того чтобы убрать дублирование создаем тестовую утилиту.

Создаем файл _libs/testing/src/lib/utils/rest-client-helper.ts_

```typescript
import { AuthToken, Authorizer } from '@authorizerdev/authorizer-js';
import { Configuration, DefaultApi, WebhookApi } from '@nestjs-mod-fullstack/app-rest-sdk';
import axios, { AxiosInstance } from 'axios';
import { get } from 'env-var';
import { GenerateRandomUserResult, generateRandomUser } from './generate-random-user';
import { getUrls } from './get-urls';

export class RestClientHelper {
  private authorizerClientID!: string;

  authorizationTokens?: AuthToken;

  private webhookApi?: WebhookApi;
  private defaultApi?: DefaultApi;
  private authorizer?: Authorizer;

  private defaultApiAxios?: AxiosInstance;
  private webhookApiAxios?: AxiosInstance;

  randomUser?: GenerateRandomUserResult;

  constructor(
    private readonly options?: {
      isAdmin?: boolean;
      serverUrl?: string;
      authorizerURL?: string;
      randomUser?: GenerateRandomUserResult;
    }
  ) {
    this.randomUser = options?.randomUser;
    this.createApiClients();
  }

  getGeneratedRandomUser(): Required<GenerateRandomUserResult> {
    if (!this.randomUser) {
      throw new Error('this.randomUser not set');
    }
    return this.randomUser as Required<GenerateRandomUserResult>;
  }

  getWebhookApi() {
    if (!this.webhookApi) {
      throw new Error('webhookApi not set');
    }
    return this.webhookApi;
  }

  getDefaultApi() {
    if (!this.defaultApi) {
      throw new Error('defaultApi not set');
    }
    return this.defaultApi;
  }

  async getAuthorizerClient() {
    if (!this.authorizerClientID && this.defaultApi) {
      this.authorizerClientID = (await this.defaultApi.authorizerControllerGetAuthorizerClientID()).data.clientID;
      if (!this.options?.isAdmin) {
        this.authorizer = new Authorizer({
          authorizerURL: this.getAuthorizerUrl(),
          clientID: this.authorizerClientID,
          redirectURL: this.getServerUrl(),
        });
      } else {
        this.authorizer = new Authorizer({
          authorizerURL: this.getAuthorizerUrl(),
          clientID: this.authorizerClientID,
          redirectURL: this.getServerUrl(),
          extraHeaders: {
            'x-authorizer-admin-secret': get('SERVER_AUTHORIZER_ADMIN_SECRET').required().asString(),
          },
        });
      }
    }
    return this.authorizer as Authorizer;
  }

  async setRoles(roles: string[]) {
    const _updateUserResult = await (
      await this.getAuthorizerClient()
    ).graphqlQuery({
      query: `mutation {
  _update_user(
    params: { id: "${this.authorizationTokens?.user?.id}", roles: ${JSON.stringify(roles)} }
  ) {
    id
    roles
  }
}`,
    });
    if (_updateUserResult.errors.length > 0) {
      console.error(_updateUserResult.errors);
      throw new Error(_updateUserResult.errors[0].message);
    }
    await this.login();

    return this;
  }

  async createAndLoginAsUser(options?: Pick<GenerateRandomUserResult, 'email' | 'password'>) {
    await this.generateRandomUser(options);
    await this.reg();
    await this.login(options);

    if (this.options?.isAdmin) {
      await this.setRoles(['admin', 'user']);
    }

    return this;
  }

  async generateRandomUser(options?: Pick<GenerateRandomUserResult, 'email' | 'password'> | undefined) {
    if (!this.randomUser || options) {
      this.randomUser = await generateRandomUser(undefined, options);
    }
    return this;
  }

  async reg() {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }
    await (
      await this.getAuthorizerClient()
    ).signup({
      email: this.randomUser.email,
      confirm_password: this.randomUser.password,
      password: this.randomUser.password,
    });
    return this;
  }

  async login(options?: Partial<Pick<GenerateRandomUserResult, 'email' | 'password'>>) {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }
    const loginOptions = {
      email: options?.email || this.randomUser.email,
      password: options?.password || this.randomUser.password,
    };
    const loginResult = await (await this.getAuthorizerClient()).login(loginOptions);

    if (loginResult.errors.length) {
      throw new Error(loginResult.errors[0].message);
    }

    this.authorizationTokens = loginResult.data;

    if (this.webhookApiAxios) {
      Object.assign(this.webhookApiAxios.defaults.headers.common, this.getAuthorizationHeaders());
    }
    if (this.defaultApiAxios) {
      Object.assign(this.defaultApiAxios.defaults.headers.common, this.getAuthorizationHeaders());
    }

    return this;
  }

  async logout() {
    await (await this.getAuthorizerClient()).logout(this.getAuthorizationHeaders());
    return this;
  }

  getAuthorizationHeaders() {
    return {
      Authorization: `Bearer ${this.authorizationTokens?.access_token}`,
    };
  }

  private createApiClients() {
    this.webhookApiAxios = axios.create();
    this.defaultApiAxios = axios.create();

    this.webhookApi = new WebhookApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.webhookApiAxios
    );
    this.defaultApi = new DefaultApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.defaultApiAxios
    );
  }

  private getAuthorizerUrl(): string {
    return this.options?.authorizerURL || getUrls().authorizerUrl;
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
  }
}
```

Описывать изменения во всех файлах с тестами я не буду, добавлю только один где используются пользователи с разными ролями.

Обновляем файл _apps/server-e2e/src/server/webhook-crud-as-admin.spec.ts_

```typescript
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { get } from 'env-var';

describe('CRUD operations with Webhook as "Admin" role', () => {
  const user1 = new RestClientHelper();
  const admin = new RestClientHelper({
    isAdmin: true,
  });

  let createEventName: string;

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
    await admin.login({
      email: get('SERVER_AUTH_ADMIN_EMAIL').required().asString(),
      password: get('SERVER_AUTH_ADMIN_PASSWORD').required().asString(),
    });

    const { data: events } = await user1.getWebhookApi().webhookControllerEvents();
    createEventName = events.find((e) => e.eventName.includes('create'))?.eventName || 'create';
    expect(events.map((e) => e.eventName)).toEqual(['app-demo.create', 'app-demo.update', 'app-demo.delete']);
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await user1.getWebhookApi().webhookControllerFindMany();
    for (const webhook of manyWebhooks.webhooks) {
      if (webhook.endpoint.startsWith(user1.getGeneratedRandomUser().site)) {
        await user1.getWebhookApi().webhookControllerUpdateOne(webhook.id, {
          enabled: false,
        });
      }
    }
    //

    const { data: manyWebhooks2 } = await admin.getWebhookApi().webhookControllerFindMany();
    for (const webhook of manyWebhooks2.webhooks) {
      if (webhook.endpoint.startsWith(admin.getGeneratedRandomUser().site)) {
        await admin.getWebhookApi().webhookControllerUpdateOne(webhook.id, {
          enabled: false,
        });
      }
    }
  });

  it('should create new webhook as user1', async () => {
    const { data: newWebhook } = await user1.getWebhookApi().webhookControllerCreateOne({
      enabled: false,
      endpoint: user1.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: user1.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
  });

  it('should create new webhook as admin', async () => {
    const { data: newWebhook } = await admin.getWebhookApi().webhookControllerCreateOne({
      enabled: false,
      endpoint: admin.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: admin.getGeneratedRandomUser().site,
      eventName: createEventName,
    });
  });

  it('should read one webhooks as user', async () => {
    const { data: manyWebhooks } = await user1.getWebhookApi().webhookControllerFindMany();
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 1 },
      webhooks: [
        {
          enabled: false,
          endpoint: user1.getGeneratedRandomUser().site,
          eventName: createEventName,
        },
      ],
    });
  });

  it('should read all webhooks as admin', async () => {
    const { data: manyWebhooks } = await admin.getWebhookApi().webhookControllerFindMany();
    expect(manyWebhooks.meta.totalResults).toBeGreaterThan(1);
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5 },
    });
  });
});
```

### Заключение

В данном посте в качестве сервера авторизации был выбран - https://authorizer.dev, но принцип работы с другими серверами авторизации примерно такой же и дополнительный код который был написан на фронтенде и бэкенде не сильно будет отличаться.

Выбранный для этого проекта сервер авторизации очень простой в плане внедрения в проект, но он не поддерживает мутитенантность, так что если вам нужна такая опция, то лучше выбрать другой сервер авторизации или написать свой.

Авто рефрешь токена при ошибке 401 в данной версии проекта не предусмотрен, он будет внедрен в будущих постах.

### Планы

У пользователя сервера авторизации есть поле `picture`, но на сервере авторизации нет метода для загрузки фотографии. В следующем посте я подключу https://min.io/ в проект и настрою интеграцию с NestJS и Angular...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/414980df21e585cb798e1ff756300c4547e68a42..2e4639867c55e350f0c52dee4cb581fc624b5f9d - изменения
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/11729520686/artifacts/2159651164 - видео тестов

#angular #authorizer #nestjsmod #fullstack
