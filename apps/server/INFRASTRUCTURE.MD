# server
> Version: 1.3.0

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

### AuthorizerModule
Universal javaScript SDK for Authorizer API

#### Shared providers
`AuthorizerService`

#### Environments
Variables with primitive types used in the module, the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`clientId`|Client ID|`obj['clientId']`, `process.env['SERVER_AUTHORIZER_CLIENT_ID']`|**optional**|-|-|
|`authorizerURL`|Authorizer URL|`obj['authorizerURL']`, `process.env['SERVER_AUTHORIZER_AUTHORIZER_URL']`|**isNotEmpty** (authorizerURL should not be empty)|-|```http://localhost:8080```|
|`redirectURL`|Redirect URL|`obj['redirectURL']`, `process.env['SERVER_AUTHORIZER_REDIRECT_URL']`|**isNotEmpty** (redirectURL should not be empty)|-|```http://localhost:4200```|
|`adminSecret`|Admin secret|`obj['adminSecret']`, `process.env['SERVER_AUTHORIZER_ADMIN_SECRET']`|**optional**|-|```VfKSfPPljhHBXCEohnitursmgDxfAyiD```|
|`allowedExternalAppIds`|Allowed identifiers of external applications, if you have logged in previously and do not need to log in again in the authorization service, these identifiers must be private and can be used for testing.|`obj['allowedExternalAppIds']`, `process.env['SERVER_AUTHORIZER_ALLOWED_EXTERNAL_APP_IDS']`|**optional**|-|-|

#### Configuration
Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`extraHeaders`|Extra headers|**optional**|-|```{"x-authorizer-url":"http://localhost:8080"}```|
|`checkAccessValidator`|External function for validate permissions|**optional**|```defaultAuthorizerCheckAccessValidator```|```checkAccessValidator```|

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
### AuthModule
#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`adminEmail`|Global admin username|`obj['adminEmail']`, `process.env['SERVER_AUTH_ADMIN_EMAIL']`|**optional**|```admin@example.com```|```nestjs-mod-fullstack@site15.ru```|
|`adminUsername`|Global admin username|`obj['adminUsername']`, `process.env['SERVER_AUTH_ADMIN_USERNAME']`|**isNotEmpty** (adminUsername should not be empty)|```admin```|```admin```|
|`adminPassword`|Global admin password|`obj['adminPassword']`, `process.env['SERVER_AUTH_ADMIN_PASSWORD']`|**optional**|-|```SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA```|

### WebhookModule
#### Shared providers
`WebhookService`, `WebhookUsersService`

#### Shared imports
`PrismaModule`

