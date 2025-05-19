# server-sso
> Version: 0.0.35

Boilerplate for creating application on NestJS and Angular
## Running the app in watch mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

# running server-sso source code in watch mode
npm run serve:dev:server-sso
```
## Running the app in production mode
```bash
# preparing code, building code, creating infrastructure documentation and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)
npm run manual:prepare

# launching a built server-sso (you must first build it using the build command)
npm run start:prod:server-sso
```
## Test
```bash
# running tests for server-sso
npm run test:server-sso
```
## System modules

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration(default)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`applicationPackageJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/package.json```|
|`packageJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/package.json```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/project.json```|
|`envFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/.env```|

### DefaultNestApplicationInitializer
Default NestJS application initializer.

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`bufferLogs`|**optional**|```true```|

## Feature modules

### NestjsPinoLoggerModule
Pino logger for NestJS-mod (Wrapper for https://www.npmjs.com/package/nestjs-pino)

### TerminusHealthCheckModule
Terminus integration provides readiness/liveness health checks for NestJS-mod (Wrapper for https://www.npmjs.com/package/@nestjs/terminus)

#### Shared providers
`TerminusHealthCheckService`

#### Shared imports
`TerminusModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`standardHealthIndicators`|**optional**|[ ```{"name":"memory_heap"}```, ```{"name":"database_app"}```, ```{"name":"database_auth"}```, ```{"name":"database_webhook"}``` ]|

### PrismaToolsModule
#### Shared providers
`PrismaToolsService`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_SSO_PRISMA_TOOLS_USE_FILTERS']`|**optional**|```true```|
|`paginationInitialPage`|`obj['paginationInitialPage']`, `process.env['SERVER_SSO_PRISMA_TOOLS_PAGINATION_INITIAL_PAGE']`|**optional**|```1```|
|`paginationPerPageSteps`|`obj['paginationPerPageSteps']`, `process.env['SERVER_SSO_PRISMA_TOOLS_PAGINATION_PER_PAGE_STEPS']`|**optional**|-|
|`paginationPerPage`|`obj['paginationPerPage']`, `process.env['SERVER_SSO_PRISMA_TOOLS_PAGINATION_PER_PAGE']`|**optional**|```5```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/webhook/project.json```|

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/webhook/project.json```|

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/webhook/project.json```|

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|

### KeyvModule
Simple key-value storage with support for multiple backends, and a consistent interface for NestJS-mod (Wrapper for https://www.npmjs.com/package/keyv)

#### Shared providers
`KeyvService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`url`|`obj['url']`, `process.env['SERVER_SSO_KEYV_URL']`|**optional**|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@server-sso-redis:6379```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`storeFactoryByEnvironmentUrl`|**optional**|```storeFactoryByEnvironmentUrl```|

### MinioModule
Minio client for NestJS-mod (Wrapper for https://www.npmjs.com/package/nestjs-minio)

#### Shared providers
`MinioService`, `MinioFilesService`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioServerHost`|`obj['minioServerHost']`, `process.env['SERVER_SSO_MINIO_SERVER_HOST']`|**isNotEmpty** (minioServerHost should not be empty)|```localhost```|
|`minioServerPort`|`obj['minioServerPort']`, `process.env['SERVER_SSO_MINIO_SERVER_PORT']`|**optional**|```9000```|
|`minioAccessKey`|`obj['minioAccessKey']`, `process.env['SERVER_SSO_MINIO_ACCESS_KEY']`|**isNotEmpty** (minioAccessKey should not be empty)|```FWGmrAGaeMKM```|
|`minioSecretKey`|`obj['minioSecretKey']`, `process.env['SERVER_SSO_MINIO_SECRET_KEY']`|**isNotEmpty** (minioSecretKey should not be empty)|```QatVJuLoZRARlJguoZMpoKvZMJHzvuOR```|
|`minioUseSSL`|`obj['minioUseSSL']`, `process.env['SERVER_SSO_MINIO_USE_SSL']`|**optional**|```false```|
|`minioDefaultUserId`|`obj['minioDefaultUserId']`, `process.env['SERVER_SSO_MINIO_DEFAULT_USER_ID']`|**optional**|```default```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`region`|**optional**|```eu-central-1```|

### ValidationModule
#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`usePipes`|`obj['usePipes']`, `process.env['SERVER_SSO_VALIDATION_USE_PIPES']`|**optional**|```false```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_SSO_VALIDATION_USE_FILTERS']`|**optional**|```true```|

### AppModule
### WebhookModule
#### Shared providers
`WebhookService`, `WebhookUsersService`

#### Shared imports
`HttpModule`, `PrismaModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`syncMode`|**optional**|```true```|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_SSO_WEBHOOK_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_SSO_WEBHOOK_USE_FILTERS']`|**optional**|```true```|
|`autoCreateUser`|`obj['autoCreateUser']`, `process.env['SERVER_SSO_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|
|`skipGuardErrors`|`obj['skipGuardErrors']`, `process.env['SERVER_SSO_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|

#### Modules that use feature configuration
##### Feature module name: auth

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"auth.user-create","description":"Event that fires after user create","example":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","lang":"en","timezone":5,"userRole":"User"}}```, ```{"eventName":"auth.user-update","description":"Event that fires after user update","example":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","lang":"en","timezone":5,"userRole":"User"}}```, ```{"eventName":"auth.user-delete","description":"Event that fires after user delete","example":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab"}}``` ]|

#### Modules that use feature configuration
##### Feature module name: files

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"files.delete","description":"Event that fires after a file is deleted","example":{"bucketName":"images","downloadUrl":"/files/images-file-id.jpg","objectName":"images-file-id","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab"}}``` ]|

#### Modules that use feature configuration
##### Feature module name: app

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"app-demo.create","description":"Event that will be triggered after creation","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.update","description":"Event that will trigger after the update","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.delete","description":"Event that will fire after deletion","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}``` ]|

