## [2024-08-14] Добавление Swagger документации в NestJS-mod приложение и генерация REST-клиента для Angular-приложения.

Предыдущая статья: [Подключение PrismaORM в NestJS-mod приложение и проверка его работы через REST](https://github.com/nestjs-mod/nestjs-mod-fullstack/blob/master/steps/2024-08-13/ru.md)

Подключение генератора Swagger документации к бэкенду.

Подключение https://www.npmjs.com/package/prisma-class-generator для генерации DTO из Prisma - схемы.

Создание nx библиотеки для работы с бэкендом.

Подключение https://www.npmjs.com/package/@openapitools/openapi-generator-cli для генерации SDK для работы с бэкендом.

### 1. Устанавливаем все необходимые пакеты

_Команды_

```bash
# Install all need dependencies
npm i --save @nestjs/swagger

# Install all need dev-dependencies
npm i --save-dev prisma-class-generator @openapitools/openapi-generator-cli

# Install all need peer-dependencies
npm i --save class-transformer class-validator
```

<spoiler title="Вывод консоли">

```bash
$ npm i --save @nestjs/swagger

added 5 packages, removed 1 package, and audited 2512 packages in 14s

300 packages are looking for funding
  run `npm fund` for details

17 vulnerabilities (6 moderate, 11 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

$ npm i --save-dev prisma-class-generator @openapitools/openapi-generator-cli

added 50 packages, and audited 2562 packages in 15s

304 packages are looking for funding
  run `npm fund` for details

18 vulnerabilities (6 moderate, 12 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

$ npm i --save class-transformer class-validator

added 1 package, removed 1 package, and audited 2768 packages in 9s

331 packages are looking for funding
  run `npm fund` for details

18 vulnerabilities (6 moderate, 12 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

</spoiler>

### 2. Создаем Angular библиотеку для работы с бэкендом

Эта библиотека будет использоваться для работы с бэкендом.

_Команды_

```bash
# Create Angular library
./node_modules/.bin/nx g @nx/angular:library app-angular-rest-sdk --buildable --publishable --directory=libs/sdk/app-angular-rest-sdk --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix=app-angular-rest-sdk --standalone=true --selector=app-angular-rest-sdk --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/app-angular-rest-sdk

# Change file with test options
rm -rf libs/sdk/app-angular-rest-sdk/src/test-setup.ts
cp apps/client/src/test-setup.ts libs/sdk/app-angular-rest-sdk/src/test-setup.ts
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx g @nx/angular:library app-angular-rest-sdk --buildable --publishable --directory=libs/sdk/app-angular-rest-sdk --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix=app-angular-rest-sdk --standalone=true --selector=app-angular-rest-sdk --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/app-angular-rest-sdk

 NX  Generating @nx/angular:library

UPDATE nx.json
CREATE libs/sdk/app-angular-rest-sdk/project.json
CREATE libs/sdk/app-angular-rest-sdk/README.md
CREATE libs/sdk/app-angular-rest-sdk/ng-package.json
CREATE libs/sdk/app-angular-rest-sdk/package.json
CREATE libs/sdk/app-angular-rest-sdk/tsconfig.json
CREATE libs/sdk/app-angular-rest-sdk/tsconfig.lib.json
CREATE libs/sdk/app-angular-rest-sdk/tsconfig.lib.prod.json
CREATE libs/sdk/app-angular-rest-sdk/src/index.ts
CREATE libs/sdk/app-angular-rest-sdk/jest.config.ts
CREATE libs/sdk/app-angular-rest-sdk/src/test-setup.ts
CREATE libs/sdk/app-angular-rest-sdk/tsconfig.spec.json
CREATE libs/sdk/app-angular-rest-sdk/src/lib/app-angular-rest-sdk/app-angular-rest-sdk.component.css
CREATE libs/sdk/app-angular-rest-sdk/src/lib/app-angular-rest-sdk/app-angular-rest-sdk.component.html
CREATE libs/sdk/app-angular-rest-sdk/src/lib/app-angular-rest-sdk/app-angular-rest-sdk.component.spec.ts
CREATE libs/sdk/app-angular-rest-sdk/src/lib/app-angular-rest-sdk/app-angular-rest-sdk.component.ts
CREATE libs/sdk/app-angular-rest-sdk/.eslintrc.json
UPDATE package.json
UPDATE tsconfig.base.json

added 31 packages, removed 37 packages, and audited 2556 packages in 12s

304 packages are looking for funding
  run `npm fund` for details

16 vulnerabilities (4 moderate, 12 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

 NX   👀 View Details of app-angular-rest-sdk

Run "nx show project app-angular-rest-sdk" to view details about this project.
```

</spoiler>

### 3. Создаем NestJS библиотеку для работы с бэкендом

Эта библиотека будет использоваться из E2E-тестов бэкенда.

_Команды_

```bash
# Create NestJS library
./node_modules/.bin/nx g @nestjs-mod/schematics:library app-rest-sdk --buildable --publishable --directory=libs/sdk/app-rest-sdk --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library app-rest-sdk --buildable --publishable --directory=libs/sdk/app-rest-sdk --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/sdk/app-rest-sdk/tsconfig.json
CREATE libs/sdk/app-rest-sdk/src/index.ts
CREATE libs/sdk/app-rest-sdk/tsconfig.lib.json
CREATE libs/sdk/app-rest-sdk/README.md
CREATE libs/sdk/app-rest-sdk/package.json
CREATE libs/sdk/app-rest-sdk/project.json
CREATE libs/sdk/app-rest-sdk/.eslintrc.json
CREATE libs/sdk/app-rest-sdk/jest.config.ts
CREATE libs/sdk/app-rest-sdk/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/sdk/app-rest-sdk/src/lib/app-rest-sdk.configuration.ts
CREATE libs/sdk/app-rest-sdk/src/lib/app-rest-sdk.environments.ts
CREATE libs/sdk/app-rest-sdk/src/lib/app-rest-sdk.module.ts
```

</spoiler>

### 4. Добавляем дополнительный генератор DTO в Prisma-схему

Обновленный файл `apps/server/src/prisma/app-schema.prisma`

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../../../../node_modules/@prisma/app-client"
  engineType = "binary"
}

generator prismaClassGenerator {
  provider               = "prisma-class-generator"
  output                 = "../app/generated/rest/dto"
  dryRun                 = "false"
  separateRelationFields = "false"
  makeIndexFile          = "file"
}

datasource db {
  provider = "postgres"
  url      = env("SERVER_APP_DATABASE_URL")
}

model AppDemo {
  id        String   @id(map: "PK_APP_DEMO") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  name      String   @unique(map: "UQ_APP_DEMO") @db.VarChar(128)
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @default(now()) @db.Timestamp(6)
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

```

### 5. Добавляем поддержку генерации Swagger документации в бэкенд коде

Обновленный файла `apps/server/src/main.ts`

```typescript
import { DefaultNestApplicationInitializer, DefaultNestApplicationListener, InfrastructureMarkdownReportGenerator, PACKAGE_JSON_FILE, ProjectUtils, bootstrapNestApplication, isInfrastructureMode } from '@nestjs-mod/common';
import { DOCKER_COMPOSE_FILE, DockerCompose, DockerComposePostgreSQL } from '@nestjs-mod/docker-compose';
import { FLYWAY_JS_CONFIG_FILE, Flyway } from '@nestjs-mod/flyway';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { FakePrismaClient, PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { AppModule } from './app/app.module';

const appFeatureName = 'app';
const rootFolder = join(__dirname, '..', '..', '..');
const appFolder = join(rootFolder, 'apps', 'server');

bootstrapNestApplication({
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
          packageJsonFile: join(rootFolder, PACKAGE_JSON_FILE),
          envFile: join(rootFolder, '.env'),
        },
      }),
      DefaultNestApplicationInitializer.forRoot({
        staticConfiguration: { bufferLogs: true },
      }),
      NestjsPinoLoggerModule.forRoot(),
      TerminusHealthCheckModule.forRootAsync({
        configurationFactory: (memoryHealthIndicator: MemoryHealthIndicator) => ({
          standardHealthIndicators: [
            {
              name: 'memory_heap',
              check: () => memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
            },
          ],
        }),
        inject: [MemoryHealthIndicator],
      }),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          // When running in infrastructure mode, the backend server does not start.
          mode: isInfrastructureMode() ? 'silent' : 'listen',
          async preListen(options) {
            if (options.app) {
              options.app.setGlobalPrefix('api');

              const swaggerConf = new DocumentBuilder().addBearerAuth().build();

              const document = SwaggerModule.createDocument(options.app, swaggerConf);

              SwaggerModule.setup('swagger', options.app, document);

              if (isInfrastructureMode()) {
                writeFileSync(resolve(__dirname, '..', '..', '..', 'app-swagger.json'), JSON.stringify(document));
              }
            }
          },
        },
      }),
    ],
    core: [
      PrismaModule.forRoot({
        staticConfiguration: {
          schemaFile: join(appFolder, 'src', 'prisma', `${appFeatureName}-${PRISMA_SCHEMA_FILE}`),
          featureName: appFeatureName,
          prismaModule: isInfrastructureMode() ? { PrismaClient: FakePrismaClient } : import(`@prisma/app-client`),
          addMigrationScripts: false,
        },
      }),
    ],
    feature: [AppModule.forRoot()],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
        },
      }),
      Pm2.forRoot({
        configuration: {
          ecosystemConfigFile: join(rootFolder, ECOSYSTEM_CONFIG_FILE),
          applicationScriptFile: join('dist/apps/server/main.js'),
        },
      }),
      DockerCompose.forRoot({
        configuration: {
          dockerComposeFileVersion: '3',
          dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
        },
      }),
      DockerComposePostgreSQL.forRoot(),
      DockerComposePostgreSQL.forFeature({
        featureModuleName: appFeatureName,
      }),
      Flyway.forRoot({
        staticConfiguration: {
          featureName: appFeatureName,
          migrationsFolder: join(appFolder, 'src', 'migrations'),
          configFile: join(rootFolder, FLYWAY_JS_CONFIG_FILE),
        },
      }),
    ],
  },
});
```

### 6. Добавляем команду для генерации SDK для работы с бэкендом

Обновленная часть файла `apps/server/project.json`

```json
{
  "generate": {
    "executor": "nx:run-commands",
    "options": {
      "commands": ["./node_modules/.bin/prisma generate --schema=./apps/server/src/prisma/app-schema.prisma", "./node_modules/.bin/rucken make-ts-list", "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx serve server --host=0.0.0.0 --watch=false", "rm -rf ./libs/sdk/app-angular-rest-sdk/src/lib && mkdir ./libs/sdk/app-angular-rest-sdk/src/lib && ./node_modules/.bin/openapi-generator-cli generate -i ./app-swagger.json -g typescript-angular -o ./libs/sdk/app-angular-rest-sdk/src/lib  --additional-properties=apiModulePrefix=RestClient,configurationPrefix=RestClient,fileNaming=kebab-case,modelFileSuffix=.interface,modelSuffix=Interface,enumNameSuffix=Type,enumPropertyNaming=original,serviceFileSuffix=-rest.service,serviceSuffix=RestService", "rm -rf ./libs/sdk/app-rest-sdk/src/lib && mkdir ./libs/sdk/app-rest-sdk/src/lib && ./node_modules/.bin/openapi-generator-cli generate -i ./app-swagger.json -g typescript-axios -o ./libs/sdk/app-rest-sdk/src/lib"],
      "parallel": false,
      "envFile": "./.env",
      "color": true
    }
  }
}
```

### 7. Для работы Swagger генератора нужно установить Java

_Команды_

```bash
sudo apt install default-jre
```

<spoiler title="Вывод консоли">

```bash
$ sudo apt install default-jre
[sudo] password for endy:
Reading package lists... Done
Building dependency tree
Reading state information... Done
The following additional packages will be installed:
  default-jre-headless openjdk-11-jre openjdk-11-jre-headless
Suggested packages:
  fonts-ipafont-gothic fonts-ipafont-mincho fonts-wqy-microhei | fonts-wqy-zenhei
The following NEW packages will be installed:
  default-jre default-jre-headless openjdk-11-jre openjdk-11-jre-headless
0 upgraded, 4 newly installed, 0 to remove and 9 not upgraded.
Need to get 38,5 MB of archives.
After this operation, 177 MB of additional disk space will be used.
Do you want to continue? [Y/n] Y
Get:1 http://ru.archive.ubuntu.com/ubuntu focal-updates/main amd64 openjdk-11-jre-headless amd64 11.0.24+8-1ubuntu3~20.04 [38,3 MB]
Get:2 http://ru.archive.ubuntu.com/ubuntu focal/main amd64 default-jre-headless amd64 2:1.11-72 [3 192 B]
Get:3 http://ru.archive.ubuntu.com/ubuntu focal-updates/main amd64 openjdk-11-jre amd64 11.0.24+8-1ubuntu3~20.04 [195 kB]
Get:4 http://ru.archive.ubuntu.com/ubuntu focal/main amd64 default-jre amd64 2:1.11-72 [1 084 B]
Fetched 38,5 MB in 6s (6 643 kB/s)
Selecting previously unselected package openjdk-11-jre-headless:amd64.
(Reading database ... 224645 files and directories currently installed.)
Preparing to unpack .../openjdk-11-jre-headless_11.0.24+8-1ubuntu3~20.04_amd64.deb ...
Unpacking openjdk-11-jre-headless:amd64 (11.0.24+8-1ubuntu3~20.04) ...
Selecting previously unselected package default-jre-headless.
Preparing to unpack .../default-jre-headless_2%3a1.11-72_amd64.deb ...
Unpacking default-jre-headless (2:1.11-72) ...
Selecting previously unselected package openjdk-11-jre:amd64.
Preparing to unpack .../openjdk-11-jre_11.0.24+8-1ubuntu3~20.04_amd64.deb ...
Unpacking openjdk-11-jre:amd64 (11.0.24+8-1ubuntu3~20.04) ...
Selecting previously unselected package default-jre.
Preparing to unpack .../default-jre_2%3a1.11-72_amd64.deb ...
Unpacking default-jre (2:1.11-72) ...
Setting up openjdk-11-jre-headless:amd64 (11.0.24+8-1ubuntu3~20.04) ...
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/bin/java to provide /usr/bin/java (java) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs to provide /usr/bin/jjs (jjs) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/bin/keytool to provide /usr/bin/keytool (keytool) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/bin/rmid to provide /usr/bin/rmid (rmid) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/bin/rmiregistry to provide /usr/bin/rmiregistry (rmiregistry) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/bin/pack200 to provide /usr/bin/pack200 (pack200) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/bin/unpack200 to provide /usr/bin/unpack200 (unpack200) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-openjdk-amd64/lib/jexec to provide /usr/bin/jexec (jexec) in auto mode
Setting up openjdk-11-jre:amd64 (11.0.24+8-1ubuntu3~20.04) ...
Setting up default-jre-headless (2:1.11-72) ...
Setting up default-jre (2:1.11-72) ...
Processing triggers for mime-support (3.64ubuntu1) ...
Processing triggers for hicolor-icon-theme (0.17-2) ...
Processing triggers for gnome-menus (3.36.0-1ubuntu1) ...
Processing triggers for desktop-file-utils (0.24-1ubuntu3) ...
```

### 8. Так как eslint правила библиотек с SDK отличаются от правил приложения, добавляем папки с SDK в .eslintignore

Обновленный файла `.eslintignore`

```
node_modules
libs/sdk/app-rest-sdk/src/lib
libs/sdk/app-angular-rest-sdk/src/lib
```

### 9. Так как генераторы создают тайпскрипт конфигурации для тестов, они автоматически попадают в общий index.ts, нам нужно добавить их в исключения генератора index.ts файлов

Обновленный файла `rucken.json`

```json
{
  "makeTsList": {
    "indexFileName": "index",
    "excludes": [
      "test-setup.ts", // <-- updates
      "*node_modules*",
      "*public_api.ts*",
      "*.spec*",
      "environment*",
      "*e2e*",
      "*.stories.ts",
      "*.d.ts"
    ]
  }
}
```

### 10. Запускаем все генераторы

_Команды_

```bash
npm run generate
```

<spoiler title="Вывод консоли">

```bash
$ npm run generate

> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (14s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (14s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint (1s)
   ✔  nx run server:lint (1s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (1s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 2 out of 4 tasks.


 NX   Nx detected  flaky tasks

  client:lint
  app-angular-rest-sdk:lint
  server-e2e:lint

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
```

</spoiler>

### 11. Прописываем созданные DTO для методов в контроллере AppController и создаем все недостающие DTO

Обновленный файла `apps/server/src/app/app.controller.ts`

```typescript
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { ApiCreatedResponse, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
import { AppDemo } from './generated/rest/dto/app_demo';

export class AppData {
  // <- updates
  @ApiProperty({ type: String })
  message: string;
}

@Controller()
export class AppController {
  constructor(
    @InjectPrismaClient()
    private readonly appPrismaClient: AppPrismaClient,
    private readonly appService: AppService
  ) {}

  @Get()
  @ApiResponse({ type: AppData }) // <- updates
  getData() {
    return this.appService.getData();
  }

  @Post('/demo')
  @ApiCreatedResponse({ type: AppDemo }) // <- updates
  async demoCreateOne() {
    return await this.appPrismaClient.appDemo.create({ data: { name: 'demo name' + randomUUID() } });
  }

  @Get('/demo/:id')
  @ApiResponse({ type: AppDemo }) // <- updates
  async demoFindOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.findFirstOrThrow({ where: { id } });
  }

  @Delete('/demo/:id')
  @ApiResponse({ type: AppDemo }) // <- updates
  async demoDeleteOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.delete({ where: { id } });
  }

  @Get('/demo')
  @ApiResponse({ type: AppDemo, isArray: true }) // <- updates
  async demoFindMany() {
    return await this.appPrismaClient.appDemo.findMany();
  }
}
```

### 12. Подключаем модуль SDK для работы с бэкендом в Angular приложение

Обновленный файла `apps/client/src/app/app.config.ts`

```typescript
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RestClientApiModule, RestClientConfiguration } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    importProvidersFrom(
      RestClientApiModule.forRoot(
        () =>
          new RestClientConfiguration({
            basePath: 'http://localhost:3000',
          })
      )
    ),
  ],
};
```

### 13. Меняем HttpClient на DefaultRestService в компоненте Angular приложения которая работает с бэкендом

Обновленный файла `apps/client/src/app/app.component.ts`

```typescript
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DefaultRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  title = 'client';
  serverMessage!: string;

  constructor(private readonly defaultRestService: DefaultRestService) {}

  ngOnInit() {
    this.defaultRestService.appControllerGetData().subscribe((result) => (this.serverMessage = result.message));
  }
}
```

### 14. Подключаем SDK для работы с бэкендом в юнит-тесты Angular приложения

Обновленный файла `apps/client/src/app/app.component.spec.ts`

```typescript
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RestClientApiModule, RestClientConfiguration } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NxWelcomeComponent,
        RouterModule.forRoot([]),
        HttpClientModule, // <- updates
        RestClientApiModule.forRoot(
          // <- updates
          () =>
            new RestClientConfiguration({
              basePath: 'http://localhost:3000',
            })
        ),
      ],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome client');
  });

  it(`should have as title 'client'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('client');
  });
});
```

### 15. Подключаем SDK для работы с бэкендом в E2E-тесты NestJS приложение

Обновленный файла `apps/server-e2e/src/server/server.spec.ts`

```typescript
import { Configuration, DefaultApi } from '@nestjs-mod-fullstack/app-rest-sdk';

