## [2024-08-11] Добавление базы данных Postgres в проект и запуск миграций через Flyway для NestJS-mod приложения.

База данных будет подниматься через Docker Compose.

Миграции пишутся вручную и запускаются через Flyway мигратор.

Приложение имеет свой логин и пароль, который отличается от рутового.

Конфигурации для Docker Compose и Flyway генерируются через запуск NestJS-mod в режиме инфраструктуры.

### 1. Устанавливаем пакет для генерации Docker Compose и Flyway файлов

_Команды_

```bash
# Install all need dependencies
npm i --save @nestjs-mod/docker-compose @nestjs-mod/flyway

# Install all need dev-dependencies
npm i --save-dev node-flywaydb@3.0.7
```

_Вывод консоли_

```bash
$ npm i --save @nestjs-mod/docker-compose @nestjs-mod/flyway

added 41 packages, and audited 2484 packages in 23s

299 packages are looking for funding
  run `npm fund` for details

14 vulnerabilities (4 moderate, 10 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

$ npm i --save-dev node-flywaydb@3.0.7

added 15 packages, and audited 2499 packages in 6s

300 packages are looking for funding
  run `npm fund` for details

16 vulnerabilities (6 moderate, 10 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

### 2. Добавляем инфраструктурные модули в серверный код

Они будут использованны для генерации дополнительных файлов и скриптов.

Обновленный файл `apps/server/src/main.ts`

```ts
import { DefaultNestApplicationInitializer, DefaultNestApplicationListener, InfrastructureMarkdownReportGenerator, PACKAGE_JSON_FILE, ProjectUtils, bootstrapNestApplication, isInfrastructureMode } from '@nestjs-mod/common';
import { DOCKER_COMPOSE_FILE, DockerCompose, DockerComposePostgreSQL } from '@nestjs-mod/docker-compose'; // <--
import { FLYWAY_JS_CONFIG_FILE, Flyway } from '@nestjs-mod/flyway'; // <--
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { join } from 'path';
import { AppModule } from './app/app.module';