## Integration modules

### DefaultNestApplicationListener
Default NestJS application listener.

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`port`|`obj['port']`, `process.env['SERVER_SSO_PORT']`|**optional**|```3000```|
|`hostname`|`obj['hostname']`, `process.env['SERVER_SSO_HOSTNAME']`|**optional**|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`mode`|**optional**|```silent```|
|`preListen`|**optional**|```preListen```|

## Infrastructure modules

### Pm2
Production process manager for Node.JS applications with a built-in load balancer for NestJS-mod (Generator ecosystem.config.json for https://www.npmjs.com/package/pm2)

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`ecosystemConfigFile`|**isNotEmpty** (ecosystemConfigFile should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/ecosystem.config.json```|
|`applicationScriptFile`|**isNotEmpty** (applicationScriptFile should not be empty)|```dist/apps/server-sso/main.js```|

### DockerCompose
Docker Compose is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. (Generator docker-compose.yml for https://docs.docker.com/compose)

#### Shared providers
`ManualDockerComposeFeatures`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`dockerComposeFile`|**isNotEmpty** (dockerComposeFile should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/docker-compose.yml```|

#### Modules that use feature configuration
##### Feature module name: SERVER_SSO_POSTGRE_SQL

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-sso-postgre-sql":{"image":"bitnami/postgresql:15.5.0","container_name":"server-sso-postgre-sql","volumes":["server-sso-postgre-sql-volume:/bitnami/postgresql"],"ports":["5432:5432"],"networks":["server-sso-network"],"healthcheck":{"test":["CMD-SHELL","pg_isready -U postgres"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-sso-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-sso-postgre-sql-volume":{"name":"server-sso-postgre-sql-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_SSO_REDIS

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-sso-redis":{"image":"bitnami/redis:7.4.1","container_name":"server-sso-redis","volumes":["server-sso-redis-volume:/bitnami/redis/data"],"ports":["6379:6379"],"networks":["server-sso-network"],"environment":{"REDIS_DATABASE":"0","REDIS_PASSWORD":"CHmeOQrZWUHwgahrfzsrzuREOxgAENsC","REDIS_DISABLE_COMMANDS":"FLUSHDB,FLUSHALL","REDIS_IO_THREADS":2,"REDIS_IO_THREADS_DO_READS":"yes"},"keysOfEnvironmentsWithStaticValue":["disableCommands","featureName","image","ioThreads","ioThreadsDoReads","networks"],"healthcheck":{"test":["CMD-SHELL","redis-cli --no-auth-warning -a $$REDIS_PASSWORD ping | grep PONG"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-sso-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-sso-redis-volume":{"name":"server-sso-redis-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_SSO_MINIO

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-sso-minio":{"image":"bitnami/minio:2024.11.7","container_name":"server-sso-minio","volumes":["server-sso-minio-volume:/bitnami/minio/data"],"ports":["9000:9000","9001:9001"],"networks":["server-sso-network"],"environment":{"MINIO_ROOT_USER":"FWGmrAGaeMKM","MINIO_ROOT_PASSWORD":"QatVJuLoZRARlJguoZMpoKvZMJHzvuOR"},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","nginxBucketsLocations","nginxConfigContent","nginxConfigFolder","nginxLogsFolder"],"healthcheck":{"test":["CMD-SHELL","mc","ready","local"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-sso-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-sso-minio-volume":{"name":"server-sso-minio-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_SSO_MAILDEV

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-sso-maildev":{"image":"maildev/maildev:2.2.1","container_name":"server-sso-maildev","ports":["1025:1025","1080:1080"],"networks":["server-sso-network"],"environment":{"MAILDEV_SMTP_PORT":1025,"MAILDEV_WEB_PORT":1080},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","smtpPort","webPort"],"healthcheck":{"test":"wget -O - http://localhost:${MAILDEV_WEB_PORT}${MAILDEV_BASE_PATHNAME}/healthz || exit 1","interval":"10s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-sso-network":{"driver":"bridge"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_SSO_SINGLE_SIGN_ON

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-sso-single-sign-on":{"image":"ghcr.io/nestjs-mod/nestjs-mod-sso-server:1.5.5","container_name":"server-sso-single-sign-on","ports":["8080:8080"],"networks":["server-sso-network"],"excludeContainerNameFromEnvironmentName":true,"environment":{"DATABASE_URL":"postgres://sso:sso_password@server-sso-postgre-sql:5432/sso?schema=public","SINGLE_SIGN_ON_PORT":8080,"SINGLE_SIGN_ON_KEYV_URL":"redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@server-sso-redis:6379","SINGLE_SIGN_ON_MINIO_SERVER_HOST":"server-sso-minio","SINGLE_SIGN_ON_MINIO_ACCESS_KEY":"FWGmrAGaeMKM","SINGLE_SIGN_ON_MINIO_SECRET_KEY":"QatVJuLoZRARlJguoZMpoKvZMJHzvuOR","SINGLE_SIGN_ON_NOTIFICATIONS_MAIL_TRANSPORT":"smtp://server-sso-maildev:1025","SINGLE_SIGN_ON_NOTIFICATIONS_MAIL_DEFAULT_SENDER_NAME":"Bot","SINGLE_SIGN_ON_NOTIFICATIONS_MAIL_DEFAULT_SENDER_EMAIL":"bot@nestjs-mod-fullstack.maildev","SINGLE_SIGN_ON_SSO_SERVER_URL":"http://localhost:3000","SINGLE_SIGN_ON_SSO_CLIENT_URL":"http://localhost:4200","SINGLE_SIGN_ON_SSO_ADMIN_SECRET":"VfKSfPPljhHBXCEohnitursmgDxfAyiD","SINGLE_SIGN_ON_SSO_ADMIN_EMAIL":"nestjs-mod-fullstack@site15.ru","SINGLE_SIGN_ON_SSO_ADMIN_USERNAME":"admin","SINGLE_SIGN_ON_SSO_ADMIN_PASSWORD":"SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA","SINGLE_SIGN_ON_SSO_USER_AVAILABLE_ROLES":["admin","manager","user"],"SINGLE_SIGN_ON_SSO_USER_DEFAULT_ROLES":["user"],"SINGLE_SIGN_ON_SSO_ADMIN_DEFAULT_ROLES":["admin"],"SINGLE_SIGN_ON_SSO_MANAGER_DEFAULT_ROLES":["manager"],"SINGLE_SIGN_ON_SSO_JWT_SECRET_KEY":"AcJwUY9AP6FPf8XnfwbSuW7ZjwoaPiFJ","SINGLE_SIGN_ON_SSO_JWT_ACCESS_TOKEN_EXPIRES_IN":"30m","SINGLE_SIGN_ON_SSO_JWT_REFRESH_TOKEN_EXPIRES_IN":"24h","SINGLE_SIGN_ON_SSO_CACHE_TTL":15000,"SINGLE_SIGN_ON_SSO_DEFAULT_PUBLIC_PROJECTS":"Beijing:ru=Пекин,Jq6GQ6Rzz6x8HNOD4x2Hc2eM0cfiCVUzGfsi,X6nk0OZXQJboSEfugnH35e9oSeg5RFlV0DQprtYyYDQjNli9mA;Moscow:ru=Москва,OceX08HGZ89PTkPpg9KDk5ErY1uMfDcfFKkw,VJztpDIwvqG6IkTVEIDEw1Ed2Wu5oHu6zfBe7CCJFrCtyWO2Yv;New York:ru=Нью-Йорк,4OGD25Rmn3W3MP0kMd7c90rGP1WwK8u4wL1w,qm8nc9MgKyvd6Hgl3jY5BjgDFSBqNvxcu6o52kDjIC168OsM1R;","SINGLE_SIGN_ON_SSO_DEFAULT_PROJECT":"default:ru=по умолчанию,KzMRNEZTetzatIgQPVSDYfeGyaZrbLzkcxNc,qaHkVpAtUVIpDdLXMlAOzsBfMRJblWoHpXguYQRBuSEBpGKbWt","SINGLE_SIGN_ON_SSO_DISABLE_EMAIL_VERIFICATION":false,"FEATURE_NAME":"sso","DEPENDS_ON_SERVICE_NAMES":{"postgre-sql":"service_healthy"},"IMAGE":"ghcr.io/nestjs-mod/nestjs-mod-sso-server:1.5.5","EXTERNAL_CLIENT_PORT":8080},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","dependsOnServiceNames","env"],"tty":true,"restart":"always","depends_on":{"server-sso-postgre-sql":{"condition":"service_healthy"}}}}```|
|`networks`|**optional**|```{"server-sso-network":{"driver":"bridge"}}```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://app:app_password@localhost:5432/app?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```app```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/src/migrations```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`markdownFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|**optional**|```true```|
|`style`|**optional**|```pretty```|

### DockerComposePostgreSQL
PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures. (Generator for databases in docker-compose.yml for https://github.com/nestjs-mod/nestjs-mod-contrib/tree/master/libs/infrastructure/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`rootDatabaseUrl`|`obj['rootDatabaseUrl']`, `process.env['SERVER_SSO_ROOT_DATABASE_URL']`|**isNotEmpty** (rootDatabaseUrl should not be empty)|```postgres://postgres:postgres_password@localhost:5432/postgres?schema=public```|

#### Feature environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_FEATURE_MODULE_NAME_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature configuration
##### Feature module name: sso

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/project.json```|

#### Modules that use feature configuration
##### Feature module name: app

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server-sso/project.json```|

#### Modules that use feature environments
##### Feature module name: sso

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@server-sso-postgre-sql:5432/sso?schema=public```|

#### Modules that use feature environments
##### Feature module name: app

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://app:app_password@localhost:5432/app?schema=public```|

### DockerComposeRedis
The open-source, in-memory data store used by millions of developers as a cache, vector database, document database, streaming engine, and message broker. (Generator for redis in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`redisUrl`|`obj['redisUrl']`, `process.env['SERVER_SSO_REDIS_URL']`|**isNotEmpty** (redisUrl should not be empty)|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@localhost:6379```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/redis:7.4.1```|

### DockerComposeMinio
MinIO is a high-performance, S3 compatible object storage. (Generator for minio in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioRootUser`|`obj['minioRootUser']`, `process.env['SERVER_SSO_MINIO_ROOT_USER']`|**isNotEmpty** (minioRootUser should not be empty)|```FWGmrAGaeMKM```|
|`minioRootPassword`|`obj['minioRootPassword']`, `process.env['SERVER_SSO_MINIO_ROOT_PASSWORD']`|**isNotEmpty** (minioRootPassword should not be empty)|```QatVJuLoZRARlJguoZMpoKvZMJHzvuOR```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/minio:2024.11.7```|

### DockerComposeMaildev
MailDev is a simple way to test your projects generated email during development, with an easy to use web interface that runs on your machine. (Generator for maildev in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`maildevMailDirectory`|`obj['maildevMailDirectory']`, `process.env['SERVER_SSO_MAILDEV_MAIL_DIRECTORY']`|**optional**|-|
|`maildevHttps`|`obj['maildevHttps']`, `process.env['SERVER_SSO_MAILDEV_HTTPS']`|**optional**|-|
|`maildevHttpsKey`|`obj['maildevHttpsKey']`, `process.env['SERVER_SSO_MAILDEV_HTTPS_KEY']`|**optional**|-|
|`maildevHttpsCert`|`obj['maildevHttpsCert']`, `process.env['SERVER_SSO_MAILDEV_HTTPS_CERT']`|**optional**|-|
|`maildevIp`|`obj['maildevIp']`, `process.env['SERVER_SSO_MAILDEV_IP']`|**optional**|-|
|`maildevOutgoingHost`|`obj['maildevOutgoingHost']`, `process.env['SERVER_SSO_MAILDEV_OUTGOING_HOST']`|**optional**|-|
|`maildevOutgoingPort`|`obj['maildevOutgoingPort']`, `process.env['SERVER_SSO_MAILDEV_OUTGOING_PORT']`|**optional**|-|
|`maildevOutgoingUser`|`obj['maildevOutgoingUser']`, `process.env['SERVER_SSO_MAILDEV_OUTGOING_USER']`|**optional**|-|
|`maildevOutgoingPass`|`obj['maildevOutgoingPass']`, `process.env['SERVER_SSO_MAILDEV_OUTGOING_PASS']`|**optional**|**hidden**|
|`maildevOutgoingSecure`|`obj['maildevOutgoingSecure']`, `process.env['SERVER_SSO_MAILDEV_OUTGOING_SECURE']`|**optional**|-|
|`maildevAutoRelay`|`obj['maildevAutoRelay']`, `process.env['SERVER_SSO_MAILDEV_AUTO_RELAY']`|**optional**|-|
|`maildevAutoRelayRules`|`obj['maildevAutoRelayRules']`, `process.env['SERVER_SSO_MAILDEV_AUTO_RELAY_RULES']`|**optional**|-|
|`maildevIncomingUser`|`obj['maildevIncomingUser']`, `process.env['SERVER_SSO_MAILDEV_INCOMING_USER']`|**optional**|-|
|`maildevIncomingPass`|`obj['maildevIncomingPass']`, `process.env['SERVER_SSO_MAILDEV_INCOMING_PASS']`|**optional**|**hidden**|
|`maildevIncomingSecure`|`obj['maildevIncomingSecure']`, `process.env['SERVER_SSO_MAILDEV_INCOMING_SECURE']`|**optional**|-|
|`maildevIncomingCert`|`obj['maildevIncomingCert']`, `process.env['SERVER_SSO_MAILDEV_INCOMING_CERT']`|**optional**|-|
|`maildevIncomingKey`|`obj['maildevIncomingKey']`, `process.env['SERVER_SSO_MAILDEV_INCOMING_KEY']`|**optional**|-|
|`maildevWebIp`|`obj['maildevWebIp']`, `process.env['SERVER_SSO_MAILDEV_WEB_IP']`|**optional**|-|
|`maildevWebUser`|`obj['maildevWebUser']`, `process.env['SERVER_SSO_MAILDEV_WEB_USER']`|**optional**|-|
|`maildevWebPass`|`obj['maildevWebPass']`, `process.env['SERVER_SSO_MAILDEV_WEB_PASS']`|**optional**|**hidden**|
|`maildevBasePathname`|`obj['maildevBasePathname']`, `process.env['SERVER_SSO_MAILDEV_BASE_PATHNAME']`|**optional**|-|
|`maildevDisableWeb`|`obj['maildevDisableWeb']`, `process.env['SERVER_SSO_MAILDEV_DISABLE_WEB']`|**optional**|-|
|`maildevHideExtensions`|`obj['maildevHideExtensions']`, `process.env['SERVER_SSO_MAILDEV_HIDE_EXTENSIONS']`|**optional**|-|

### DockerComposeSso
Single Sign-On on NestJS and Angular with webhooks and social authorization. (Generator for https://github.com/nestjs-mod/nestjs-mod-sso in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@server-sso-postgre-sql:5432/sso?schema=public```|
|`singleSignOnPort`|`obj['singleSignOnPort']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_PORT']`|**optional**|```8080```|
|`singleSignOnKeyvUrl`|`obj['singleSignOnKeyvUrl']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_KEYV_URL']`|**isNotEmpty** (singleSignOnKeyvUrl should not be empty)|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@server-sso-redis:6379```|
|`singleSignOnMinioServerHost`|`obj['singleSignOnMinioServerHost']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_MINIO_SERVER_HOST']`|**isNotEmpty** (singleSignOnMinioServerHost should not be empty)|```server-sso-minio```|
|`singleSignOnMinioAccessKey`|`obj['singleSignOnMinioAccessKey']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_MINIO_ACCESS_KEY']`|**isNotEmpty** (singleSignOnMinioAccessKey should not be empty)|```FWGmrAGaeMKM```|
|`singleSignOnMinioSecretKey`|`obj['singleSignOnMinioSecretKey']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_MINIO_SECRET_KEY']`|**isNotEmpty** (singleSignOnMinioSecretKey should not be empty)|```QatVJuLoZRARlJguoZMpoKvZMJHzvuOR```|
|`singleSignOnNotificationsMailTransport`|`obj['singleSignOnNotificationsMailTransport']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_NOTIFICATIONS_MAIL_TRANSPORT']`|**optional**|```smtp://server-sso-maildev:1025```|
|`singleSignOnNotificationsMailDefaultSenderName`|`obj['singleSignOnNotificationsMailDefaultSenderName']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_NOTIFICATIONS_MAIL_DEFAULT_SENDER_NAME']`|**optional**|```Bot```|
|`singleSignOnNotificationsMailDefaultSenderEmail`|`obj['singleSignOnNotificationsMailDefaultSenderEmail']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_NOTIFICATIONS_MAIL_DEFAULT_SENDER_EMAIL']`|**optional**|```bot@nestjs-mod-fullstack.maildev```|
|`singleSignOnSsoServerUrl`|`obj['singleSignOnSsoServerUrl']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_SERVER_URL']`|**isNotEmpty** (singleSignOnSsoServerUrl should not be empty)|```http://localhost:3000```|
|`singleSignOnSsoClientUrl`|`obj['singleSignOnSsoClientUrl']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_CLIENT_URL']`|**isNotEmpty** (singleSignOnSsoClientUrl should not be empty)|```http://localhost:4200```|
|`singleSignOnSsoAdminSecret`|`obj['singleSignOnSsoAdminSecret']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_ADMIN_SECRET']`|**optional**|```VfKSfPPljhHBXCEohnitursmgDxfAyiD```|
|`singleSignOnSsoAdminEmail`|`obj['singleSignOnSsoAdminEmail']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_ADMIN_EMAIL']`|**optional**|```nestjs-mod-fullstack@site15.ru```|
|`singleSignOnSsoAdminUsername`|`obj['singleSignOnSsoAdminUsername']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_ADMIN_USERNAME']`|**isNotEmpty** (singleSignOnSsoAdminUsername should not be empty)|```admin```|
|`singleSignOnSsoAdminPassword`|`obj['singleSignOnSsoAdminPassword']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_ADMIN_PASSWORD']`|**optional**|```SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA```|
|`singleSignOnSsoUserAvailableRoles`|`obj['singleSignOnSsoUserAvailableRoles']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_USER_AVAILABLE_ROLES']`|**optional**|[ ```admin```, ```manager```, ```user``` ]|
|`singleSignOnSsoUserDefaultRoles`|`obj['singleSignOnSsoUserDefaultRoles']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_USER_DEFAULT_ROLES']`|**optional**|[ ```user``` ]|
|`singleSignOnSsoAdminDefaultRoles`|`obj['singleSignOnSsoAdminDefaultRoles']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_ADMIN_DEFAULT_ROLES']`|**optional**|[ ```admin``` ]|
|`singleSignOnSsoManagerDefaultRoles`|`obj['singleSignOnSsoManagerDefaultRoles']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_MANAGER_DEFAULT_ROLES']`|**optional**|[ ```manager``` ]|
|`singleSignOnSsoJwtSecretKey`|`obj['singleSignOnSsoJwtSecretKey']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_JWT_SECRET_KEY']`|**optional**|```AcJwUY9AP6FPf8XnfwbSuW7ZjwoaPiFJ```|
|`singleSignOnSsoJwtAccessTokenExpiresIn`|`obj['singleSignOnSsoJwtAccessTokenExpiresIn']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_JWT_ACCESS_TOKEN_EXPIRES_IN']`|**optional**|```30m```|
|`singleSignOnSsoJwtRefreshTokenExpiresIn`|`obj['singleSignOnSsoJwtRefreshTokenExpiresIn']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_JWT_REFRESH_TOKEN_EXPIRES_IN']`|**optional**|```24h```|
|`singleSignOnSsoCacheTTL`|`obj['singleSignOnSsoCacheTTL']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_CACHE_TTL']`|**optional**|```15000```|
|`singleSignOnSsoDefaultPublicProjects`|`obj['singleSignOnSsoDefaultPublicProjects']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_DEFAULT_PUBLIC_PROJECTS']`|**optional**|```Beijing:ru=Пекин,Jq6GQ6Rzz6x8HNOD4x2Hc2eM0cfiCVUzGfsi,X6nk0OZXQJboSEfugnH35e9oSeg5RFlV0DQprtYyYDQjNli9mA;Moscow:ru=Москва,OceX08HGZ89PTkPpg9KDk5ErY1uMfDcfFKkw,VJztpDIwvqG6IkTVEIDEw1Ed2Wu5oHu6zfBe7CCJFrCtyWO2Yv;New York:ru=Нью-Йорк,4OGD25Rmn3W3MP0kMd7c90rGP1WwK8u4wL1w,qm8nc9MgKyvd6Hgl3jY5BjgDFSBqNvxcu6o52kDjIC168OsM1R;```|
|`singleSignOnSsoDefaultProject`|`obj['singleSignOnSsoDefaultProject']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_DEFAULT_PROJECT']`|**optional**|```default:ru=по умолчанию,KzMRNEZTetzatIgQPVSDYfeGyaZrbLzkcxNc,qaHkVpAtUVIpDdLXMlAOzsBfMRJblWoHpXguYQRBuSEBpGKbWt```|
|`singleSignOnSsoDisableEmailVerification`|`obj['singleSignOnSsoDisableEmailVerification']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_DISABLE_EMAIL_VERIFICATION']`|**optional**|```false```|
|`singleSignOnSsoGoogleOauthClientId`|`obj['singleSignOnSsoGoogleOauthClientId']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_GOOGLE_OAUTH_CLIENT_ID']`|**optional**|-|
|`singleSignOnSsoGoogleOauthClientSecretKey`|`obj['singleSignOnSsoGoogleOauthClientSecretKey']`, `process.env['SERVER_SSO_SSO_SINGLE_SIGN_ON_SSO_GOOGLE_OAUTH_CLIENT_SECRET_KEY']`|**optional**|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`dependsOnServiceNames`|**optional**|```{"postgre-sql":"service_healthy"}```|
