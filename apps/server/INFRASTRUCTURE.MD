# server
> Version: 1.2.1

## Running the app in watch mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

# running server source code in watch mode
npm run serve:dev:server
```
## Running the app in production mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

npm run start:prod:server
```
## Test
```bash
# running tests for server
npm run test:server
```
## All scripts
|Script|Description|
|---|---|
|**pm2-full dev infra**|
|`npm run pm2-full:dev:start`|Launching infrastructure and all applications in watch mode via PM2|
|`npm run pm2-full:dev:stop`|Stopping infrastructure and all applications in watch mode via PM2|
|`npm run pm2-full:dev:test:e2e`|Running E2E tests for all applications in PM2 dev mode|
|**dev infra**|
|`npm run serve:dev`|Running NestJS application source code in watch mode|
|`npm run serve:dev:server`|Running server source code in watch mode|
|`npm run serve:dev:client`||
|**pm2 dev infra**|
|`npm run pm2:dev:start`|Launching all applications in watch mode via PM2|
|`npm run pm2:dev:stop`|Stopping all applications in watch mode via PM2|
|**pm2-full prod infra**|
|`npm run pm2-full:prod:start`|Launching the infrastructure and building all applications, followed by launching them via PM2|
|`npm run pm2-full:prod:stop`|Stopping infrastructure and all applications running through PM2|
|`npm run pm2-full:prod:test:e2e`|Running E2E tests for all applications in PM2 prod mode|
|**prod infra**|
|`npm run start`|Launching a built NestJS application (you must first build it using the build command)|
|`npm run build`|Building a NestJS application|
|`npm run build:prod`|Building a NestJS application in prod mode|
|**pm2 prod infra**|
|`npm run pm2:start`|Launch all applications in PM2 mode|
|`npm run pm2:stop`|Stop all applications in PM2 mode|
|**docker-compose-full prod infra**|
|`npm run docker-compose-full:prod:build`|Building Docker images|
|`npm run docker-compose-full:prod:start`|Build and launching Docker Compose infrastructure with a backend in the form of a Docker container and frontend statics transmitted via Nginx|
|`npm run docker-compose-full:prod:stop`|Stopping Docker Compose infrastructure and all applications|
|`npm run docker-compose-full:prod:only-start`|Launching Docker Compose infrastructure with a backend in the form of a Docker container and frontend statics transmitted via Nginx|
|`npm run docker-compose-full:prod:test:e2e`|Launching E2E tests on an application launched via Docker Compose|
|**docs**|
|`npm run docs:infrastructure`|Creation of documentation for the entire infrastructure and creation of files necessary to launch the infrastructure|
|**docker-compose infra**|
|`npm run docker-compose:start:server`|Running the docker-compose infrastructure for server|
|`npm run docker-compose:stop:server`|Stopping the docker-compose infrastructure for server|
|**docker-compose prod-infra**|
|`npm run docker-compose:start-prod:server`|Running the main docker-compose prod infrastructure for server|
|`npm run docker-compose:stop-prod:server`|Stopping the main docker-compose prod infrastructure for server|
|**tests**|
|`npm run test`|Running tests across the entire project|
|`npm run test:e2e`|Running E2E tests for all applications|
|`npm run test:server`|Running tests for server|
|**lint**|
|`npm run lint`|Checking the typescript code for the entire project|
|`npm run lint:fix`|Checking the typescript code throughout the project and trying to fix everything possible|
|`npm run tsc:lint`|Checking typescript code in libraries|
|**kubernetes**|
|`npm run kubernetes:generate`||
|**db**|
|`npm run db:create`|Creation all databases of applications and modules|
|`npm run db:create-and-fill`|Create and fill databases|
|**flyway**|
|`npm run flyway:create:server`|Command to create new empty migration for server|
|`npm run flyway:migrate:server`|Applying migrations for server|
|`npm run flyway:migrate`|Applying migrations of all applications and modules|
|`npm run flyway:create:webhook`|Command to create new empty migration for webhook|
|`npm run flyway:migrate:webhook`|Applying migrations for webhook|
|**prisma**|
|`npm run prisma:pull:server`|Generating a prisma schema based on a database for server|
|`npm run prisma:pull`|Generating a prisma schema based on a database|
|`npm run prisma:generate`|Generation of client prisma schema of all applications and modules|
|`npm run prisma:pull:webhook`|Generating a prisma schema based on a database for webhook|
|**utils**|
|`npm run generate`|Running the "generate" nx command in applications and libraries which can be customized at your discretion automatically generating an index.ts file for each library checking the code and trying to fix it|
|`npm run tsc`|Alias for running the tsc version locally, which is in the project (example: `npm run tsc -- --noEmit -p tsconfig.base.json`), in order not to install tsc globally in the operating system|
|`npm run nx`|Alias for running the nx version locally, which is in the project (example: `./node_modules/.bin/nx dep-graph`), in order not to install nx globally in the operating system|
|`npm run dep-graph`|Generating dependency diagrams for nx applications and libraries|
|`npm run make-ts-list`|Automatically generating an index.ts file for each library, works only for nx applications created using the `--projectNameAndRootFormat=as-provided` flag|
|`npm run manual:prepare`|Preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)|
|`npm run update:nestjs-mod-versions`|Updating NestJS-mod libraries|
|`npm run rucken`|Alias for console tools and scripts for nx and not only use to automate the workflow and speed up the development process (example: `npm run rucken -- make-ts-list`, site: https://www.npmjs.com/package/rucken)|
|`npm run wait-on`|Utility for checking and waiting for site availability|
|`npm run prepare`||
## System modules
System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration(default)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`applicationPackageJsonFile`|Application package.json-file|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/package.json```|
|`packageJsonFile`|Root package.json-file|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/package.json```|
|`nxProjectJsonFile`|Application project.json-file (nx)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/project.json```|
|`envFile`|Dot-env file with environment variables|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/.env```|

### DefaultNestApplicationInitializer
Default NestJS application initializer.

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`bufferLogs`|If enabled, logs will be buffered until the "Logger#flush" method is called. @default false|**optional**|-|```true```|

### NestjsPinoLoggerModule
Pino logger for NestJS-mod (Wrapper for https://www.npmjs.com/package/nestjs-pino)

### TerminusHealthCheckModule
Terminus integration provides readiness/liveness health checks for NestJS-mod (Wrapper for https://www.npmjs.com/package/@nestjs/terminus)

#### Shared providers
`TerminusHealthCheckService`

#### Shared imports
`TerminusModule`

#### Configuration
Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`standardHealthIndicators`|Standard health indicators @see https://docs.nestjs.com/recipes/terminus#setting-up-a-healthcheck|**optional**|-|[ ```{"name":"memory_heap"}``` ]|

## Core modules
Core modules necessary for the operation of feature and integration modules (examples: main module with connection to the database, main module for connecting to aws, etc.). NestJS and NestJS-mod compatible modules.

### PrismaToolsModule
#### Shared providers
`PrismaToolsService`

#### Environments
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`useFilters`|Use filters.|`obj['useFilters']`, `process.env['SERVER_USE_FILTERS']`|**optional**|```true```|```true```|
|`paginationInitialPage`|Pagination initial page.|`obj['paginationInitialPage']`, `process.env['SERVER_PAGINATION_INITIAL_PAGE']`|**optional**|```1```|```1```|
|`paginationPerPageSteps`|Pagination per page steps.|`obj['paginationPerPageSteps']`, `process.env['SERVER_PAGINATION_PER_PAGE_STEPS']`|**optional**|-|-|
|`paginationPerPage`|Pagination per page.|`obj['paginationPerPage']`, `process.env['SERVER_PAGINATION_PER_PAGE']`|**optional**|```5```|```5```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for database with credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`prismaModule`|NodeJS module with Prisma modules|**isNotEmpty** (prismaModule should not be empty)|-|**hidden**|
|`featureName`|Prisma feature name for generate prefix to environments keys (infrastructure)|**optional**|-|```webhook```|
|`schemaFile`|Schema file for prisma (infrastructure)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|The option specifies whether it is necessary to create scripts to work with database migrations, for those who use third-party applications to create and apply migrations in the database (infrastructure, example: https://flywaydb.org, https://www.npmjs.com/package/db-migrate)|**optional**|```true```|```false```|
|`nxProjectJsonFile`|Application or library project.json-file (nx)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/project.json```|

#### Environments(app)
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for database with credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration(app)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`prismaModule`|NodeJS module with Prisma modules|**isNotEmpty** (prismaModule should not be empty)|-|**hidden**|
|`featureName`|Prisma feature name for generate prefix to environments keys (infrastructure)|**optional**|-|```app```|
|`schemaFile`|Schema file for prisma (infrastructure)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|The option specifies whether it is necessary to create scripts to work with database migrations, for those who use third-party applications to create and apply migrations in the database (infrastructure, example: https://flywaydb.org, https://www.npmjs.com/package/db-migrate)|**optional**|```true```|```false```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for database with credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`prismaModule`|NodeJS module with Prisma modules|**isNotEmpty** (prismaModule should not be empty)|-|**hidden**|
|`featureName`|Prisma feature name for generate prefix to environments keys (infrastructure)|**optional**|-|```webhook```|
|`schemaFile`|Schema file for prisma (infrastructure)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|The option specifies whether it is necessary to create scripts to work with database migrations, for those who use third-party applications to create and apply migrations in the database (infrastructure, example: https://flywaydb.org, https://www.npmjs.com/package/db-migrate)|**optional**|```true```|```false```|
|`nxProjectJsonFile`|Application or library project.json-file (nx)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/project.json```|

#### Environments(app)
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for database with credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration(app)
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`prismaModule`|NodeJS module with Prisma modules|**isNotEmpty** (prismaModule should not be empty)|-|**hidden**|
|`featureName`|Prisma feature name for generate prefix to environments keys (infrastructure)|**optional**|-|```app```|
|`schemaFile`|Schema file for prisma (infrastructure)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|The option specifies whether it is necessary to create scripts to work with database migrations, for those who use third-party applications to create and apply migrations in the database (infrastructure, example: https://flywaydb.org, https://www.npmjs.com/package/db-migrate)|**optional**|```true```|```false```|

## Feature modules
Feature modules with business logic of the application. NestJS and NestJS-mod compatible modules.

### AppModule
### WebhookModule
#### Shared providers
`WebhookService`

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`useGuards`|Use guards.|`obj['useGuards']`, `process.env['SERVER_WEBHOOK_USE_GUARDS']`|**optional**|```true```|```true```|
|`useFilters`|Use filters.|`obj['useFilters']`, `process.env['SERVER_WEBHOOK_USE_FILTERS']`|**optional**|```true```|```true```|
|`autoCreateUser`|Auto create user from guard.|`obj['autoCreateUser']`, `process.env['SERVER_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|```true```|
|`checkHeaders`|Search tenantId and userId in headers.|`obj['checkHeaders']`, `process.env['SERVER_WEBHOOK_CHECK_HEADERS']`|**optional**|```true```|```true```|
|`skipGuardErrors`|Skip any guard errors.|`obj['skipGuardErrors']`, `process.env['SERVER_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|```false```|
|`superAdminExternalUserId`|User ID with super admin role.|`obj['superAdminExternalUserId']`, `process.env['SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID']`|**optional**|-|```248ec37f-628d-43f0-8de2-f58da037dd0f```|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`events`|List of available events.|**optional**|-|[ ```{"eventName":"app-demo.create","description":"create","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.update","description":"update","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.delete","description":"delete","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}``` ]|

## Integration modules
Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module). NestJS and NestJS-mod compatible modules.

### DefaultNestApplicationListener
Default NestJS application listener.

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`port`|The port on which to run the server.|`obj['port']`, `process.env['SERVER_PORT']`|**optional**|```3000```|```3000```|
|`hostname`|Hostname on which to listen for incoming packets.|`obj['hostname']`, `process.env['SERVER_HOSTNAME']`|**optional**|-|-|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`mode`|Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application|**optional**|```listen```|```silent```|
|`preListen`|Method for additional actions before listening|**optional**|-|```preListen```|

## Infrastructure modules
Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.

### Pm2
Production process manager for Node.JS applications with a built-in load balancer for NestJS-mod (Generator ecosystem.config.json for https://www.npmjs.com/package/pm2)

#### Configuration
Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`ecosystemConfigFile`|Configuration file for PM2|**isNotEmpty** (ecosystemConfigFile should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/ecosystem.config.json```|
|`applicationScriptFile`|Application script file name for run|**isNotEmpty** (applicationScriptFile should not be empty)|-|```dist/apps/server/main.js```|

### DockerCompose
Docker Compose is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. (Generator docker-compose.yml for https://docs.docker.com/compose)

#### Shared providers
`ManualDockerComposeFeatures`

#### Configuration
Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`dockerComposeFile`|Main file for docker-compose, the Compose specification establishes a standard for the definition of multi-container platform-agnostic applications.|**isNotEmpty** (dockerComposeFile should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/docker-compose.yml```|

#### Modules that use feature configuration
##### Feature module name: SERVER_POSTGRE_SQL


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`services`|A service is an abstract definition of a computing resource within an application which can be scaled or replaced independently from other components. @see https://github.com/compose-spec/compose-spec/blob/master/05-services.md|**optional**|-|```{"server-postgre-sql":{"image":"bitnami/postgresql:15.5.0","container_name":"server-postgre-sql","volumes":["server-postgre-sql-volume:/bitnami/postgresql"],"ports":["5432:5432"],"networks":["server-network"],"healthcheck":{"test":["CMD-SHELL","pg_isready -U postgres"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|Networks are the layer that allow services to communicate with each other. @see https://github.com/compose-spec/compose-spec/blob/master/06-networks.md|**optional**|-|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|Volumes are persistent data stores implemented by the container engine. @see https://github.com/compose-spec/compose-spec/blob/master/07-volumes.md|**optional**|-|```{"server-postgre-sql-volume":{"name":"server-postgre-sql-volume"}}```|

### Flyway
Flyway - utility for working with database migrations (official site: https://flywaydb.org, preview version only for Postgres)

#### Environments
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for database with credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`featureName`|Flyway feature name for generate prefix to environments keys|**optional**|-|```app```|
|`migrationsFolder`|Folder with migrations|**isNotEmpty** (migrationsFolder should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/migrations```|
|`configFile`|Javascript config file for flyway (.flyway.js)|**isNotEmpty** (configFile should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/.flyway.js```|

### Flyway
Flyway - utility for working with database migrations (official site: https://flywaydb.org, preview version only for Postgres)

#### Environments
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for database with credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`featureName`|Flyway feature name for generate prefix to environments keys|**optional**|-|```app```|
|`migrationsFolder`|Folder with migrations|**isNotEmpty** (migrationsFolder should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/migrations```|
|`configFile`|Javascript config file for flyway (.flyway.js)|**isNotEmpty** (configFile should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/.flyway.js```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`markdownFile`|Name of the markdown-file in which to save the infrastructure report|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|Skip empty values of env and config models|**optional**|-|```true```|

### DockerComposePostgreSQL
PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures. (Generator for databases in docker-compose.yml for https://github.com/nestjs-mod/nestjs-mod-contrib/tree/master/libs/infrastructure/docker-compose)

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`rootDatabaseUrl`|Connection string for PostgreSQL with root credentials (example: postgres://postgres:postgres_password@localhost:5432/postgres?schema=public, username must be "postgres")|`obj['rootDatabaseUrl']`, `process.env['SERVER_ROOT_DATABASE_URL']`|**isNotEmpty** (rootDatabaseUrl should not be empty)|-|```postgres://postgres:postgres_password@localhost:5432/postgres?schema=public```|

#### Feature environments
Feature variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_FEATURE_MODULE_NAME_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|-|

#### Modules that use feature configuration
##### Feature module name: webhook


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`nxProjectJsonFile`|Application or library project.json-file (nx)|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/project.json```|

#### Modules that use feature environments
##### Feature module name: app


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Modules that use feature environments
##### Feature module name: webhook


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|


## License
[MIT](LICENSE)