## [2024-10-29] Подключаем сервер авторизации https://authorizer.dev в NestJS и Angular приложение

Предыдущая статья: [Создание конфигурируемого Webhook-модуля для NestJS-приложении](https://habr.com/ru/articles/848634/)

В этой статье я опишу создание таблички отображающей данные и формы для ее заполнения, интерфейсы строятся на компонентах от https://ng.ant.design, формы создаются и управляются с помощью https://formly.dev, для стилей используется https://tailwindcss.com, стейт машины нет.

### 1. Создаем Angular библиотеку по авторизации

Создаем `Angular`-библиотеку для хранения компонент с формами авторизации и регистрации.

_Commands_

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

### 2. Создаем NestJS библиотеку по авторизации

Создаем `NestJS`-библиотеку.

_Commands_

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

_Commands_

```bash
npm install --save @nestjs-mod/authorizer @authorizerdev/authorizer-js @faker-js/faker env-var
```

<spoiler title="Вывод консоли">

```bash
$ npm install --save @nestjs-mod/authorizer @authorizerdev/authorizer-js @faker-js/faker env-var

added 4 packages, removed 371 packages, and audited 2787 packages in 18s

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

### 4. Добавляем бэкенде все нужные модули

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

_Commands_

```bash
npm run docs:infrastructure
```

<spoiler title="Вывод консоли">

```bash

```

</spoiler>
