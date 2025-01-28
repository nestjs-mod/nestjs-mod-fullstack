# server
> Version: 1.13.0

Boilerplate for creating a fullstack application on NestJS and Angular
## System modules

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration(default)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`applicationPackageJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/package.json```|
|`packageJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/package.json```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/project.json```|
|`envFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/.env```|

### DefaultNestApplicationInitializer
Default NestJS application initializer.

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`bufferLogs`|**optional**|```true```|

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

## Core modules

### SupabaseModule
Universal javaScript SDK for Supabase API

#### Shared providers
`SupabaseService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`supabaseURL`|`obj['supabaseURL']`, `process.env['SERVER_SUPABASE_URL']`|**isNotEmpty** (supabaseURL should not be empty)|```https://gustcjgbrmmipkizqzso.supabase.co```|
|`supabaseKey`|`obj['supabaseKey']`, `process.env['SERVER_SUPABASE_KEY']`|**isNotEmpty** (supabaseKey should not be empty)|```eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1c3Rjamdicm1taXBraXpxenNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMTIzMjEsImV4cCI6MjA1MTU4ODMyMX0.GKguijZ5Pqxx0g3R1ey6XaCjBica6DSjEv5jvTUMHYo```|
|`allowedExternalAppIds`|`obj['allowedExternalAppIds']`, `process.env['SERVER_ALLOWED_EXTERNAL_APP_IDS']`|**optional**|-|

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`checkAccessValidator`|**optional**|```checkAccessValidator```|

### PrismaToolsModule
#### Shared providers
`PrismaToolsService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_USE_FILTERS']`|**optional**|```true```|
|`paginationInitialPage`|`obj['paginationInitialPage']`, `process.env['SERVER_PAGINATION_INITIAL_PAGE']`|**optional**|```1```|
|`paginationPerPageSteps`|`obj['paginationPerPageSteps']`, `process.env['SERVER_PAGINATION_PER_PAGE_STEPS']`|**optional**|-|
|`paginationPerPage`|`obj['paginationPerPage']`, `process.env['SERVER_PAGINATION_PER_PAGE']`|**optional**|```5```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/project.json```|

#### Environments(app)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration(app)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```app```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/prisma/app-schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```linux-musl```, ```debian-openssl-1.1.x```, ```linux-musl-openssl-3.0.x```, ```rhel-openssl-3.0.x``` ]|

### KeyvModule
Simple key-value storage with support for multiple backends, and a consistent interface for NestJS-mod (Wrapper for https://www.npmjs.com/package/keyv)

#### Shared providers
`KeyvService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`url`|`obj['url']`, `process.env['SERVER_KEYV_URL']`|**optional**|```postgresql://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres```|

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
|`minioServerHost`|`obj['minioServerHost']`, `process.env['SERVER_MINIO_SERVER_HOST']`|**isNotEmpty** (minioServerHost should not be empty)|```gustcjgbrmmipkizqzso.supabase.co```|
|`minioServerPort`|`obj['minioServerPort']`, `process.env['SERVER_MINIO_SERVER_PORT']`|**optional**|```9000```|
|`minioAccessKey`|`obj['minioAccessKey']`, `process.env['SERVER_MINIO_ACCESS_KEY']`|**isNotEmpty** (minioAccessKey should not be empty)|```7c3668c64557544ce98dab6d9871cc51```|
|`minioSecretKey`|`obj['minioSecretKey']`, `process.env['SERVER_MINIO_SECRET_KEY']`|**isNotEmpty** (minioSecretKey should not be empty)|```fae88901a317966b92f875e689377e36bbbfa9e463560f75ca3a4cec7c9d700a```|
|`minioUseSSL`|`obj['minioUseSSL']`, `process.env['SERVER_MINIO_USE_SSL']`|**optional**|```true```|
|`minioDefaultUserId`|`obj['minioDefaultUserId']`, `process.env['SERVER_MINIO_DEFAULT_USER_ID']`|**optional**|```default```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`region`|**optional**|```eu-central-1```|

### FilesModule
### ValidationModule
#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`usePipes`|`obj['usePipes']`, `process.env['SERVER_VALIDATION_USE_PIPES']`|**optional**|```false```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_VALIDATION_USE_FILTERS']`|**optional**|```true```|

## Feature modules

### AppModule
### AuthModule
#### Shared providers
`AsyncLocalStorage`, `AuthTimezoneService`, `AuthCacheService`

#### Shared imports
`PrismaModule`, `KeyvModule`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`adminEmail`|`obj['adminEmail']`, `process.env['SERVER_AUTH_ADMIN_EMAIL']`|**optional**|```nestjs-mod-fullstack@site15.ru```|
|`adminUsername`|`obj['adminUsername']`, `process.env['SERVER_AUTH_ADMIN_USERNAME']`|**isNotEmpty** (adminUsername should not be empty)|```admin```|
|`adminPassword`|`obj['adminPassword']`, `process.env['SERVER_AUTH_ADMIN_PASSWORD']`|**optional**|```SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA```|
|`cacheTTL`|`obj['cacheTTL']`, `process.env['SERVER_AUTH_CACHE_TTL']`|**optional**|```15000```|
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_AUTH_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_AUTH_USE_FILTERS']`|**optional**|```true```|
|`useInterceptors`|`obj['useInterceptors']`, `process.env['SERVER_AUTH_USE_INTERCEPTORS']`|**optional**|```true```|
|`usePipes`|`obj['usePipes']`, `process.env['SERVER_AUTH_USE_PIPES']`|**optional**|```true```|

### WebhookModule
#### Shared providers
`WebhookService`, `WebhookUsersService`

