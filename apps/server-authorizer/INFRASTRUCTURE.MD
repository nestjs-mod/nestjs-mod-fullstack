# server-authorizer
> Version: 0.0.34

Boilerplate for creating application on NestJS and Angular
## Running the app in watch mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

# running server-authorizer source code in watch mode
npm run serve:dev:server-authorizer
```
## Running the app in production mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

# launching a built server-authorizer (you must first build it using the build command)
npm run start:prod:server-authorizer
```
## Test
```bash
# running tests for server-authorizer
npm run test:server-authorizer
```
## All scripts
|Script|Description|
|---|---|
|**pm2-supabase-full dev infra**|
|`npm run pm2-supabase-full:dev:start`||
|`npm run pm2-supabase-full:dev:stop`||
|`npm run pm2-supabase-full:dev:test:e2e`||
|`npm run pm2-supabase:dev:start`||
|**pm2-full dev infra**|
|`npm run pm2-full:dev:start`|Launching infrastructure and all applications in watch mode via PM2|
|`npm run pm2-full:dev:stop`|Stopping infrastructure and all applications in watch mode via PM2|
|`npm run pm2-full:dev:test:e2e`|Running E2E tests for all applications in PM2 dev mode|
|**dev infra**|
|`npm run serve:dev`|Running NestJS application source code in watch mode|
|`npm run serve:dev:server`|Running server source code in watch mode|
|`npm run serve:dev:client`||
|`npm run serve:dev:server-authorizer`|Running server-authorizer source code in watch mode|
|`npm run serve:dev:server-supabase`|Running server-supabase source code in watch mode|
|**pm2 dev infra**|
|`npm run pm2:dev:start`|Launching all applications in watch mode via PM2|
|`npm run pm2:dev:stop`|Stopping all applications in watch mode via PM2|
|**pm2-full prod infra**|
|`npm run pm2-full:prod:start`|Launching the infrastructure and building all applications, followed by launching them via PM2|
|`npm run pm2-full:prod:stop`|Stopping infrastructure and all applications running through PM2|
|`npm run pm2-full:prod:test:e2e`|Running E2E tests for all applications in PM2 prod mode|
|**prod infra**|
|`npm run start`|Launching a built NestJS application (you must first build it using the build command)|
|`npm run build:prod`|Building a NestJS application in prod mode|
|`npm run build:prod:no-cache`||
|`npm run build`|Building a NestJS application|
|`npm run start:prod:server-authorizer`|Launching a built server-authorizer (you must first build it using the build command)|
|`npm run start:prod:server-supabase`|Launching a built server-supabase (you must first build it using the build command)|
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
|`npm run test:server-authorizer`|Running tests for server-authorizer|
|`npm run test:server-supabase`|Running tests for server-supabase|
|**lint**|
|`npm run lint`|Checking the typescript code for the entire project|
|`npm run lint:fix`|Checking the typescript code throughout the project and trying to fix everything possible|
|`npm run tsc:lint`|Checking typescript code in libraries|
|**vercel**|
|`npm run vercel:pull-environment:production`||
|**supabase**|
|`npm run build-supabase`||
|`npm run manual-supabase-build`||
|**kubernetes**|
|`npm run kubernetes:generate`||
|**db**|
|`npm run db:create`|Creation all databases of applications and modules|
|`npm run db:create-and-fill`|Create and fill databases|
|**prisma**|
|`npm run prisma:pull:server`|Generating a prisma schema based on a database for server|
|`npm run prisma:pull`|Generating a prisma schema based on a database|
|`npm run prisma:generate`|Generation of client prisma schema of all applications and modules|
|`npm run prisma:shorts:generate`||
|`npm run prisma:pull:webhook`|Generating a prisma schema based on a database for webhook|
|`npm run prisma:pull:auth`|Generating a prisma schema based on a database for auth|
|**pg-flyway**|
|`npm run pg-flyway:create:server`|Command to create new empty migration for server, for set name pass name to --args, example: npm run pg-flyway:create:appname --args=Init|
|`npm run pg-flyway:migrate:server`|Applying migrations for server|
|`npm run pg-flyway:migrate`|Applying migrations of all applications and modules|
|`npm run pg-flyway:create:webhook`|Command to create new empty migration for webhook, for set name pass name to --args, example: npm run pg-flyway:create:appname --args=Init|
|`npm run pg-flyway:migrate:webhook`|Applying migrations for webhook|
|`npm run pg-flyway:create:auth`|Command to create new empty migration for auth, for set name pass name to --args, example: npm run pg-flyway:create:appname --args=Init|
|`npm run pg-flyway:migrate:auth`|Applying migrations for auth|
|**utils**|
|`npm run generate`|Running the "generate" nx command in applications and libraries which can be customized at your discretion automatically generating an index.ts file for each library checking the code and trying to fix it|
|`npm run tsc`|Alias for running the tsc version locally, which is in the project (example: `npm run tsc -- --noEmit -p tsconfig.base.json`), in order not to install tsc globally in the operating system|
|`npm run nx`|Alias for running the nx version locally, which is in the project (example: `./node_modules/.bin/nx dep-graph`), in order not to install nx globally in the operating system|
|`npm run dep-graph`|Generating dependency diagrams for nx applications and libraries|
|`npm run make-ts-list`|Automatically generating an index.ts file for each library, works only for nx applications created using the `--projectNameAndRootFormat=as-provided` flag|
|`npm run manual:prepare`|Preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)|
|`npm run update:nestjs-mod-versions`|Updating NestJS-mod libraries|
|`npm run rucken`|Alias for console tools and scripts for nx and not only use to automate the workflow and speed up the development process (example: `npm run rucken -- make-ts-list`, site: https://www.npmjs.com/package/rucken)|
|`npm run translates`||
|`npm run wait-on`|Utility for checking and waiting for site availability|
|`npm run prepare`||
## System modules
System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`applicationPackageJsonFile`|Application package.json-file|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-authorizer/package.json```|
|`packageJsonFile`|Root package.json-file|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/package.json```|
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

## Feature modules
Feature modules with business logic of the application. NestJS and NestJS-mod compatible modules.

### AppModule
## Integration modules
Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module). NestJS and NestJS-mod compatible modules.

### DefaultNestApplicationListener
Default NestJS application listener.

#### Static environments
Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

| Key    | Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
|`port`|The port on which to run the server.|`obj['port']`, `process.env['SERVER_AUTHORIZER_PORT']`|**optional**|```3000```|```8080```|
|`hostname`|Hostname on which to listen for incoming packets.|`obj['hostname']`, `process.env['SERVER_AUTHORIZER_HOSTNAME']`|**optional**|-|-|

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`mode`|Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application|**optional**|```listen```|```silent```|

## Infrastructure modules
Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.

### Pm2
Production process manager for Node.JS applications with a built-in load balancer for NestJS-mod (Generator ecosystem.config.json for https://www.npmjs.com/package/pm2)

#### Configuration
Variables of primitive and complex types that are used in the module; values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`ecosystemConfigFile`|Configuration file for PM2|**isNotEmpty** (ecosystemConfigFile should not be empty)|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/ecosystem.config.json```|
|`applicationScriptFile`|Application script file name for run|**isNotEmpty** (applicationScriptFile should not be empty)|-|```dist/apps/server-authorizer/main.js```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration
Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

| Key    | Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
|`markdownFile`|Name of the markdown-file in which to save the infrastructure report|**optional**|-|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-authorizer/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|Skip empty values of env and config models|**optional**|-|```true```|


## License
[MIT](LICENSE)