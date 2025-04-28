# server
> Version: 1.20.4

Boilerplate for creating application on NestJS and Angular
## System modules

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration(default)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`applicationPackageJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/package.json```|
|`packageJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/package.json```|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/project.json```|
|`envFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/.env```|

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
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_PRISMA_TOOLS_USE_FILTERS']`|**optional**|```true```|
|`paginationInitialPage`|`obj['paginationInitialPage']`, `process.env['SERVER_PRISMA_TOOLS_PAGINATION_INITIAL_PAGE']`|**optional**|```1```|
|`paginationPerPageSteps`|`obj['paginationPerPageSteps']`, `process.env['SERVER_PRISMA_TOOLS_PAGINATION_PER_PAGE_STEPS']`|**optional**|-|
|`paginationPerPage`|`obj['paginationPerPage']`, `process.env['SERVER_PRISMA_TOOLS_PAGINATION_PER_PAGE']`|**optional**|```5```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/webhook/project.json```|

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/webhook/project.json```|

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/webhook/project.json```|

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|

### KeyvModule
Simple key-value storage with support for multiple backends, and a consistent interface for NestJS-mod (Wrapper for https://www.npmjs.com/package/keyv)

#### Shared providers
`KeyvService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`url`|`obj['url']`, `process.env['SERVER_KEYV_URL']`|**optional**|-|

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
|`minioServerHost`|`obj['minioServerHost']`, `process.env['SERVER_MINIO_SERVER_HOST']`|**isNotEmpty** (minioServerHost should not be empty)|-|
|`minioServerPort`|`obj['minioServerPort']`, `process.env['SERVER_MINIO_SERVER_PORT']`|**optional**|```9000```|
|`minioAccessKey`|`obj['minioAccessKey']`, `process.env['SERVER_MINIO_ACCESS_KEY']`|**isNotEmpty** (minioAccessKey should not be empty)|-|
|`minioSecretKey`|`obj['minioSecretKey']`, `process.env['SERVER_MINIO_SECRET_KEY']`|**isNotEmpty** (minioSecretKey should not be empty)|-|
|`minioUseSSL`|`obj['minioUseSSL']`, `process.env['SERVER_MINIO_USE_SSL']`|**optional**|```false```|
|`minioDefaultUserId`|`obj['minioDefaultUserId']`, `process.env['SERVER_MINIO_DEFAULT_USER_ID']`|**optional**|```default```|

### ValidationModule
#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`usePipes`|`obj['usePipes']`, `process.env['SERVER_VALIDATION_USE_PIPES']`|**optional**|```false```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_VALIDATION_USE_FILTERS']`|**optional**|```true```|

### AppModule
### WebhookModule
#### Shared providers
`WebhookService`, `WebhookUsersService`