describe('GET /api', () => {
  const defaultApi = new DefaultApi(new Configuration({ basePath: '/api' }));
  let newDemoObject: { id: string };

  it('should return a message', async () => {
    const res = await defaultApi.appControllerGetData();

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });

  it('should create and return a demo object', async () => {
    const res = await defaultApi.appControllerDemoCreateOne();

    expect(res.status).toBe(201);
    expect(res.data.name).toContain('demo name');

    newDemoObject = res.data;
  });

  it('should get demo object by id', async () => {
    const res = await defaultApi.appControllerDemoFindOne(newDemoObject.id);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(newDemoObject);
  });

  it('should get all demo object', async () => {
    const res = await defaultApi.appControllerDemoFindMany();

    expect(res.status).toBe(200);
    expect(res.data.filter((row) => row.id === newDemoObject.id)).toMatchObject([newDemoObject]);
  });

  it('should delete demo object by id', async () => {
    const res = await defaultApi.appControllerDemoDeleteOne(newDemoObject.id);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(newDemoObject);
  });

  it('should get all demo object', async () => {
    const res = await defaultApi.appControllerDemoFindMany();

    expect(res.status).toBe(200);
    expect(res.data.filter((row) => row.id === newDemoObject.id)).toMatchObject([]);
  });
});
```

### 16. Запускаем юнит-тесты для NestJS и Angular приложений

_Команды_

```bash
npm run test
```

<spoiler title="Вывод консоли">

```bash
$ npm run test