const appFeatureName = 'app'; // <--
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
        // <--
        configuration: {
          dockerComposeFileVersion: '3',
          dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
        },
      }),
      DockerComposePostgreSQL.forRoot(), // <--
      DockerComposePostgreSQL.forFeature({
        // <--
        featureModuleName: appFeatureName,
      }),
      Flyway.forRoot({
        // <--
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

### 3. Создаем документацию по проекту и параллельно создаем дополнительный код и скрипты для Docker Compose и Flyway

_Команды_

```bash
# Build all applications and library
npm run build

# Generate markdown report
npm run docs:infrastructure
```

_Вывод консоли_

```bash
$ npm run build

> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix

 NX   Successfully ran target generate for 0 projects (29ms)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint (1s)
   ✔  nx run client:lint (1s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 3 projects (1s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 1 out of 3 tasks.


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server:build:production (3s)
   ✔  nx run client:build:production (15s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for 2 projects (15s)

 $ npm run docs:infrastructure

> @nestjs-mod-fullstack/source@0.0.0 docs:infrastructure
> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start --parallel=1


 NX   Running target start for project server:

- server

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run server:start

> node dist/apps/server/main.js

[22:07:23.987] INFO (491733): Starting Nest application...
    context: "NestFactory"
[22:07:23.987] INFO (491733): DefaultNestApp dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): DefaultNestApplicationInitializerSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): DefaultNestApplicationInitializerShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): NestjsPinoLoggerModuleSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): NestjsPinoLoggerModuleShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): TerminusHealthCheckModuleSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.987] INFO (491733): AppModuleSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): AppModuleShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): Pm2Settings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): Pm2Shared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposeSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerCompose dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): FlywayShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportStorage dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportStorageSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerCompose dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): FlywayShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposeShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportStorageShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): AppModule dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DefaultNestApplicationInitializer dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): Flyway dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): NestjsPinoLoggerModule dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): TerminusModule dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): TerminusModule dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): Pm2 dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerCompose dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): Flyway dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): LoggerModule dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): TerminusHealthCheckModuleShared dependencies initialized
    context: "InstanceLoader"
[22:07:23.988] INFO (491733): TerminusHealthCheckModule dependencies initialized
    context: "InstanceLoader"
[22:07:23.996] INFO (491733): TerminusHealthCheckController {/health}:
    context: "RoutesResolver"
[22:07:23.997] INFO (491733): Mapped {/health, GET} route
    context: "RouterExplorer"
[22:07:23.997] INFO (491733): AppController {/}:
    context: "RoutesResolver"
[22:07:23.997] INFO (491733): Mapped {/, GET} route
    context: "RouterExplorer"
[22:07:24.010] DEBUG (491733):
    0: "SERVER_ROOT_DATABASE_URL: Description='Connection string for PostgreSQL with root credentials (example: postgres://postgres:postgres_password@localhost:5432/postgres?schema=public, username must be \"postgres\")', Original Name='rootDatabaseUrl'"
    1: "SERVER_PORT: Description='The port on which to run the server.', Default='3000', Original Name='port'"
    2: "SERVER_HOSTNAME: Description='Hostname on which to listen for incoming packets.', Original Name='hostname'"
    3: "SERVER_APP_DATABASE_URL: Description='Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)', Original Name='databaseUrl'"
    context: "All application environments"
[22:07:24.027] INFO (491733): Nest application successfully started
    context: "NestApplication"

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target start for project server
```

### 4. Заполняем новые переменные окружения

После запуска серверного приложения в режиме инфраструктуы в файле переменных окружения появятся дополнительные переменные, примеры значений можно посмотреть в отчете по инфраструктуре `apps/server/INFRASTRUCTURE.MD`.

Обновленный файл `.env`

```bash
SERVER_PORT=3000
SERVER_ROOT_DATABASE_URL=postgres://postgres:postgres_password@localhost:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:app_password@localhost:5432/app?schema=public
# server-postgre-sql (generated)
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
```

### 5. Повторно пересоздаем документацию по проекту и параллельно пересоздаем дополнительный код и скрипты для Docker Compose и Flyway

_Команды_

```bash
# Generate markdown report
npm run docs:infrastructure
```

_Вывод консоли_

```bash
$ npm run docs:infrastructure

> @nestjs-mod-fullstack/source@0.0.0 docs:infrastructure
> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start --parallel=1


 NX   Running target start for project server:

- server

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run server:start

> node dist/apps/server/main.js

[22:22:53.712] INFO (493825): Starting Nest application...
    context: "NestFactory"
[22:22:53.712] INFO (493825): DefaultNestApp dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DefaultNestApplicationInitializerSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DefaultNestApplicationInitializerShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): NestjsPinoLoggerModuleSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): NestjsPinoLoggerModuleShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): TerminusHealthCheckModuleSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): AppModuleSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): AppModuleShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): Pm2Settings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): Pm2Shared dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DockerComposeSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DockerCompose dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): FlywayShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): InfrastructureMarkdownReportStorage dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): InfrastructureMarkdownReportStorageSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): DockerCompose dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.712] INFO (493825): FlywayShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DockerComposeShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): InfrastructureMarkdownReportStorageShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): AppModule dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DefaultNestApplicationInitializer dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): Flyway dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): NestjsPinoLoggerModule dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): TerminusModule dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): TerminusModule dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): Pm2 dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DockerCompose dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): Flyway dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): LoggerModule dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): TerminusHealthCheckModuleShared dependencies initialized
    context: "InstanceLoader"
[22:22:53.713] INFO (493825): TerminusHealthCheckModule dependencies initialized
    context: "InstanceLoader"
[22:22:53.720] INFO (493825): TerminusHealthCheckController {/health}:
    context: "RoutesResolver"
[22:22:53.721] INFO (493825): Mapped {/health, GET} route
    context: "RouterExplorer"
[22:22:53.721] INFO (493825): AppController {/}:
    context: "RoutesResolver"
[22:22:53.722] INFO (493825): Mapped {/, GET} route
    context: "RouterExplorer"
[22:22:53.735] DEBUG (493825):
    0: "SERVER_ROOT_DATABASE_URL: Description='Connection string for PostgreSQL with root credentials (example: postgres://postgres:postgres_password@localhost:5432/postgres?schema=public, username must be \"postgres\")', Original Name='rootDatabaseUrl'"
    1: "SERVER_PORT: Description='The port on which to run the server.', Default='3000', Original Name='port'"
    2: "SERVER_HOSTNAME: Description='Hostname on which to listen for incoming packets.', Original Name='hostname'"
    3: "SERVER_APP_DATABASE_URL: Description='Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)', Original Name='databaseUrl'"
    context: "All application environments"
[22:22:53.759] INFO (493825): Nest application successfully started
    context: "NestApplication"

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target start for project server
```

### 6. Копируем обновленный файл с переменными окружения в качестве примера

Так как файл с переменными окружения находтся под gitignore, то при клонировании пустого проекта нужно заново вводить все знаечния для переменных окружения, для быстрого запуска проекта необходимо иметь пример заполненного файл с переменными окружения.

_Команды_

```bash
cp -r ./.env ./example.env
```

### 7. Создаем миграцию с примером создания таблицы

_Команды_

```bash
# Create migrations folder
mkdir -p ./apps/server/src/migrations

# Create empty migration
npm run flyway:create:server
```

_Вывод консоли_

```bash
$ npm run flyway:create:server

> @nestjs-mod-fullstack/source@0.0.0 flyway:create:server
> ./node_modules/.bin/nx run server:flyway-create-migration


> nx run server:flyway-create-migration

> echo 'select 1;' > ./apps/server/src/migrations/V`date +%Y%m%d%H%M`__NewMigration.sql


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-create-migration for project server (42ms)


 NX   Nx detected a flaky task

  server:flyway-create-migration

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
```

### 8. Описываем sql скрипт по созданию демо таблицы

Файл миграции `apps/server/src/migrations/V202408112241__NewMigration.sql`

```sql
CREATE TABLE IF NOT EXISTS "AppDemo"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(128) NOT NULL,
    "createdAt" timestamp DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp DEFAULT "now"() NOT NULL,
    CONSTRAINT "PK_APP_DEMO" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_APP_DEMO" ON "AppDemo"("name");
```

### 9. Запускаем базу данных

_Команды_

```bash
npm run docker-compose:start-prod:server
```

_Вывод консоли_

```bash
$ npm run docker-compose:start-prod:server

> @nestjs-mod-fullstack/source@0.0.0 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

Creating network "server_server-network" with driver "bridge"
Pulling server-postgre-sql (bitnami/postgresql:15.5.0)...
15.5.0: Pulling from bitnami/postgresql
c9b6a72ca844: Pull complete
Digest: sha256:6887635cc793826e1e177d0cee151a878baa6747e37389252e89b034a30f04bc
Status: Downloaded newer image for bitnami/postgresql:15.5.0
Creating server-postgre-sql ... done
```

### 10. Запускаем создание баз данных приложений

_Команды_

```bash
npm run db:create
```

_Вывод консоли_

```bash
$ npm run db:create

> @nestjs-mod-fullstack/source@0.0.0 db:create
> ./node_modules/.bin/nx run-many -t=db-create


   ✔  nx run server:db-create (787ms)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target db-create for project server (819ms)


 NX   Nx detected a flaky task

  server:db-create

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
```

### 11. Применяем миграции

_Команды_

```bash
npm run flyway:migrate
```

_Вывод консоли_

```bash
$ npm run flyway:migrate

> @nestjs-mod-fullstack/source@0.0.0 flyway:migrate
> ./node_modules/.bin/nx run-many -t=flyway-migrate


   ✔  nx run server:flyway-migrate (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-migrate for project server (1s)


 NX   Nx detected a flaky task

  server:flyway-migrate

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
```

### 12. Подключаемся к базе данных и получаем список таблиц

_Команды_

```bash
docker exec -it server-postgre-sql psql postgres://app:app_password@localhost:5432/app
\d
```

_Вывод консоли_

```bash
docker exec -it server-postgre-sql psql postgres://app:app_password@localhost:5432/app
psql (15.5)
Type "help" for help.

app-> \d
 public | AppDemo      | table | app
 public | __migrations | table | app

app->
```

### 13. Останавливаем базу данных

_Команды_

```bash
npm run docker-compose:stop-prod:server
```

_Вывод консоли_

```bash
$ npm run docker-compose:stop-prod:server

> @nestjs-mod-fullstack/source@0.0.0 docker-compose:stop-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down

Stopping server-postgre-sql ... done
Removing server-postgre-sql ... done
```

В следующем посте я добавлю в сервер работу с базой данных через PrismaORM...

### Ссылки

https://nestjs.com - официальный сайт фреймворка
https://nestjs-mod.com - официальный сайт дополнительных утилит
https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста

#postgres #flyway #nestjsmod #fullstack