#### Shared imports
`HttpModule`, `PrismaModule`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_WEBHOOK_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_WEBHOOK_USE_FILTERS']`|**optional**|```true```|
|`autoCreateUser`|`obj['autoCreateUser']`, `process.env['SERVER_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|
|`skipGuardErrors`|`obj['skipGuardErrors']`, `process.env['SERVER_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|

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
|`port`|`obj['port']`, `process.env['SERVER_PORT']`|**optional**|```3000```|
|`hostname`|`obj['hostname']`, `process.env['SERVER_HOSTNAME']`|**optional**|-|

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
|`ecosystemConfigFile`|**isNotEmpty** (ecosystemConfigFile should not be empty)|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/ecosystem.config.json```|
|`applicationScriptFile`|**isNotEmpty** (applicationScriptFile should not be empty)|```dist/apps/server/main.js```|

### DockerCompose
Docker Compose is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. (Generator docker-compose.yml for https://docs.docker.com/compose)

#### Shared providers
`ManualDockerComposeFeatures`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`dockerComposeFile`|**isNotEmpty** (dockerComposeFile should not be empty)|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/docker-compose.yml```|

#### Modules that use feature configuration
##### Feature module name: SERVER_POSTGRE_SQL

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-postgre-sql":{"image":"bitnami/postgresql:15.5.0","container_name":"server-postgre-sql","volumes":["server-postgre-sql-volume:/bitnami/postgresql"],"ports":["5432:5432"],"networks":["server-network"],"healthcheck":{"test":["CMD-SHELL","pg_isready -U postgres"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-postgre-sql-volume":{"name":"server-postgre-sql-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_AUTHORIZER

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-authorizer":{"image":"lakhansamani/authorizer:1.4.4","container_name":"server-authorizer","ports":["8080:8080"],"networks":["server-network"],"environment":{"DATABASE_NAME":"authorizer","PORT":8080,"AUTHORIZER_URL":"http://localhost:8080","COOKIE_NAME":"authorizer","DISABLE_PLAYGROUND":true,"ACCESS_TOKEN_EXPIRY_TIME":"30m","IMAGE":"lakhansamani/authorizer:1.4.4","DISABLE_STRONG_PASSWORD":"true","DISABLE_EMAIL_VERIFICATION":"true","FEATURE_NAME":"authorizer","ORGANIZATION_NAME":"Fullstack","DEPENDS_ON_SERVICE_NAMES":{"postgre-sql":"service_healthy"},"IS_EMAIL_SERVICE_ENABLED":"true","IS_SMS_SERVICE_ENABLED":"false","ENV":"development","EXTERNAL_CLIENT_PORT":8080,"RESET_PASSWORD_URL":"/reset-password","ROLES":"user,admin","DEFAULT_ROLES":"user","JWT_ROLE_CLAIM":"role","ORGANIZATION_LOGO":"Authorizer Logo","COUCHBASE_BUCKET":"authorizer","COUCHBASE_BUCKET_RAM_QUOTA":1000,"COUCHBASE_SCOPE":"_default"},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","dependsOnServiceNames","env"],"tty":true,"restart":"always","depends_on":{"server-postgre-sql":{"condition":"service_healthy"}}}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_REDIS

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-redis":{"image":"bitnami/redis:7.4.1","container_name":"server-redis","volumes":["server-redis-volume:/bitnami/redis/data"],"ports":["6379:6379"],"networks":["server-network"],"environment":{"REDIS_DISABLE_COMMANDS":"FLUSHDB,FLUSHALL","REDIS_IO_THREADS":2,"REDIS_IO_THREADS_DO_READS":"yes"},"keysOfEnvironmentsWithStaticValue":["disableCommands","featureName","image","ioThreads","ioThreadsDoReads","networks"],"healthcheck":{"test":["CMD-SHELL","redis-cli ping | grep PONG"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-redis-volume":{"name":"server-redis-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_MINIO

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-minio":{"image":"bitnami/minio:2024.11.7","container_name":"server-minio","volumes":["server-minio-volume:/bitnami/minio/data"],"ports":["9000:9000","9001:9001"],"networks":["server-network"],"environment":{},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","nginxBucketsLocations","nginxConfigContent","nginxConfigFolder","nginxLogsFolder"],"healthcheck":{"test":["CMD-SHELL","mc","ready","local"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-minio-volume":{"name":"server-minio-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_MAILDEV

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-maildev":{"image":"maildev/maildev:2.2.1","container_name":"server-maildev","ports":["1025:1025","1080:1080"],"networks":["server-network"],"environment":{"MAILDEV_SMTP_PORT":1025,"MAILDEV_WEB_PORT":1080},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","smtpPort","webPort"],"healthcheck":{"test":"wget -O - http://localhost:${MAILDEV_WEB_PORT}${MAILDEV_BASE_PATHNAME}/healthz || exit 1","interval":"10s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```app```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/src/migrations```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```app```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/src/migrations```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```app```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/src/migrations```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`markdownFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/apps/server/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|**optional**|```true```|
|`style`|**optional**|```pretty```|

### DockerComposePostgreSQL
PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures. (Generator for databases in docker-compose.yml for https://github.com/nestjs-mod/nestjs-mod-contrib/tree/master/libs/infrastructure/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`rootDatabaseUrl`|`obj['rootDatabaseUrl']`, `process.env['SERVER_ROOT_DATABASE_URL']`|**isNotEmpty** (rootDatabaseUrl should not be empty)|-|

#### Feature environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_FEATURE_MODULE_NAME_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature configuration
##### Feature module name: webhook

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/webhook/project.json```|

#### Modules that use feature configuration
##### Feature module name: auth

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-fullstack/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Modules that use feature environments
##### Feature module name: authorizer

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTHORIZER_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature environments
##### Feature module name: app

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature environments
##### Feature module name: webhook

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature environments
##### Feature module name: auth

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

### DockerComposeAuthorizer
Authorizer is an open-source authentication and authorization solution for your applications. Bring your database and have complete control over the user information. You can self-host authorizer instances and connect to supported databases. (Generator for https://authorizer.dev in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`adminSecret`|`obj['adminSecret']`, `process.env['SERVER_AUTHORIZER_ADMIN_SECRET']`|**isNotEmpty** (adminSecret should not be empty)|-|
|`databaseType`|`obj['databaseType']`, `process.env['SERVER_AUTHORIZER_DATABASE_TYPE']`|**isNotEmpty** (databaseType should not be empty)|-|
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTHORIZER_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|
|`databaseName`|`obj['databaseName']`, `process.env['SERVER_AUTHORIZER_DATABASE_NAME']`|**optional**|```authorizer```|
|`redisUrl`|`obj['redisUrl']`, `process.env['SERVER_AUTHORIZER_REDIS_URL']`|**optional**|-|
|`databasePort`|`obj['databasePort']`, `process.env['SERVER_AUTHORIZER_DATABASE_PORT']`|**optional**|-|
|`databaseHost`|`obj['databaseHost']`, `process.env['SERVER_AUTHORIZER_DATABASE_HOST']`|**optional**|-|
|`databaseUsername`|`obj['databaseUsername']`, `process.env['SERVER_AUTHORIZER_DATABASE_USERNAME']`|**optional**|-|
|`databasePassword`|`obj['databasePassword']`, `process.env['SERVER_AUTHORIZER_DATABASE_PASSWORD']`|**optional**|-|
|`databaseCert`|`obj['databaseCert']`, `process.env['SERVER_AUTHORIZER_DATABASE_CERT']`|**optional**|-|
|`databaseCertKey`|`obj['databaseCertKey']`, `process.env['SERVER_AUTHORIZER_DATABASE_CERT_KEY']`|**optional**|-|
|`databaseCaCert`|`obj['databaseCaCert']`, `process.env['SERVER_AUTHORIZER_DATABASE_CA_CERT']`|**optional**|-|
|`port`|`obj['port']`, `process.env['SERVER_AUTHORIZER_PORT']`|**optional**|```8080```|
|`authorizerUrl`|`obj['authorizerUrl']`, `process.env['SERVER_AUTHORIZER_AUTHORIZER_URL']`|**optional**|```http://localhost:8080```|
|`cookieName`|`obj['cookieName']`, `process.env['SERVER_AUTHORIZER_COOKIE_NAME']`|**optional**|```authorizer```|
|`smtpHost`|`obj['smtpHost']`, `process.env['SERVER_AUTHORIZER_SMTP_HOST']`|**optional**|-|
|`smtpPort`|`obj['smtpPort']`, `process.env['SERVER_AUTHORIZER_SMTP_PORT']`|**optional**|-|
|`smtpUsername`|`obj['smtpUsername']`, `process.env['SERVER_AUTHORIZER_SMTP_USERNAME']`|**optional**|-|
|`smtpPassword`|`obj['smtpPassword']`, `process.env['SERVER_AUTHORIZER_SMTP_PASSWORD']`|**optional**|-|
|`senderEmail`|`obj['senderEmail']`, `process.env['SERVER_AUTHORIZER_SENDER_EMAIL']`|**optional**|-|
|`senderName`|`obj['senderName']`, `process.env['SERVER_AUTHORIZER_SENDER_NAME']`|**optional**|-|
|`disablePlayground`|`obj['disablePlayground']`, `process.env['SERVER_AUTHORIZER_DISABLE_PLAYGROUND']`|**optional**|```true```|
|`accessTokenExpiryTime`|`obj['accessTokenExpiryTime']`, `process.env['SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME']`|**optional**|```30m```|
|`awsAccessKeyId`|`obj['awsAccessKeyId']`, `process.env['SERVER_AUTHORIZER_AWS_ACCESS_KEY_ID']`|**optional**|-|
|`awsSecretAccessKey`|`obj['awsSecretAccessKey']`, `process.env['SERVER_AUTHORIZER_AWS_SECRET_ACCESS_KEY']`|**optional**|-|
|`googleClientId`|`obj['googleClientId']`, `process.env['SERVER_AUTHORIZER_GOOGLE_CLIENT_ID']`|**optional**|-|
|`googleClientSecret`|`obj['googleClientSecret']`, `process.env['SERVER_AUTHORIZER_GOOGLE_CLIENT_SECRET']`|**optional**|-|
|`githubClientId`|`obj['githubClientId']`, `process.env['SERVER_AUTHORIZER_GITHUB_CLIENT_ID']`|**optional**|-|
|`githubClientSecret`|`obj['githubClientSecret']`, `process.env['SERVER_AUTHORIZER_GITHUB_CLIENT_SECRET']`|**optional**|-|
|`facebookClientId`|`obj['facebookClientId']`, `process.env['SERVER_AUTHORIZER_FACEBOOK_CLIENT_ID']`|**optional**|-|
|`facebookClientSecret`|`obj['facebookClientSecret']`, `process.env['SERVER_AUTHORIZER_FACEBOOK_CLIENT_SECRET']`|**optional**|-|
|`linkedinClientId`|`obj['linkedinClientId']`, `process.env['SERVER_AUTHORIZER_LINKEDIN_CLIENT_ID']`|**optional**|-|
|`linkedinClientSecret`|`obj['linkedinClientSecret']`, `process.env['SERVER_AUTHORIZER_LINKEDIN_CLIENT_SECRET']`|**optional**|-|
|`appleClientId`|`obj['appleClientId']`, `process.env['SERVER_AUTHORIZER_APPLE_CLIENT_ID']`|**optional**|-|
|`appleClientSecret`|`obj['appleClientSecret']`, `process.env['SERVER_AUTHORIZER_APPLE_CLIENT_SECRET']`|**optional**|-|
|`twitterClientId`|`obj['twitterClientId']`, `process.env['SERVER_AUTHORIZER_TWITTER_CLIENT_ID']`|**optional**|-|
|`twitterClientSecret`|`obj['twitterClientSecret']`, `process.env['SERVER_AUTHORIZER_TWITTER_CLIENT_SECRET']`|**optional**|-|
|`microsoftClientId`|`obj['microsoftClientId']`, `process.env['SERVER_AUTHORIZER_MICROSOFT_CLIENT_ID']`|**optional**|-|
|`microsoftClientSecret`|`obj['microsoftClientSecret']`, `process.env['SERVER_AUTHORIZER_MICROSOFT_CLIENT_SECRET']`|**optional**|-|
|`microsoftActiveDirectoryTenantId`|`obj['microsoftActiveDirectoryTenantId']`, `process.env['SERVER_AUTHORIZER_MICROSOFT_ACTIVE_DIRECTORY_TENANT_ID']`|**optional**|-|
|`smtpLocalName`|`obj['smtpLocalName']`, `process.env['SERVER_AUTHORIZER_SMTP_LOCAL_NAME']`|**optional**|-|
|`jwtSecret`|`obj['jwtSecret']`, `process.env['SERVER_AUTHORIZER_JWT_SECRET']`|**optional**|-|
|`jwtPrivateKey`|`obj['jwtPrivateKey']`, `process.env['SERVER_AUTHORIZER_JWT_PRIVATE_KEY']`|**optional**|-|
|`jwtPublicKey`|`obj['jwtPublicKey']`, `process.env['SERVER_AUTHORIZER_JWT_PUBLIC_KEY']`|**optional**|-|
|`appUrl`|`obj['appUrl']`, `process.env['SERVER_AUTHORIZER_APP_URL']`|**optional**|-|
|`discordClientId`|`obj['discordClientId']`, `process.env['SERVER_AUTHORIZER_DISCORD_CLIENT_ID']`|**optional**|-|
|`discordClientSecret`|`obj['discordClientSecret']`, `process.env['SERVER_AUTHORIZER_DISCORD_CLIENT_SECRET']`|**optional**|-|
|`twitchClientId`|`obj['twitchClientId']`, `process.env['SERVER_AUTHORIZER_TWITCH_CLIENT_ID']`|**optional**|-|
|`twitchClientSecret`|`obj['twitchClientSecret']`, `process.env['SERVER_AUTHORIZER_TWITCH_CLIENT_SECRET']`|**optional**|-|
|`clientId`|`obj['clientId']`, `process.env['SERVER_AUTHORIZER_CLIENT_ID']`|**optional**|-|
|`clientSecret`|`obj['clientSecret']`, `process.env['SERVER_AUTHORIZER_CLIENT_SECRET']`|**optional**|-|
|`encryptionKey`|`obj['encryptionKey']`, `process.env['SERVER_AUTHORIZER_ENCRYPTION_KEY']`|**optional**|-|
|`isProd`|`obj['isProd']`, `process.env['SERVER_AUTHORIZER_IS_PROD']`|**optional**|-|
|`allowedOrigins`|`obj['allowedOrigins']`, `process.env['SERVER_AUTHORIZER_ALLOWED_ORIGINS']`|**optional**|-|
|`twilioApiKey`|`obj['twilioApiKey']`, `process.env['SERVER_AUTHORIZER_TWILIO_API_KEY']`|**optional**|-|
|`twilioApiSecret`|`obj['twilioApiSecret']`, `process.env['SERVER_AUTHORIZER_TWILIO_API_SECRET']`|**optional**|-|
|`twilioAccountSid`|`obj['twilioAccountSid']`, `process.env['SERVER_AUTHORIZER_TWILIO_ACCOUNT_SID']`|**optional**|-|
|`twilioSender`|`obj['twilioSender']`, `process.env['SERVER_AUTHORIZER_TWILIO_SENDER']`|**optional**|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```lakhansamani/authorizer:1.4.4```|
|`featureName`|**optional**|```authorizer```|
|`dependsOnServiceNames`|**optional**|```{"postgre-sql":"service_healthy"}```|
|`env`|**optional**|```development```|
|`disableEmailVerification`|**optional**|```true```|
|`organizationName`|**optional**|```Fullstack```|
|`isEmailServiceEnabled`|**optional**|```true```|
|`isSmsServiceEnabled`|**optional**|```false```|
|`disableStrongPassword`|**optional**|```true```|

### DockerComposeRedis
The open-source, in-memory data store used by millions of developers as a cache, vector database, document database, streaming engine, and message broker. (Generator for redis in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`redisUrl`|`obj['redisUrl']`, `process.env['SERVER_REDIS_URL']`|**isNotEmpty** (redisUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/redis:7.4.1```|

### DockerComposeMinio
MinIO is a high-performance, S3 compatible object storage. (Generator for minio in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioRootUser`|`obj['minioRootUser']`, `process.env['SERVER_MINIO_ROOT_USER']`|**isNotEmpty** (minioRootUser should not be empty)|-|
|`minioRootPassword`|`obj['minioRootPassword']`, `process.env['SERVER_MINIO_ROOT_PASSWORD']`|**isNotEmpty** (minioRootPassword should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/minio:2024.11.7```|

### DockerComposeMaildev
MailDev is a simple way to test your projects generated email during development, with an easy to use web interface that runs on your machine. (Generator for maildev in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`maildevMailDirectory`|`obj['maildevMailDirectory']`, `process.env['SERVER_MAILDEV_MAIL_DIRECTORY']`|**optional**|-|
|`maildevHttps`|`obj['maildevHttps']`, `process.env['SERVER_MAILDEV_HTTPS']`|**optional**|-|
|`maildevHttpsKey`|`obj['maildevHttpsKey']`, `process.env['SERVER_MAILDEV_HTTPS_KEY']`|**optional**|-|
|`maildevHttpsCert`|`obj['maildevHttpsCert']`, `process.env['SERVER_MAILDEV_HTTPS_CERT']`|**optional**|-|
|`maildevIp`|`obj['maildevIp']`, `process.env['SERVER_MAILDEV_IP']`|**optional**|-|
|`maildevOutgoingHost`|`obj['maildevOutgoingHost']`, `process.env['SERVER_MAILDEV_OUTGOING_HOST']`|**optional**|-|
|`maildevOutgoingPort`|`obj['maildevOutgoingPort']`, `process.env['SERVER_MAILDEV_OUTGOING_PORT']`|**optional**|-|
|`maildevOutgoingUser`|`obj['maildevOutgoingUser']`, `process.env['SERVER_MAILDEV_OUTGOING_USER']`|**optional**|-|
|`maildevOutgoingPass`|`obj['maildevOutgoingPass']`, `process.env['SERVER_MAILDEV_OUTGOING_PASS']`|**optional**|**hidden**|
|`maildevOutgoingSecure`|`obj['maildevOutgoingSecure']`, `process.env['SERVER_MAILDEV_OUTGOING_SECURE']`|**optional**|-|
|`maildevAutoRelay`|`obj['maildevAutoRelay']`, `process.env['SERVER_MAILDEV_AUTO_RELAY']`|**optional**|-|
|`maildevAutoRelayRules`|`obj['maildevAutoRelayRules']`, `process.env['SERVER_MAILDEV_AUTO_RELAY_RULES']`|**optional**|-|
|`maildevIncomingUser`|`obj['maildevIncomingUser']`, `process.env['SERVER_MAILDEV_INCOMING_USER']`|**optional**|-|
|`maildevIncomingPass`|`obj['maildevIncomingPass']`, `process.env['SERVER_MAILDEV_INCOMING_PASS']`|**optional**|**hidden**|
|`maildevIncomingSecure`|`obj['maildevIncomingSecure']`, `process.env['SERVER_MAILDEV_INCOMING_SECURE']`|**optional**|-|
|`maildevIncomingCert`|`obj['maildevIncomingCert']`, `process.env['SERVER_MAILDEV_INCOMING_CERT']`|**optional**|-|
|`maildevIncomingKey`|`obj['maildevIncomingKey']`, `process.env['SERVER_MAILDEV_INCOMING_KEY']`|**optional**|-|
|`maildevWebIp`|`obj['maildevWebIp']`, `process.env['SERVER_MAILDEV_WEB_IP']`|**optional**|-|
|`maildevWebUser`|`obj['maildevWebUser']`, `process.env['SERVER_MAILDEV_WEB_USER']`|**optional**|-|
|`maildevWebPass`|`obj['maildevWebPass']`, `process.env['SERVER_MAILDEV_WEB_PASS']`|**optional**|**hidden**|
|`maildevBasePathname`|`obj['maildevBasePathname']`, `process.env['SERVER_MAILDEV_BASE_PATHNAME']`|**optional**|-|
|`maildevDisableWeb`|`obj['maildevDisableWeb']`, `process.env['SERVER_MAILDEV_DISABLE_WEB']`|**optional**|-|
|`maildevHideExtensions`|`obj['maildevHideExtensions']`, `process.env['SERVER_MAILDEV_HIDE_EXTENSIONS']`|**optional**|-|