#### Configuration
Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`events`|List of available events.|**optional**|-|[ ```{"eventName":"app-demo.create","description":"create","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.update","description":"update","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.delete","description":"delete","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}``` ]|

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`useGuards`|Use guards.|`obj['useGuards']`, `process.env['SERVER_WEBHOOK_USE_GUARDS']`|**optional**|```true```|```true```|
|`useFilters`|Use filters.|`obj['useFilters']`, `process.env['SERVER_WEBHOOK_USE_FILTERS']`|**optional**|```true```|```true```|
|`autoCreateUser`|Auto create user from guard.|`obj['autoCreateUser']`, `process.env['SERVER_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|```true```|
|`checkHeaders`|Search tenantId and userId in headers.|`obj['checkHeaders']`, `process.env['SERVER_WEBHOOK_CHECK_HEADERS']`|**optional**|```true```|```false```|
|`skipGuardErrors`|Skip any guard errors.|`obj['skipGuardErrors']`, `process.env['SERVER_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|```false```|
|`superAdminExternalUserId`|User ID with super admin role.|`obj['superAdminExternalUserId']`, `process.env['SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID']`|**optional**|-|```248ec37f-628d-43f0-8de2-f58da037dd0f```|

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

#### Modules that use feature configuration
##### Feature module name: SERVER_AUTHORIZER


| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`services`|A service is an abstract definition of a computing resource within an application which can be scaled or replaced independently from other components. @see https://github.com/compose-spec/compose-spec/blob/master/05-services.md|**optional**|-|```{"server-authorizer":{"image":"lakhansamani/authorizer:1.4.4","container_name":"server-authorizer","ports":["8080:8080"],"networks":["server-network"],"environment":{"ADMIN_SECRET":"VfKSfPPljhHBXCEohnitursmgDxfAyiD","DATABASE_TYPE":"postgres","DATABASE_URL":"postgres://Yk42KA4sOb:B7Ep2MwlRR6fAx0frXGWVTGP850qAxM6@localhost:5432/authorizer","DATABASE_NAME":"authorizer","PORT":8080,"AUTHORIZER_URL":"http://localhost:8080","COOKIE_NAME":"authorizer","DISABLE_PLAYGROUND":true,"ACCESS_TOKEN_EXPIRY_TIME":"30m","IMAGE":"lakhansamani/authorizer:1.4.4","DISABLE_STRONG_PASSWORD":"true","DISABLE_EMAIL_VERIFICATION":"true","FEATURE_NAME":"authorizer","ORGANIZATION_NAME":"NestJSModFullstack","DEPENDS_ON_SERVICE_NAMES":{"postgre-sql":"service_healthy"},"IS_EMAIL_SERVICE_ENABLED":"true","IS_SMS_SERVICE_ENABLED":"false","ENV":"development","EXTERNAL_CLIENT_PORT":8080,"RESET_PASSWORD_URL":"/reset-password","ROLES":"user,admin","DEFAULT_ROLES":"user","JWT_ROLE_CLAIM":"role","ORGANIZATION_LOGO":"Authorizer Logo","COUCHBASE_BUCKET":"authorizer","COUCHBASE_BUCKET_RAM_QUOTA":1000,"COUCHBASE_SCOPE":"_default"},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","dependsOnServiceNames","env"],"tty":true,"restart":"always","depends_on":{"server-postgre-sql":{"condition":"service_healthy"}}}}```|
|`networks`|Networks are the layer that allow services to communicate with each other. @see https://github.com/compose-spec/compose-spec/blob/master/06-networks.md|**optional**|-|```{"server-network":{"driver":"bridge"}}```|

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
##### Feature module name: authorizer


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_AUTHORIZER_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://Yk42KA4sOb:B7Ep2MwlRR6fAx0frXGWVTGP850qAxM6@localhost:5432/authorizer```|

#### Modules that use feature environments
##### Feature module name: webhook


| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`databaseUrl`|Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

### DockerComposeAuthorizer
Authorizer is an open-source authentication and authorization solution for your applications. Bring your database and have complete control over the user information. You can self-host authorizer instances and connect to supported databases. (Generator for https://authorizer.dev in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`adminSecret`|Super admin secret used to access the master data.|`obj['adminSecret']`, `process.env['SERVER_AUTHORIZER_ADMIN_SECRET']`|**isNotEmpty** (adminSecret should not be empty)|-|```VfKSfPPljhHBXCEohnitursmgDxfAyiD```|
|`databaseType`|Which database you are using. Supported database types are postgres, mysql, planetscale, sqlite, sqlserver, mongodb, arangodb, yugabyte, mariadb, cassandradb, scylladb, couchbase, dynamodb.|`obj['databaseType']`, `process.env['SERVER_AUTHORIZER_DATABASE_TYPE']`|**isNotEmpty** (databaseType should not be empty)|-|```postgres```|
|`databaseUrl`|Database connection string. In case of cluster url eg. for cassandra db, you can use comma separated IPs.|`obj['databaseUrl']`, `process.env['SERVER_AUTHORIZER_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|```postgres://Yk42KA4sOb:B7Ep2MwlRR6fAx0frXGWVTGP850qAxM6@localhost:5432/authorizer```|
|`databaseName`|Name of database to connect to. This is useful in case of arangodb and mongodb. If not set, default value will be used.|`obj['databaseName']`, `process.env['SERVER_AUTHORIZER_DATABASE_NAME']`|**optional**|```authorizer```|```authorizer```|
|`redisUrl`|Redis URL where sessions can be persisted	false	sessions will be stored in memory.|`obj['redisUrl']`, `process.env['SERVER_AUTHORIZER_REDIS_URL']`|**optional**|-|-|
|`databasePort`|Port on which database connection should be made. This is used when DATABASE_URL is not mentioned. At the moment supported by cassandradb.|`obj['databasePort']`, `process.env['SERVER_AUTHORIZER_DATABASE_PORT']`|**optional**|-|-|
|`databaseHost`|Host/IP on which database connection should be made. This is used when DATABASE_URL is not mentioned. At the moment supported by cassandradb type.|`obj['databaseHost']`, `process.env['SERVER_AUTHORIZER_DATABASE_HOST']`|**optional**|-|-|
|`databaseUsername`|Username for the database access with permission to create tables and records. At the moment supported by cassandradb, scylladb type.|`obj['databaseUsername']`, `process.env['SERVER_AUTHORIZER_DATABASE_USERNAME']`|**optional**|-|-|
|`databasePassword`|Password for the database access with permission to create tables and records. At the moment supported by cassandradb, scylladb type.|`obj['databasePassword']`, `process.env['SERVER_AUTHORIZER_DATABASE_PASSWORD']`|**optional**|-|-|
|`databaseCert`|Base64 encoded certificate string used to make SSL connection. At the moment supported by cassandradb,scylladb type.|`obj['databaseCert']`, `process.env['SERVER_AUTHORIZER_DATABASE_CERT']`|**optional**|-|-|
|`databaseCertKey`|Base64 encoded key string used to make SSL connection. At the moment supported by cassandradb,scylladb type|`obj['databaseCertKey']`, `process.env['SERVER_AUTHORIZER_DATABASE_CERT_KEY']`|**optional**|-|-|
|`databaseCaCert`|Base64 encoded CA certificate string used to make SSL connection. At the moment supported by cassandradb, scylladb type.|`obj['databaseCaCert']`, `process.env['SERVER_AUTHORIZER_DATABASE_CA_CERT']`|**optional**|-|-|
|`port`|Port on which server should be running.|`obj['port']`, `process.env['SERVER_AUTHORIZER_PORT']`|**optional**|```8080```|```8080```|
|`authorizerUrl`|Domain name of the server, eg https://authorizer.herokuapp.com.|`obj['authorizerUrl']`, `process.env['SERVER_AUTHORIZER_AUTHORIZER_URL']`|**optional**|-|```http://localhost:8080```|
|`cookieName`|Name of cookie to be set by server.|`obj['cookieName']`, `process.env['SERVER_AUTHORIZER_COOKIE_NAME']`|**optional**|```authorizer```|```authorizer```|
|`smtpHost`|SMTP host is used to send email verification emails and forgot password emails	false	If not set email sending can fail.|`obj['smtpHost']`, `process.env['SERVER_AUTHORIZER_SMTP_HOST']`|**optional**|-|-|
|`smtpPort`|SMTP Port is used along with SMTP host.|`obj['smtpPort']`, `process.env['SERVER_AUTHORIZER_SMTP_PORT']`|**optional**|-|-|
|`smtpUsername`|Username for your smtp provider.|`obj['smtpUsername']`, `process.env['SERVER_AUTHORIZER_SMTP_USERNAME']`|**optional**|-|-|
|`smtpPassword`|Password for your smt provider|`obj['smtpPassword']`, `process.env['SERVER_AUTHORIZER_SMTP_PASSWORD']`|**optional**|-|-|
|`senderEmail`|Email to be used in From section while sending emails.|`obj['senderEmail']`, `process.env['SERVER_AUTHORIZER_SENDER_EMAIL']`|**optional**|-|-|
|`senderName`|Email sender name that is displayed in the inbox instead of just showing the email address.|`obj['senderName']`, `process.env['SERVER_AUTHORIZER_SENDER_NAME']`|**optional**|-|-|
|`disablePlayground`|To disable playground|`obj['disablePlayground']`, `process.env['SERVER_AUTHORIZER_DISABLE_PLAYGROUND']`|**optional**|```true```|```true```|
|`accessTokenExpiryTime`|Time interval for how long access token will be expired in 1h15m15s format.|`obj['accessTokenExpiryTime']`, `process.env['SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME']`|**optional**|```30m```|```30m```|
|`awsAccessKeyId`|AWS access key used for connecting to dynamodb. Make sure access credentials has rights for dynamodb. Used with DATABASE_TYPE=dynamodb.|`obj['awsAccessKeyId']`, `process.env['SERVER_AUTHORIZER_AWS_ACCESS_KEY_ID']`|**optional**|-|-|
|`awsSecretAccessKey`|AWS secret access key used for connecting to dynamodb. Make sure access credentials has rights for dynamodb. Used with DATABASE_TYPE=dynamodb.|`obj['awsSecretAccessKey']`, `process.env['SERVER_AUTHORIZER_AWS_SECRET_ACCESS_KEY']`|**optional**|-|-|
|`googleClientId`|OAuth Google login client id.|`obj['googleClientId']`, `process.env['SERVER_AUTHORIZER_GOOGLE_CLIENT_ID']`|**optional**|-|-|
|`googleClientSecret`|OAuth Google login client secret.|`obj['googleClientSecret']`, `process.env['SERVER_AUTHORIZER_GOOGLE_CLIENT_SECRET']`|**optional**|-|-|
|`githubClientId`|OAuth Github login client id.|`obj['githubClientId']`, `process.env['SERVER_AUTHORIZER_GITHUB_CLIENT_ID']`|**optional**|-|-|
|`githubClientSecret`|OAuth Github login client secret.|`obj['githubClientSecret']`, `process.env['SERVER_AUTHORIZER_GITHUB_CLIENT_SECRET']`|**optional**|-|-|
|`facebookClientId`|OAuth Facebook login client id.|`obj['facebookClientId']`, `process.env['SERVER_AUTHORIZER_FACEBOOK_CLIENT_ID']`|**optional**|-|-|
|`facebookClientSecret`|OAuth Facebook login client secret.|`obj['facebookClientSecret']`, `process.env['SERVER_AUTHORIZER_FACEBOOK_CLIENT_SECRET']`|**optional**|-|-|
|`linkedinClientId`|OAuth LinkedIn login client id.|`obj['linkedinClientId']`, `process.env['SERVER_AUTHORIZER_LINKEDIN_CLIENT_ID']`|**optional**|-|-|
|`linkedinClientSecret`|OAuth LinkedIn login client secret.|`obj['linkedinClientSecret']`, `process.env['SERVER_AUTHORIZER_LINKEDIN_CLIENT_SECRET']`|**optional**|-|-|
|`appleClientId`|OAuth Apple login client id.|`obj['appleClientId']`, `process.env['SERVER_AUTHORIZER_APPLE_CLIENT_ID']`|**optional**|-|-|
|`appleClientSecret`|OAuth Apple login client secret.|`obj['appleClientSecret']`, `process.env['SERVER_AUTHORIZER_APPLE_CLIENT_SECRET']`|**optional**|-|-|
|`twitterClientId`|OAuth Twitter login client id.|`obj['twitterClientId']`, `process.env['SERVER_AUTHORIZER_TWITTER_CLIENT_ID']`|**optional**|-|-|
|`twitterClientSecret`|OAuth Twitter login client secret.|`obj['twitterClientSecret']`, `process.env['SERVER_AUTHORIZER_TWITTER_CLIENT_SECRET']`|**optional**|-|-|
|`microsoftClientId`|OAuth Microsoft login client id.|`obj['microsoftClientId']`, `process.env['SERVER_AUTHORIZER_MICROSOFT_CLIENT_ID']`|**optional**|-|-|
|`microsoftClientSecret`|OAuth Microsoft login client secret.|`obj['microsoftClientSecret']`, `process.env['SERVER_AUTHORIZER_MICROSOFT_CLIENT_SECRET']`|**optional**|-|-|
|`microsoftActiveDirectoryTenantId`|Microsoft Active Directory Tenant ID obtained from azure portal.|`obj['microsoftActiveDirectoryTenantId']`, `process.env['SERVER_AUTHORIZER_MICROSOFT_ACTIVE_DIRECTORY_TENANT_ID']`|**optional**|-|-|
|`smtpLocalName`|-|`obj['smtpLocalName']`, `process.env['SERVER_AUTHORIZER_SMTP_LOCAL_NAME']`|**optional**|-|-|
|`jwtSecret`|-|`obj['jwtSecret']`, `process.env['SERVER_AUTHORIZER_JWT_SECRET']`|**optional**|-|-|
|`jwtPrivateKey`|-|`obj['jwtPrivateKey']`, `process.env['SERVER_AUTHORIZER_JWT_PRIVATE_KEY']`|**optional**|-|-|
|`jwtPublicKey`|-|`obj['jwtPublicKey']`, `process.env['SERVER_AUTHORIZER_JWT_PUBLIC_KEY']`|**optional**|-|-|
|`appUrl`|-|`obj['appUrl']`, `process.env['SERVER_AUTHORIZER_APP_URL']`|**optional**|-|-|
|`discordClientId`|-|`obj['discordClientId']`, `process.env['SERVER_AUTHORIZER_DISCORD_CLIENT_ID']`|**optional**|-|-|
|`discordClientSecret`|-|`obj['discordClientSecret']`, `process.env['SERVER_AUTHORIZER_DISCORD_CLIENT_SECRET']`|**optional**|-|-|
|`twitchClientId`|-|`obj['twitchClientId']`, `process.env['SERVER_AUTHORIZER_TWITCH_CLIENT_ID']`|**optional**|-|-|
|`twitchClientSecret`|-|`obj['twitchClientSecret']`, `process.env['SERVER_AUTHORIZER_TWITCH_CLIENT_SECRET']`|**optional**|-|-|
|`clientId`|-|`obj['clientId']`, `process.env['SERVER_AUTHORIZER_CLIENT_ID']`|**optional**|-|-|
|`clientSecret`|-|`obj['clientSecret']`, `process.env['SERVER_AUTHORIZER_CLIENT_SECRET']`|**optional**|-|-|
|`encryptionKey`|-|`obj['encryptionKey']`, `process.env['SERVER_AUTHORIZER_ENCRYPTION_KEY']`|**optional**|-|-|
|`isProd`|-|`obj['isProd']`, `process.env['SERVER_AUTHORIZER_IS_PROD']`|**optional**|-|-|
|`allowedOrigins`|-|`obj['allowedOrigins']`, `process.env['SERVER_AUTHORIZER_ALLOWED_ORIGINS']`|**optional**|-|-|
|`twilioApiKey`|-|`obj['twilioApiKey']`, `process.env['SERVER_AUTHORIZER_TWILIO_API_KEY']`|**optional**|-|-|
|`twilioApiSecret`|-|`obj['twilioApiSecret']`, `process.env['SERVER_AUTHORIZER_TWILIO_API_SECRET']`|**optional**|-|-|
|`twilioAccountSid`|-|`obj['twilioAccountSid']`, `process.env['SERVER_AUTHORIZER_TWILIO_ACCOUNT_SID']`|**optional**|-|-|
|`twilioSender`|-|`obj['twilioSender']`, `process.env['SERVER_AUTHORIZER_TWILIO_SENDER']`|**optional**|-|-|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`image`|Docker image name.|**optional**|```lakhansamani/authorizer:1.3.8```|```lakhansamani/authorizer:1.4.4```|
|`featureName`|Feature name for generate prefix to environments keys.|**optional**|-|```authorizer```|
|`dependsOnServiceNames`|Depends on services|**optional**|-|```{"postgre-sql":"service_healthy"}```|
|`env`|Which env you are running your server in. Supported envs production, development.|**optional**|```production```|```development```|
|`disableEmailVerification`|Used to disable the email verification while signing up.|**optional**|-|```true```|
|`organizationName`|Name of organization that you want on default login page.|**optional**|```Authorizer```|```NestJSModFullstack```|
|`isEmailServiceEnabled`|-|**optional**|-|```true```|
|`isSmsServiceEnabled`|-|**optional**|-|```false```|
|`disableStrongPassword`|-|**optional**|-|```true```|


## License
[MIT](LICENSE)