#### Shared imports
`PrismaModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"app-demo.create","description":"Event that will be triggered after creation","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.update","description":"Event that will trigger after the update","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.delete","description":"Event that will fire after deletion","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}``` ]|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_WEBHOOK_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_WEBHOOK_USE_FILTERS']`|**optional**|```true```|
|`autoCreateUser`|`obj['autoCreateUser']`, `process.env['SERVER_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|
|`checkHeaders`|`obj['checkHeaders']`, `process.env['SERVER_WEBHOOK_CHECK_HEADERS']`|**optional**|```false```|
|`skipGuardErrors`|`obj['skipGuardErrors']`, `process.env['SERVER_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|
|`superAdminExternalUserId`|`obj['superAdminExternalUserId']`, `process.env['SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID']`|**optional**|```248ec37f-628d-43f0-8de2-f58da037dd0f```|

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
|`ecosystemConfigFile`|**isNotEmpty** (ecosystemConfigFile should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/ecosystem.config.json```|
|`applicationScriptFile`|**isNotEmpty** (applicationScriptFile should not be empty)|```dist/apps/server/main.js```|

### DockerCompose
Docker Compose is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. (Generator docker-compose.yml for https://docs.docker.com/compose)

#### Shared providers
`ManualDockerComposeFeatures`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`dockerComposeFile`|**isNotEmpty** (dockerComposeFile should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/docker-compose.yml```|

#### Modules that use feature configuration
##### Feature module name: SERVER_POSTGRE_SQL

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-postgre-sql":{"image":"bitnami/postgresql:15.5.0","container_name":"server-postgre-sql","volumes":["server-postgre-sql-volume:/bitnami/postgresql"],"ports":["5432:5432"],"networks":["server-network"],"healthcheck":{"test":["CMD-SHELL","pg_isready -U postgres"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-postgre-sql-volume":{"name":"server-postgre-sql-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_REDIS

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-redis":{"image":"bitnami/redis:7.4.1","container_name":"server-redis","volumes":["server-redis-volume:/bitnami/redis/data"],"ports":["6379:6379"],"networks":["server-network"],"environment":{"REDIS_DATABASE":"0","REDIS_PASSWORD":"CHmeOQrZWUHwgahrfzsrzuREOxgAENsC","REDIS_DISABLE_COMMANDS":"FLUSHDB,FLUSHALL","REDIS_IO_THREADS":2,"REDIS_IO_THREADS_DO_READS":"yes"},"keysOfEnvironmentsWithStaticValue":["disableCommands","featureName","image","ioThreads","ioThreadsDoReads","networks"],"healthcheck":{"test":["CMD-SHELL","redis-cli --no-auth-warning -a $$REDIS_PASSWORD ping | grep PONG"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-redis-volume":{"name":"server-redis-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_MINIO

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-minio":{"image":"bitnami/minio:2024.11.7","container_name":"server-minio","volumes":["server-minio-volume:/bitnami/minio/data"],"ports":["9000:9000","9001:9001"],"networks":["server-network"],"environment":{"MINIO_ROOT_USER":"7c3668c64557544ce98dab6d9871cc51","MINIO_ROOT_PASSWORD":"fae88901a317966b92f875e689377e36bbbfa9e463560f75ca3a4cec7c9d700a"},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","nginxBucketsLocations","nginxConfigContent","nginxConfigFolder","nginxLogsFolder"],"healthcheck":{"test":["CMD-SHELL","mc","ready","local"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-minio-volume":{"name":"server-minio-volume"}}```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```app```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/migrations```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```app```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/migrations```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```app```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/src/migrations```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`markdownFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|**optional**|```true```|
|`style`|**optional**|```pretty```|

### DockerComposePostgreSQL
PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures. (Generator for databases in docker-compose.yml for https://github.com/nestjs-mod/nestjs-mod-contrib/tree/master/libs/infrastructure/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`rootDatabaseUrl`|`obj['rootDatabaseUrl']`, `process.env['SERVER_ROOT_DATABASE_URL']`|**isNotEmpty** (rootDatabaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Feature environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_FEATURE_MODULE_NAME_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature configuration
##### Feature module name: webhook

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/feature/webhook/project.json```|

#### Modules that use feature configuration
##### Feature module name: auth

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/libs/core/auth/project.json```|

#### Modules that use feature environments
##### Feature module name: app

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_APP_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Modules that use feature environments
##### Feature module name: webhook

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

#### Modules that use feature environments
##### Feature module name: auth

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://postgres.gustcjgbrmmipkizqzso:yvnJ!tNMP72-RCB@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?schema=public```|

### DockerComposeRedis
The open-source, in-memory data store used by millions of developers as a cache, vector database, document database, streaming engine, and message broker. (Generator for redis in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`redisUrl`|`obj['redisUrl']`, `process.env['SERVER_REDIS_URL']`|**isNotEmpty** (redisUrl should not be empty)|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@localhost:6379```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/redis:7.4.1```|

### DockerComposeMinio
MinIO is a high-performance, S3 compatible object storage. (Generator for minio in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioRootUser`|`obj['minioRootUser']`, `process.env['SERVER_MINIO_ROOT_USER']`|**isNotEmpty** (minioRootUser should not be empty)|```7c3668c64557544ce98dab6d9871cc51```|
|`minioRootPassword`|`obj['minioRootPassword']`, `process.env['SERVER_MINIO_ROOT_PASSWORD']`|**isNotEmpty** (minioRootPassword should not be empty)|```fae88901a317966b92f875e689377e36bbbfa9e463560f75ca3a4cec7c9d700a```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/minio:2024.11.7```|