> @nestjs-mod-fullstack/source@0.0.0 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run app-angular-rest-sdk:test --passWithNoTests


> nx run app-rest-sdk:test --passWithNoTests


> nx run client:test --passWithNoTests

 NX   Running target test for 4 projects

   ✔  nx run app-angular-rest-sdk:test (2s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

   ✔  nx run app-rest-sdk:test (2s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

      With additional flags:
        --passWithNoTests=true

   →  Executing 2/2 remaining tasks in parallel...
   ✔  nx run client:test (5s)


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

      With additional flags:
   ✔  nx run server:test (5s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for 4 projects (7s)

      With additional flags:
        --passWithNoTests=true
```

</spoiler>

### 17. Запускаем E2E-тесты для NestJS и Angular приложений

_Команды_

```bash
./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes


> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...

   ⠴  nx run client-e2e:e2e
   ✔  nx run client-e2e:e2e (7s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
   ✔  nx run server:build:production (3s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/1 remaining tasks...

   ⠦  nx run server-e2e:e2e

   ✔  2/2 succeeded [0 read from cache]

 PASS   server-e2e  apps/server-e2e/src/server/server.spec.ts
  GET /api
    ✓ should return a message (27 ms)
   ✔  nx run server-e2e:e2e (2s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (12s)


 NX   Nx detected a flaky task

  server-e2e:e2e

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
```

</spoiler>

Картинок в посте нет, проверка работы приложений происходит через тесты, Swagger документация доступна по адресу: http://localhost:3000/swagger.

В следующем посте я соберу приложения на NestJS и Angular и запущу их в двух вариантах: через PM2 и через Docker Compose...

### Ссылки

https://nestjs.com - официальный сайт фреймворка
https://nestjs-mod.com - официальный сайт дополнительных утилит
https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/0353b23b1b65d1ff8e6e5f6185e235bbe05cf523 - коммит на текущие изменения

#nestjs #angular #nestjsmod #fullstack
