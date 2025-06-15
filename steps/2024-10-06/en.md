## [2024-10-06] Creating a configurable Webhook module for a NestJS application

In this article, I will describe the creation of two NestJS modules with different configuration methods: a utility module and a business module with its own database.

There is a lot of text and code here, who is too lazy to read, they can just look at the changes in the project code: https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/460257364bb4ce8e23fe761fbc9ca7462bc89b61..ec8de9d574a6dbcef3c3339e876ce156a3974aae

### 1. We come up with and paint a feature

Before implementing a certain functionality, you first need to write out everything that it should be able to do and describe entities with components that we know about this functionality.

**Description**

When developing a highly isolated `NestJS` module, we integrate with other modules either through the module configuration, or through a broker or queue.

In my practice, the main part of integrations is the publication of events for which we are already writing handlers in the integration layer of two functional modules.

And what if you need to provide access to these events to external sites, then you will have to write additional logic for registering such sites and access verification logic.

This webhook module provides access to application and module events and has `CRUD` operations for managing webhooks.

**Module Characteristics**

1. The name is WebhookModule;
2. Scalability - the module does not have the ability to scale, it can only work in a monolith;
3. Is it possible to call `forFeature` - no, since events and handlers are thrown through the `forRoot` options;
4. Does it have its own database - yes, the module comes with migrations and a `Prisma` scheme for generating a client to work with the database;
5. Multitenancy - yes, since the site can work according to the B2B scheme and each new business is a new externalTenantId;
6. Softdelet - no, the softdelet will be connected separately after the completion of the entire project and only where it is really needed, in the future a module will appear to enable and disable database auditing and it will be possible to look at the history of changes by record ids;
7. Other owners of records in the table except externalTenantId - no, the record is common to the entire externalTenantId.

**Tables**

1. `WebhookUser` - table with module users
   1. `id:uuid` - identifier;
   2. `externalTenantId:uuid` - company identifier;
   3. `externalUserId:uuid` is the user ID of the authorization server;
   4. `UserRole:WebhookRole` - user role;
   5. `createdAt:Date` - date of creation;
   6. `updatedAt:Date` is the date of the change.
2. `Webhook` - table with webhooks
   1. `id:uuid` is the identifier;
   2. `eventName:string(512)` is the unique name of the event;
   3. `endpoint:string(512)` is the remote site to which the `POST` request will be sent;
   4. `enabled:boolean` - is the webhook active;
   5. `headers?:JSON` - headers that will be transmitted when sending to a remote site;
   6. `requestTimeout?:number` - do I need to wait for a response from a remote site and the maximum number of milliseconds to wait (by default 5 seconds);
   7. `externalTenantId:uuid` - company ID;
   8. `createdBy:uuid` - who created the record;
   9. `UpdatedBy:uuid` - who updated the record;
   10. `createdAt:Date` - date of creation;
   11. `updatedAt:Date` is the date of the change.
3. `WebhookLog` - table with the history of webhook calls
   1. `id:uuid` - identifier;
   2. `request:JSON` - request to the remote site;
   3. `ResponseStatus:string(20)` - response status of the remote site;
   4. `response?:JSON` - response of the remote site;
   5. `webhookStatus:WebhookStatus` - status;
   6. `webhookId:uuid` - webhook ID;
   7. `externalTenantId:uuid` - company ID;
   8. `createdAt:Date` - date of creation;
   9. `updatedAt:Date` is the date of the change.

**Dictionaries**

1. `WebhookRole` - dictionary of roles
   1. `Admin' - can read/create/change/delete any entities of any externalTenantId;
   2. `User' - can read/create/change/delete any entities of your externalTenantId only.
2. `WebhookStatus` - dictionary of query statuses
   1. `Pending` - in the queue;
   2. `Process` - in processing;
   3. `Success` - successful call;
   4. `Error` - the call returned an error;
   5. `Timeout` - the call did not have time to work out.

**Who can work with the module**

1. Admin - `REST`-a request that has the externalUserId=ID_USER property in the `Request`, which has the Admin role, has full access to all `CRUD` operations (`WebhookController` - at the url `/api/webhook`);
2. User - `REST`-a request that has the externalUserId=ID_USER property in the `Request`, which has the User role, has full access to all `CRUD` operations, but only within its externalTenantId.

### 2. Creating all the necessary empty libraries

Since we will have additional common utilities for working with `Prisma`, we need to create a special library for this.

_Commands_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library prisma-tools --buildable --publishable --directory=libs/core/prisma-tools --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library prisma-tools --buildable --publishable --directory=libs/core/prisma-tools --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/core/prisma-tools/tsconfig.json
CREATE libs/core/prisma-tools/src/index.ts
CREATE libs/core/prisma-tools/tsconfig.lib.json
CREATE libs/core/prisma-tools/README.md
CREATE libs/core/prisma-tools/package.json
CREATE libs/core/prisma-tools/project.json
CREATE libs/core/prisma-tools/.eslintrc.json
UPDATE package.json
CREATE libs/core/prisma-tools/jest.config.ts
CREATE libs/core/prisma-tools/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/core/prisma-tools/src/lib/prisma-tools.configuration.ts
CREATE libs/core/prisma-tools/src/lib/prisma-tools.constants.ts
CREATE libs/core/prisma-tools/src/lib/prisma-tools.environments.ts
CREATE libs/core/prisma-tools/src/lib/prisma-tools.module.ts
```

{% endspoiler %}

In order not to copy similar code from test to test as part of the tests, we will create a library for test utilities.

_Commands_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library testing --buildable --publishable --directory=libs/testing --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library testing --buildable --publishable --directory=libs/testing --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/testing/tsconfig.json
CREATE libs/testing/src/index.ts
CREATE libs/testing/tsconfig.lib.json
CREATE libs/testing/README.md
CREATE libs/testing/package.json
CREATE libs/testing/project.json
CREATE libs/testing/.eslintrc.json
CREATE libs/testing/jest.config.ts
CREATE libs/testing/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/testing/src/lib/testing.configuration.ts
CREATE libs/testing/src/lib/testing.constants.ts
CREATE libs/testing/src/lib/testing.environments.ts
CREATE libs/testing/src/lib/testing.module.ts
```

{% endspoiler %}

In addition to the test and `Prisma` utilities, we will also have common utilities, we will also create our own library for them.

_Commands_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library common --buildable --publishable --directory=libs/common --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library common --buildable --publishable --directory=libs/common --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/common/tsconfig.json
CREATE libs/common/src/index.ts
CREATE libs/common/tsconfig.lib.json
CREATE libs/common/README.md
CREATE libs/common/package.json
CREATE libs/common/project.json
CREATE libs/common/.eslintrc.json
CREATE libs/common/jest.config.ts
CREATE libs/common/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/common/src/lib/common.configuration.ts
CREATE libs/common/src/lib/common.constants.ts
CREATE libs/common/src/lib/common.environments.ts
CREATE libs/common/src/lib/common.module.ts
```

{% endspoiler %}

Now we are creating a business model.

_Commands_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library webhook --buildable --publishable --directory=libs/core/webhook --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library webhook --buildable --publishable --directory=libs/core/webhook --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/core/webhook/tsconfig.json
CREATE libs/core/webhook/src/index.ts
CREATE libs/core/webhook/tsconfig.lib.json
CREATE libs/core/webhook/README.md
CREATE libs/core/webhook/package.json
CREATE libs/core/webhook/project.json
CREATE libs/core/webhook/.eslintrc.json
CREATE libs/core/webhook/jest.config.ts
CREATE libs/core/webhook/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/core/webhook/src/lib/webhook.configuration.ts
CREATE libs/core/webhook/src/lib/webhook.constants.ts
CREATE libs/core/webhook/src/lib/webhook.environments.ts
CREATE libs/core/webhook/src/lib/webhook.module.ts
```

{% endspoiler %}

### 3. Adding a NestJS-mod module for working with migrations and a module for generating a Prisma client

Since for the `@nestjs-mod/prisma` module to work, it is necessary to transfer the module with the generated client to our database, which does not yet exist, then we transfer the `@nestjs-mod/prisma` itself, since it has a stub.

Adding new modules to `apps/server/src/main.ts`.

```typescript
import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod-fullstack/webhook';

// ...

bootstrapNestApplication({
  modules: {
    // ...
    core: [
      // ...
      PrismaModule.forRoot({
        staticConfiguration: {
          schemaFile: join(rootFolder, WEBHOOK_FOLDER, 'src', 'prisma', PRISMA_SCHEMA_FILE),
          featureName: WEBHOOK_FEATURE,
          prismaModule: isInfrastructureMode() ? import(`@nestjs-mod/prisma`) : import(`@nestjs-mod/prisma`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
        },
      }),
    ],
    // ...
    infrastructure: [
      // ...
      DockerComposePostgreSQL.forFeatureAsync({
        featureModuleName: WEBHOOK_FEATURE,
        featureConfiguration: {
          nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
        },
      }),
      Flyway.forRoot({
        staticConfiguration: {
          featureName: WEBHOOK_FEATURE,
          migrationsFolder: join(rootFolder, WEBHOOK_FOLDER, 'src', 'migrations'),
          configFile: join(rootFolder, FLYWAY_JS_CONFIG_FILE),
          nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
        },
      }),
    ],
  },
});
```

We are launching the generation of additional code for infrastructure and customer prism.

_Commands_

```bash
npm run manual:prepare
```

{% spoiler Console output %}

```bash
$ npm run manual:prepare

> @nestjs-mod-fullstack/source@0.0.8 manual:prepare
> npm run generate && npm run docs:infrastructure && npm run test


> @nestjs-mod-fullstack/source@0.0.8 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (12s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (12s)


> @nestjs-mod-fullstack/source@0.0.8 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.8 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.8 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server-e2e:lint (1s)
   ✔  nx run app-angular-rest-sdk:lint (1s)
   ✔  nx run client:lint (1s)
   ✔  nx run server:lint (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (2s)

      With additional flags:
        --fix=true


> @nestjs-mod-fullstack/source@0.0.8 docs:infrastructure
> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source,client* --all -t=serve --parallel=false -- --watch=false --inspect=false


 NX   Running target serve for project server:

- server

With additional flags:
  --watch=false
  --inspect=false

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run server:serve:development --watch=false --inspect=false

chunk (runtime: main) main.js (main) 17 KiB [entry] [rendered]
webpack compiled successfully (f0ad59aa03def552)
[08:58:04.616] INFO (70001): Starting Nest application...
    context: "NestFactory"
[08:58:04.617] INFO (70001): DefaultNestApp dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationInitializerSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationInitializerShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): NestjsPinoLoggerModuleSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): NestjsPinoLoggerModuleShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): TerminusHealthCheckModuleSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): AppModuleSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): AppModuleShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): Pm2Settings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): Pm2Shared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposeSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerCompose dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): FlywayShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportStorage dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportStorageSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerCompose dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): FlywayShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): FlywayShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposeShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportStorageShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationInitializer dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): Flyway dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): Flyway dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): NestjsPinoLoggerModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): TerminusModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): TerminusModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ServeStaticModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): Pm2 dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerCompose dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): Flyway dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): Flyway dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): LoggerModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): TerminusHealthCheckModuleShared dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): TerminusHealthCheckModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.617] INFO (70001): AppModule dependencies initialized
    context: "InstanceLoader"
[08:58:04.637] INFO (70001): TerminusHealthCheckController {/api/health}:
    context: "RoutesResolver"
[08:58:04.639] INFO (70001): Mapped {/api/health, GET} route
    context: "RouterExplorer"
[08:58:04.639] INFO (70001): AppController {/api}:
    context: "RoutesResolver"
[08:58:04.640] INFO (70001): Mapped {/api, GET} route
    context: "RouterExplorer"
[08:58:04.640] INFO (70001): Mapped {/api/demo, POST} route
    context: "RouterExplorer"
[08:58:04.640] INFO (70001): Mapped {/api/demo/:id, GET} route
    context: "RouterExplorer"
[08:58:04.640] INFO (70001): Mapped {/api/demo/:id, DELETE} route
    context: "RouterExplorer"
[08:58:04.641] INFO (70001): Mapped {/api/demo, GET} route
    context: "RouterExplorer"
[08:58:04.642] INFO (70001): Connected to database!
    context: "PrismaClient"
[08:58:04.687] DEBUG (70001):
    0: "SERVER_ROOT_DATABASE_URL: Description='Connection string for PostgreSQL with root credentials (example: postgres://postgres:postgres_password@localhost:5432/postgres?schema=public, username must be \"postgres\")', Original Name='rootDatabaseUrl'"
    1: "SERVER_PORT: Description='The port on which to run the server.', Default='3000', Original Name='port'"
    2: "SERVER_HOSTNAME: Description='Hostname on which to listen for incoming packets.', Original Name='hostname'"
    3: "SERVER_WEBHOOK_DATABASE_URL: Description='Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)', Original Name='databaseUrl'"
    4: "SERVER_WEBHOOK_DATABASE_URL: Description='Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)', Original Name='databaseUrl'"
    context: "All application environments"
[08:58:04.716] INFO (70001): Nest application successfully started
    context: "NestApplication"

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target serve for project server



> @nestjs-mod-fullstack/source@0.0.8 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run app-angular-rest-sdk:test --passWithNoTests


> nx run app-rest-sdk:test --passWithNoTests


> nx run webhook:test --passWithNoTests

 NX   Running target test for 8 projects
   ✔  nx run app-angular-rest-sdk:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 8 projects
   ✔  nx run app-rest-sdk:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


   ✔  nx run webhook:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


   ✔  nx run prisma-tools:test (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


   ✔  nx run testing:test (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


   ✔  nx run common:test (2s)


————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 8 projects

      With additional flags:
        --passWithNoTests=true

   →  Executing 2/2 remaining tasks in parallel...
   ✔  nx run client:test (6s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 8 projects

      With additional flags:
   ✔  nx run server:test (5s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for 8 projects (8s)

      With additional flags:
        --passWithNoTests=true
```

{% endspoiler %}

Now we have generated all the Prisma clients and need to update the import in the file `apps/server/src/main.ts`.

```typescript
import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod-fullstack/webhook';

// ...

bootstrapNestApplication({
  modules: {
    // ...
    core: [
      // ...
      PrismaModule.forRoot({
        staticConfiguration: {
          schemaFile: join(rootFolder, WEBHOOK_FOLDER, 'src', 'prisma', PRISMA_SCHEMA_FILE),
          featureName: WEBHOOK_FEATURE,
          prismaModule: isInfrastructureMode() ? import(`@nestjs-mod/prisma`) : import(`@nestjs-mod-fullstack/webhook`), // <-- update
          addMigrationScripts: false,
          nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
        },
      }),
    ],
  },
});
```

### 4. Adding migrations with the necessary tables and dictionaries

I usually create migration files with my hands using this template: `V%Y%m%d%H%M__New Migration.sql`.

After starting the generation of additional infrastructure code, additional commands for working with migrations appear in the library, the same commands can be run from the scripts of the root `package.json`.

_Commands_

```bash
# create migrations folder
mkdir ./libs/core/webhook/src/migrations
npm run flyway:create:webhook
```

{% spoiler Console output %}

```bash
$ mkdir ./libs/core/webhook/src/migrations
npm rumkdir ./libs/core/webhook/src/migrations

$ npm run flyway:create:webhook

> @nestjs-mod-fullstack/source@0.0.8 flyway:create:webhook
> ./node_modules/.bin/nx run webhook:flyway-create-migration


> nx run webhook:flyway-create-migration

> echo 'select 1;' > ./libs/core/webhook/src/migrations/V`date +%Y%m%d%H%M`__NewMigration.sql


————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-create-migration for project webhook (42ms)


 NX   Nx detected a flaky task

  webhook:flyway-create-migration

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
```

{% endspoiler %}

Rename the new migration from `V202409250909__New Migration.sql` to `V202409250909__Init.sql` and describe the migrations to create all the necessary tables.

```sql
DO $$
BEGIN
    CREATE TYPE "WebhookRole" AS enum(
        'Admin',
        'User'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    CREATE TYPE "WebhookStatus" AS enum(
        'Pending',
        'Process',
        'Success',
        'Error',
        'Timeout'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "WebhookUser"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "externalTenantId" uuid NOT NULL,
    "externalUserId" uuid NOT NULL,
    "userRole" "WebhookRole" NOT NULL,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_WEBHOOK_USER" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_WEBHOOK_USER" ON "WebhookUser"("externalTenantId", "externalUserId");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK_USER__EXTERNAL_TENANT_ID" ON "WebhookUser"("externalTenantId");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK_USER__USER_ROLE" ON "WebhookUser"("externalTenantId", "userRole");

CREATE TABLE IF NOT EXISTS "Webhook"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "eventName" varchar(512) NOT NULL,
    "endpoint" varchar(512) NOT NULL,
    "enabled" boolean NOT NULL,
    "headers" jsonb,
    "requestTimeout" int,
    "externalTenantId" uuid NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_WEBHOOK__CREATED_BY" REFERENCES "WebhookUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_WEBHOOK__UPDATED_BY" REFERENCES "WebhookUser",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_WEBHOOK" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK__EXTERNAL_TENANT_ID" ON "Webhook"("externalTenantId");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK__ENABLED" ON "Webhook"("externalTenantId", "enabled");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK__EVENT_NAME" ON "Webhook"("externalTenantId", "eventName");

CREATE TABLE IF NOT EXISTS "WebhookLog"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "request" jsonb NOT NULL,
    "responseStatus" varchar(20) NOT NULL,
    "response" jsonb,
    "webhookStatus" "WebhookStatus" NOT NULL,
    "webhookId" uuid NOT NULL CONSTRAINT "FK_WEBHOOK__WEBHOOK_ID" REFERENCES "Webhook",
    "externalTenantId" uuid NOT NULL,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_WEBHOOK_LOG" PRIMARY KEY ("id")
);

CREATE INDEX "IDX_WEBHOOK_LOG__EXTERNAL_TENANT_ID" ON "WebhookLog"("externalTenantId");

CREATE INDEX "IDX_WEBHOOK_LOG__WEBHOOK_ID" ON "WebhookLog"("externalTenantId", "webhookId");

CREATE INDEX "IDX_WEBHOOK_LOG__WEBHOOK_STATUS" ON "WebhookLog"("externalTenantId", "webhookStatus");
```

### 5. Adding a new environment variable to all project launch modes and deployment parameters

The infrastructure code generator has created a new empty environment variable to connect to the new database, it must be filled in.

Updating the file `.env` and `example.env`.

```bash
# ...
SERVER_WEBHOOK_DATABASE_URL=postgres://webhook:webhook_password@localhost:5432/webhook?schema=public
# ...
```

Updating the file `.docker/docker-compose-full.env`

```bash
# ...
SERVER_WEBHOOK_DATABASE_URL=postgres://webhook:webhook_password@nestjs-mod-fullstack-postgre-sql:5432/webhook?schema=public
# ...
```

Updating the file `.docker/docker-compose-full.yml`

```yaml
# ...
services:
  # ...
  nestjs-mod-fullstack-postgre-sql-migrations:
    # ...
    environment:
      # ...
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
  nestjs-mod-fullstack-server:
    # ...
    environment:
      # ...
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
```

Updating the file `.github/workflows/docker-compose.workflows.yml`

```yaml
name: 'Docker Compose'
# ...
env:
  # ...
jobs:
  # ...
  deploy:
    environment: docker-compose-full
    # ...
    steps:
      - name: Deploy
        env:
          # ...
          SERVER_WEBHOOK_DATABASE_URL: ${{ secrets.SERVER_WEBHOOK_DATABASE_URL }}
```

Updating the file `.kubernetes/templates/docker-compose-infra.yml`

```yaml
version: '3'
# ...
services:
  # ...
  nestjs-mod-fullstack-postgre-sql-migrations:
    # ...
    environment:
      # ...
      SERVER_WEBHOOK_DATABASE_URL: 'postgres://%SERVER_WEBHOOK_DATABASE_USERNAME%:%SERVER_WEBHOOK_DATABASE_PASSWORD%@nestjs-mod-fullstack-postgre-sql:5432/%SERVER_WEBHOOK_DATABASE_NAME%?schema=public'
```

Updating the file `.kubernetes/templates/server/1.configmap.yaml`

```yaml
apiVersion: v1
# ...
data:
  # ...
  SERVER_WEBHOOK_DATABASE_URL: 'postgres://%SERVER_WEBHOOK_DATABASE_USERNAME%:%SERVER_WEBHOOK_DATABASE_PASSWORD%@10.0.1.1:5432/%SERVER_WEBHOOK_DATABASE_NAME%?schema=public'
```

Updating the file `.github/workflows/kubernetes.yml`

```yaml
name: 'Kubernetes'
# ...
env:
  # ...
jobs:
  # ...
  deploy:
    environment: kubernetes
    # ...
    steps:
      # ...
      - name: Deploy infrastructure
        # ...
        env:
          # ...
          SERVER_WEBHOOK_DATABASE_NAME: ${{ secrets.SERVER_WEBHOOK_DATABASE_NAME }}
          SERVER_WEBHOOK_DATABASE_PASSWORD: ${{ secrets.SERVER_WEBHOOK_DATABASE_PASSWORD }}
          SERVER_WEBHOOK_DATABASE_USERNAME: ${{ secrets.SERVER_WEBHOOK_DATABASE_USERNAME }}
```

Updating the file `.kubernetes/set-env.sh`

```bash
#!/bin/bash
# ...
# server: webhook database
if [ -z "${SERVER_WEBHOOK_DATABASE_PASSWORD}" ]; then
    export SERVER_WEBHOOK_DATABASE_PASSWORD=webhook_password
fi
if [ -z "${SERVER_WEBHOOK_DATABASE_USERNAME}" ]; then
    export SERVER_WEBHOOK_DATABASE_USERNAME=${NAMESPACE}_webhook
fi
if [ -z "${SERVER_WEBHOOK_DATABASE_NAME}" ]; then
    export SERVER_WEBHOOK_DATABASE_NAME=${NAMESPACE}_webhook
fi
```

### 6. We launch the database and apply all migrations

_Commands_

```bash
npm run docker-compose:start-prod:server
npm run db:create-and-fill
```

{% spoiler Console output %}

```bash
$ npm run docker-compose:start-prod:server

> @nestjs-mod-fullstack/source@0.0.8 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

WARN[0000] /home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/docker-compose-prod.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 2/2
 ✔ Network server_server-network  Created                                                                                                                   0.1s
 ✔ Container server-postgre-sql   Started

 $ npm run db:create-and-fill

> @nestjs-mod-fullstack/source@0.0.8 db:create-and-fill
> npm run db:create && npm run flyway:migrate


> @nestjs-mod-fullstack/source@0.0.8 db:create
> ./node_modules/.bin/nx run-many -t=db-create


   ✔  nx run webhook:db-create (750ms)
   ✔  nx run server:db-create (760ms)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target db-create for 2 projects (799ms)


> @nestjs-mod-fullstack/source@0.0.8 flyway:migrate
> ./node_modules/.bin/nx run-many -t=flyway-migrate


   ✔  nx run server:flyway-migrate (2s)
   ✔  nx run webhook:flyway-migrate (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-migrate for 2 projects (2s)
```

{% endspoiler %}

### 7. Let's recreate the Prisma schema using the new database

We update the `libs/core/webhook/src/prisma/schema.prisma` scheme previously created by the Prisma generator, and add an additional dto file generator.

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "binary"
  output   = "../../../../../node_modules/@prisma/webhook-client"

}

datasource db {
  provider          = "postgres"
  url               = env("SERVER_WEBHOOK_DATABASE_URL")
}

generator prismaClassGenerator {
  provider                 = "prisma-class-generator"
  output                   = "../lib/generated/rest/dto"
  dryRun                   = "false"
  separateRelationFields   = "false"
  useNonNullableAssertions = "true"
  makeIndexFile            = "false"
  clientImportPath         = "@prisma/webhook-client"
}
```

Starting the creation of a schema based on an existing database

_Commands_

```bash
npm run prisma:pull
```

{% spoiler Console output %}

```bash
$ npm run prisma:pull

> @nestjs-mod-fullstack/source@0.0.8 prisma:pull
> ./node_modules/.bin/nx run-many -t=prisma-pull


   ✔  nx run server:prisma-pull (583ms)
   ✔  nx run webhook:prisma-pull (609ms)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target prisma-pull for 2 projects (649ms)
```

{% endspoiler %}

Checking the contents of the updated schema `libs/core/webhook/src/prisma/schema.prisma`

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../../../../../node_modules/@prisma/webhook-client"
  engineType = "binary"
}

generator prismaClassGenerator {
  provider                 = "prisma-class-generator"
  output                   = "../lib/generated/rest/dto"
  dryRun                   = "false"
  separateRelationFields   = "false"
  useNonNullableAssertions = "true"
  makeIndexFile            = "false"
  clientImportPath         = "@prisma/webhook-client"
}

datasource db {
  provider = "postgres"
  url      = env("SERVER_WEBHOOK_DATABASE_URL")
}

model Webhook {
  id                                         String       @id(map: "PK_WEBHOOK") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  eventName                                  String       @db.VarChar(512)
  endpoint                                   String       @db.VarChar(512)
  enabled                                    Boolean
  headers                                    Json?
  requestTimeout                             Int?
  externalTenantId                           String       @db.Uuid
  createdBy                                  String       @db.Uuid
  updatedBy                                  String       @db.Uuid
  createdAt                                  DateTime     @default(now()) @db.Timestamp(6)
  updatedAt                                  DateTime     @default(now()) @db.Timestamp(6)
  WebhookUser_Webhook_createdByToWebhookUser WebhookUser  @relation("Webhook_createdByToWebhookUser", fields: [createdBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_WEBHOOK__CREATED_BY")
  WebhookUser_Webhook_updatedByToWebhookUser WebhookUser  @relation("Webhook_updatedByToWebhookUser", fields: [updatedBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_WEBHOOK__UPDATED_BY")
  WebhookLog                                 WebhookLog[]

  @@index([externalTenantId, enabled], map: "IDX_WEBHOOK__ENABLED")
  @@index([externalTenantId, eventName], map: "IDX_WEBHOOK__EVENT_NAME")
  @@index([externalTenantId], map: "IDX_WEBHOOK__EXTERNAL_TENANT_ID")
}

model WebhookLog {
  id               String        @id(map: "PK_WEBHOOK_LOG") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  request          Json
  responseStatus   String        @db.VarChar(20)
  response         Json?
  webhookStatus    WebhookStatus
  webhookId        String        @db.Uuid
  externalTenantId String        @db.Uuid
  createdAt        DateTime      @default(now()) @db.Timestamp(6)
  updatedAt        DateTime      @default(now()) @db.Timestamp(6)
  Webhook          Webhook       @relation(fields: [webhookId], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_WEBHOOK__WEBHOOK_ID")

  @@index([externalTenantId], map: "IDX_WEBHOOK_LOG__EXTERNAL_TENANT_ID")
  @@index([externalTenantId, webhookId], map: "IDX_WEBHOOK_LOG__WEBHOOK_ID")
  @@index([externalTenantId, webhookStatus], map: "IDX_WEBHOOK_LOG__WEBHOOK_STATUS")
}

model WebhookUser {
  id                                     String      @id(map: "PK_WEBHOOK_USER") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  externalTenantId                       String      @db.Uuid
  externalUserId                         String      @db.Uuid
  userRole                               WebhookRole
  createdAt                              DateTime    @default(now()) @db.Timestamp(6)
  updatedAt                              DateTime    @default(now()) @db.Timestamp(6)
  Webhook_Webhook_createdByToWebhookUser Webhook[]   @relation("Webhook_createdByToWebhookUser")
  Webhook_Webhook_updatedByToWebhookUser Webhook[]   @relation("Webhook_updatedByToWebhookUser")

  @@unique([externalTenantId, externalUserId], map: "UQ_WEBHOOK_USER")
  @@index([externalTenantId], map: "IDX_WEBHOOK_USER__EXTERNAL_TENANT_ID")
  @@index([externalTenantId, userRole], map: "IDX_WEBHOOK_USER__USER_ROLE")
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

enum WebhookRole {
  Admin
  User
}

enum WebhookStatus {
  Pending
  Process
  Success
  Error
  Timeout
}

```

### 8. We regenerate the Prisma client, create DTO files and check that they have been successfully created

_Commands_

```bash
npm run prisma:generate
ls libs/core/webhook/src/lib/generated/rest/dto
```

{% spoiler Console output %}

```bash
npm run prisma:generate

> @nestjs-mod-fullstack/source@0.0.8 prisma:generate
> ./node_modules/.bin/nx run-many -t=prisma-generate


   ✔  nx run server:prisma-generate (2s)
   ✔  nx run webhook:prisma-generate (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target prisma-generate for 2 projects (2s)

 $ ls libs/core/webhook/src/lib/generated/rest/dto
migrations.ts  webhook_log.ts  webhook.ts  webhook_user.ts
```

{% endspoiler %}

### 9. Restarting in pm2 development mode

_Commands_

```bash
npm run pm2-full:dev:stop
npm run pm2-full:dev:start
```

{% spoiler Console output %}

```bash
$ npm run pm2-full:dev:stop

> @nestjs-mod-fullstack/source@0.0.8 pm2-full:dev:stop
> npm run docker-compose:stop-prod:server && npm run pm2:dev:stop

> @nestjs-mod-fullstack/source@0.0.8 docker-compose:stop-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down

WARN[0000] /home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/docker-compose-prod.yml: the attribute version is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 2/2
✔ Container server-postgre-sql Removed 0.2s
✔ Network server_server-network Removed 0.1s

> @nestjs-mod-fullstack/source@0.0.8 pm2:dev:stop
> ./node_modules/.bin/pm2 delete all

[PM2][WARN] No process found

$ npm run pm2-full:dev:start

> @nestjs-mod-fullstack/source@0.0.8 pm2-full:dev:start
> npm run generate && npm run docker-compose:start-prod:server && npm run db:create-and-fill && npm run pm2:dev:start

> @nestjs-mod-fullstack/source@0.0.8 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix

✔ nx run webhook:generate (2s)
✔ nx run server:generate (13s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

NX Successfully ran target generate for 2 projects (13s)

> @nestjs-mod-fullstack/source@0.0.8 make-ts-list
> ./node_modules/.bin/rucken make-ts-list

> @nestjs-mod-fullstack/source@0.0.8 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix

> @nestjs-mod-fullstack/source@0.0.8 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json

✔ nx run app-angular-rest-sdk:lint [existing outputs match the cache, left as is]
✔ nx run server-e2e:lint [existing outputs match the cache, left as is]
✔ nx run client:lint [existing outputs match the cache, left as is]
✔ nx run server:lint (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

NX Successfully ran target lint for 4 projects (1s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 3 out of 4 tasks.

> @nestjs-mod-fullstack/source@0.0.8 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

WARN[0000] /home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/docker-compose-prod.yml: the attribute version is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 2/2
✔ Network server_server-network Created 0.1s
✔ Container server-postgre-sql Started 0.3s

> @nestjs-mod-fullstack/source@0.0.8 db:create-and-fill
> npm run db:create && npm run flyway:migrate

> @nestjs-mod-fullstack/source@0.0.8 db:create
> ./node_modules/.bin/nx run-many -t=db-create

✔ nx run server:db-create (747ms)
✔ nx run webhook:db-create (752ms)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

NX Successfully ran target db-create for 2 projects (783ms)

> @nestjs-mod-fullstack/source@0.0.8 flyway:migrate
> ./node_modules/.bin/nx run-many -t=flyway-migrate

✔ nx run server:flyway-migrate (2s)
✔ nx run webhook:flyway-migrate (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

NX Successfully ran target flyway-migrate for 2 projects (2s)

> @nestjs-mod-fullstack/source@0.0.8 pm2:dev:start
> ./node_modules/.bin/pm2 start ./ecosystem.config.json && npm run wait-on -- --log http://localhost:3000/api/health --log http://localhost:4200

[PM2][WARN] Applications server, client not running, starting...
[PM2] App [server] launched (1 instances)
[PM2] App [client] launched (1 instances)
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name │ namespace │ version │ mode │ pid │ uptime │ ↺ │ status │ cpu │ mem │ user │ watching │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 1 │ client │ default │ N/A │ fork │ 183250 │ 0s │ 0 │ online │ 0% │ 18.7mb │ endy │ disabled │
│ 0 │ server │ default │ N/A │ fork │ 183249 │ 0s │ 0 │ online │ 0% │ 25.7mb │ endy │ disabled │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
[PM2][WARN] Current process list is not synchronized with saved list. App nestjs-mod-fullstack differs. Type 'pm2 save' to synchronize.

> @nestjs-mod-fullstack/source@0.0.8 wait-on
> ./node_modules/.bin/wait-on --timeout=240000 --interval=1000 --window --verbose --log http://localhost:3000/api/health --log http://localhost:4200

waiting for 2 resources: http://localhost:3000/api/health, http://localhost:4200
making HTTP(S) head request to url:http://localhost:3000/api/health ...
making HTTP(S) head request to url:http://localhost:4200 ...
HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
HTTP(S) error for http://localhost:4200 Error: connect ECONNREFUSED 127.0.0.1:4200
making HTTP(S) head request to url:http://localhost:3000/api/health ...
making HTTP(S) head request to url:http://localhost:4200 ...
HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
HTTP(S) error for http://localhost:4200 Error: connect ECONNREFUSED 127.0.0.1:4200
making HTTP(S) head request to url:http://localhost:3000/api/health ...
HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to url:http://localhost:4200 ...
making HTTP(S) head request to url:http://localhost:3000/api/health ...
making HTTP(S) head request to url:http://localhost:4200 ...
HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
HTTP(S) result for http://localhost:4200: {
status: 200,
statusText: 'OK',
headers: Object [AxiosHeaders] {
'x-powered-by': 'Express',
'access-control-allow-origin': '_',
'accept-ranges': 'bytes',
'content-type': 'text/html; charset=utf-8',
'content-length': '586',
date: 'Wed, 25 Sep 2024 07:31:04 GMT',
connection: 'keep-alive',
'keep-alive': 'timeout=5'
},
data: ''
}
waiting for 1 resources: http://localhost:3000/api/health
HTTP(S) result for http://localhost:4200: {
status: 200,
statusText: 'OK',
headers: Object [AxiosHeaders] {
'x-powered-by': 'Express',
'access-control-allow-origin': '_',
'accept-ranges': 'bytes',
'content-type': 'text/html; charset=utf-8',
'content-length': '586',
date: 'Wed, 25 Sep 2024 07:31:04 GMT',
connection: 'keep-alive',
'keep-alive': 'timeout=5'
},
data: ''
}
making HTTP(S) head request to url:http://localhost:3000/api/health ...
HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to url:http://localhost:3000/api/health ...
HTTP(S) result for http://localhost:3000/api/health: {
status: 200,
statusText: 'OK',
headers: Object [AxiosHeaders] {
'x-powered-by': 'Express',
vary: 'Origin',
'access-control-allow-credentials': 'true',
'x-request-id': 'd64f5d8c-aab5-4ca1-ac4d-c394fddcabf5',
'cache-control': 'no-cache, no-store, must-revalidate',
'content-type': 'application/json; charset=utf-8',
'content-length': '107',
etag: 'W/"6b-ouXVoNOXyOxnMfI7caewF8/p97A"',
date: 'Wed, 25 Sep 2024 07:31:05 GMT',
connection: 'keep-alive',
'keep-alive': 'timeout=5'
},
data: ''
}
wait-on(183303) complete

```

{% endspoiler %}

### 10. Installing the libraries that will be needed for the module to work

Since the handlers will run the http method, you need to install axis and its NestJS module.

_Commands_

```bash
npm i --save @nestjs/axios axios
```

{% spoiler Console output %}

```bash
$ npm i --save @nestjs/axios axios

added 1 package, removed 2 packages, changed 1 package, and audited 2789 packages in 15s

342 packages are looking for funding
  run `npm fund` for details

32 vulnerabilities (12 moderate, 20 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

{% endspoiler %}

### 11. Deleting unnecessary files from created libraries

The generator creates a typical configuration of the NestJS-mod module, but we don't always need all the created files, so we delete all unnecessary ones.

```bash
rm -rf libs/common/src/lib
rm -rf libs/testing/src/lib
rm -rf libs/core/prisma-tools/src/lib/prisma-tools.configuration.ts
```

### 12. Adding common types that can be reused in other modules

The type with parameters used in the CRUD query of many records.

Creating a file _libs/common/src/lib/types/find-many-args.ts_

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindManyArgs {
  @ApiPropertyOptional({ type: Number })
  curPage?: number;

  @ApiPropertyOptional({ type: Number })
  perPage?: number;

  @ApiPropertyOptional({ type: String })
  searchText?: string;
}
```

The type with additional information returned as a result of the response of the request for many records is passed: the current page and the total number of records.

Creating a file _libs/common/src/lib/types/find-many-response-meta.ts_

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindManyResponseMeta {
  @ApiPropertyOptional({ type: Number })
  curPage?: number;

  @ApiPropertyOptional({ type: Number })
  perPage?: number;

  @ApiProperty({ type: Number })
  totalResults!: number;
}
```

A type for returning the result as a single string when calling various procedures that do not return data.

Creating a file _libs/common/src/lib/types/status-response.ts_

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class StatusResponse {
  @ApiProperty({ type: String })
  message!: string;
}
```

### 13. Adding the "PrismaToolsModule" module with additional utilities for working with Prisma-orm

There are very few utilities at this stage, but as the application expands, there will be more.

**Module environment variables**

Information on how to transfer them can be found in the infrastructure document https://github.com/nestjs-mod/nestjs-mod-fullstack/blob/master/apps/server/INFRASTRUCTURE.MD, using the `hidden: true` option we hide when generating `.env` files.

Example of environment variables:

| Key                      | Description                | Sources                                                                            | Constraints  | Default | Value  |
| ------------------------ | -------------------------- | ---------------------------------------------------------------------------------- | ------------ | ------- | ------ |
| `useFilters`             | Use filters.               | `obj['useFilters']`, `process.env['SERVER_USE_FILTERS']`                           | **optional** | `true`  | `true` |
| `paginationInitialPage`  | Pagination initial page.   | `obj['paginationInitialPage']`, `process.env['SERVER_PAGINATION_INITIAL_PAGE']`    | **optional** | `1`     | `1`    |
| `paginationPerPageSteps` | Pagination per page steps. | `obj['paginationPerPageSteps']`, `process.env['SERVER_PAGINATION_PER_PAGE_STEPS']` | **optional** | -       | -      |
| `paginationPerPage`      | Pagination per page.       | `obj['paginationPerPage']`, `process.env['SERVER_PAGINATION_PER_PAGE']`            | **optional** | `5`     | `5`    |

Updating the file _libs/core/prisma-tools/src/lib/prisma-tools.environments.ts_

```typescript
import { ArrayOfStringTransformer, BooleanTransformer, EnvModel, EnvModelProperty, NumberTransformer } from '@nestjs-mod/common';

@EnvModel()
export class PrismaToolsEnvironments {
  @EnvModelProperty({
    description: 'Use filters.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;

  @EnvModelProperty({
    description: 'Pagination initial page.',
    transform: new NumberTransformer(),
    default: 1,
    hidden: true,
  })
  paginationInitialPage?: number;

  @EnvModelProperty({
    description: 'Pagination per page steps.',
    transform: new ArrayOfStringTransformer(),
    default: [1, 2, 5, 10, 25, 100],
    hidden: true,
  })
  paginationPerPageSteps?: (number | string)[];

  @EnvModelProperty({
    description: 'Pagination per page.',
    transform: new NumberTransformer(),
    default: 5,
    hidden: true,
  })
  paginationPerPage?: number;
}
```

**Class with module errors**

Although at this stage the backend is available as a `REST` service, errors are not inherited from `Http` errors, instead there is a special filter that maps errors.

This class, dictionaries and error descriptions probably shouldn't have been in this module, well, I still haven't figured out where to move them, so in all my projects it all lies also in the `PrismaToolsModule` module.

Creating a file _libs/core/prisma-tools/src/lib/prisma-tools.errors.ts_

```typescript
export enum DatabaseErrorEnum {
  COMMON = 'DB-000',
  UNHANDLED_ERROR = 'DB-001',
  UNIQUE_ERROR = 'DB-002',
  INVALID_IDENTIFIER = 'DB-003',
  INVALID_LINKED_TABLE_IDENTIFIER = 'DB-004',
  DATABASE_QUERY_ERROR = 'DB-005',
  NOT_FOUND_ERROR = 'DB-006',
}

export const DATABASE_ERROR_ENUM_TITLES: Record<DatabaseErrorEnum, string> = {
  [DatabaseErrorEnum.COMMON]: 'Common db error',
  [DatabaseErrorEnum.UNHANDLED_ERROR]: 'Unhandled error',
  [DatabaseErrorEnum.UNIQUE_ERROR]: 'Unique error',
  [DatabaseErrorEnum.INVALID_IDENTIFIER]: 'Invalid identifier',
  [DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER]: 'Invalid linked table identifier',
  [DatabaseErrorEnum.DATABASE_QUERY_ERROR]: 'Database query error',
  [DatabaseErrorEnum.NOT_FOUND_ERROR]: 'Not found error',
};

export class DatabaseError<T = unknown> extends Error {
  code = DatabaseErrorEnum.COMMON;
  metadata?: T;

  constructor(message?: string | DatabaseErrorEnum, code?: DatabaseErrorEnum, metadata?: T) {
    const messageAsCode = Boolean(message && Object.values(DatabaseErrorEnum).includes(message as DatabaseErrorEnum));
    const preparedCode = messageAsCode ? (message as DatabaseErrorEnum) : code;
    const preparedMessage = preparedCode ? DATABASE_ERROR_ENUM_TITLES[preparedCode] : message;

    code = preparedCode || DatabaseErrorEnum.COMMON;
    message = preparedMessage || DATABASE_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
```

**Module Services**

The modules have a service with various utilities, at the moment it has only two functions: converting part of the `Prisma`-orm errors into the format we need and a function for obtaining record offset based on frontend pagination.

Creating a file _libs/core/prisma-tools/src/lib/prisma-tools.service.ts_

```typescript
import { FindManyArgs } from '@nestjs-mod-fullstack/common';
import { ConfigModel } from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';
import { basename } from 'path';
import { PrismaToolsEnvironments } from './prisma-tools.environments';
import { DATABASE_ERROR_ENUM_TITLES, DatabaseErrorEnum } from './prisma-tools.errors';

@ConfigModel()
export class PrismaToolsService {
  private logger = new Logger(PrismaToolsService.name);

  constructor(private readonly prismaToolsEnvironments: PrismaToolsEnvironments) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convertPrismaErrorToDbError(exception: any) {
    try {
      const stacktrace = String(exception?.stack)
        .split(`${__dirname}/webpack:/${basename(__dirname)}/`)
        .join('');
      const originalError = Object.assign(new Error(), { stack: stacktrace });

      if (String(exception?.name).startsWith('PrismaClient') || String(exception?.code).startsWith('P')) {
        if (exception?.code === 'P2002') {
          return {
            message: DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.UNIQUE_ERROR],
            stacktrace,
            code: DatabaseErrorEnum.UNIQUE_ERROR,
            metadata: exception?.meta,
            originalError,
          };
        }

        if (exception?.code === 'P2025') {
          if (exception.meta?.['cause'] === 'Record to update not found.') {
            return {
              message: DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.INVALID_IDENTIFIER],
              stacktrace,
              code: DatabaseErrorEnum.INVALID_IDENTIFIER,
              metadata: exception?.meta,
              originalError,
            };
          }
          const relatedTable = exception.meta?.['cause'].split(`'`)[1];
          this.logger.debug({
            modelName: exception.meta?.['modelName'],
            relatedTable,
          });

          return {
            message: DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER],
            stacktrace,
            code: DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER,
            metadata: exception?.meta,
            originalError,
          };
        }

        this.logger.debug({ ...exception });

        return {
          message: DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.DATABASE_QUERY_ERROR],
          stacktrace,
          code: DatabaseErrorEnum.DATABASE_QUERY_ERROR,
          metadata: exception?.meta,
          originalError,
        };
      } else {
        console.log({ ...exception });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return {
        message: DATABASE_ERROR_ENUM_TITLES[DatabaseErrorEnum.UNHANDLED_ERROR],
        code: DatabaseErrorEnum.UNHANDLED_ERROR,
        metadata: exception?.meta,
      };
    }
    return null;
  }

  getFirstSkipFromCurPerPage(
    args: FindManyArgs,
    defaultOptions?: {
      defaultCurPage: number;
      defaultPerPage: number;
    },
  ): {
    take: number;
    skip: number;
    curPage: number;
    perPage: number;
  } {
    const curPage = +(args.curPage || defaultOptions?.defaultCurPage || this.prismaToolsEnvironments.paginationInitialPage || 1);
    const perPage = +(args.perPage || defaultOptions?.defaultPerPage || this.prismaToolsEnvironments.paginationPerPage || 5);
    const skip = +curPage === 1 ? 0 : +perPage * +curPage - +perPage;

    return { take: perPage, skip, curPage, perPage };
  }
}
```

**Filter for module errors**

As part of the backend application, each module has its own error types, but when sending an error to the frontend, we must convert it into an `Http` error, for such a conversion we create a `PrismaToolsExceptionsFilter`.

Creating a file _libs/core/prisma-tools/src/lib/prisma-tools.filter.ts_

```typescript
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaToolsService } from './prisma-tools.service';
import { PrismaToolsEnvironments } from './prisma-tools.environments';

@Catch()
export class PrismaToolsExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(PrismaToolsExceptionsFilter.name);

  constructor(
    private readonly prismaToolsService: PrismaToolsService,
    private readonly prismaToolsEnvironments: PrismaToolsEnvironments,
  ) {
    super();
  }

  override catch(exception: HttpException, host: ArgumentsHost) {
    if (!this.prismaToolsEnvironments.useFilters) {
      super.catch(exception, host);
      return;
    }
    const parsedException = this.prismaToolsService.convertPrismaErrorToDbError(exception);
    if (parsedException) {
      super.catch(new HttpException(parsedException, HttpStatus.BAD_REQUEST), host);
    } else {
      this.logger.error(exception, exception.stack);
      super.catch(exception, host);
    }
  }
}
```

**NestJS-mod module**

This is a simple module that can take some parameters from environment variables and export the service with utilities to the outside.

Creating a file _libs/core/prisma-tools/src/lib/prisma-tools.module.ts_

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { PRISMA_TOOLS_MODULE } from './prisma-tools.constants';
import { PrismaToolsEnvironments } from './prisma-tools.environments';
import { PrismaToolsService } from './prisma-tools.service';
import { APP_FILTER } from '@nestjs/core';
import { PrismaToolsExceptionsFilter } from './prisma-tools.filter';

export const { PrismaToolsModule } = createNestModule({
  moduleName: PRISMA_TOOLS_MODULE,
  environmentsModel: PrismaToolsEnvironments,
  moduleCategory: NestModuleCategory.core,
  providers: [{ provide: APP_FILTER, useClass: PrismaToolsExceptionsFilter }],
  sharedProviders: [PrismaToolsService],
});
```

### 14. Adding the "WebhookModule" module to work with webhooks

**Module environment variables**

The module has a built-in `Guard` and `Filter`, which can be disabled via environment variables if you want to customize the implementation and then manually bind them to modules or the entire application.

At startup, the module creates a user with the `Admin` role, whose value of the `externalUserId` field is taken from the environment variable.

User identification occurs by searching for the value of the variable `externalUserId` in the `Request`, which means that there must be some kind of guard standing earlier or global, in which the `externalUserId` is determined and set in the `Request`.

In addition to `Request`, there is also an unsafe way to transfer the ID of an external user, for this you can use `Headers`, at this stage of project development this method is enabled by default.

Example of environment variables:

| Key                        | Description                            | Sources                                                                                         | Constraints  | Default | Value                                  |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ | ------- | -------------------------------------- |
| `useGuards`                | Use guards.                            | `obj['useGuards']`, `process.env['SERVER_WEBHOOK_USE_GUARDS']`                                  | **optional** | `true`  | `true`                                 |
| `useFilters`               | Use filters.                           | `obj['useFilters']`, `process.env['SERVER_WEBHOOK_USE_FILTERS']`                                | **optional** | `true`  | `true`                                 |
| `autoCreateUser`           | Auto create user from guard.           | `obj['autoCreateUser']`, `process.env['SERVER_WEBHOOK_AUTO_CREATE_USER']`                       | **optional** | `true`  | `true`                                 |
| `checkHeaders`             | Search tenantId and userId in headers. | `obj['checkHeaders']`, `process.env['SERVER_WEBHOOK_CHECK_HEADERS']`                            | **optional** | `true`  | `true`                                 |
| `skipGuardErrors`          | Skip any guard errors.                 | `obj['skipGuardErrors']`, `process.env['SERVER_WEBHOOK_SKIP_GUARD_ERRORS']`                     | **optional** | `false` | `false`                                |
| `superAdminExternalUserId` | User ID with super admin role.         | `obj['superAdminExternalUserId']`, `process.env['SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID']` | **optional** | -       | `248ec37f-628d-43f0-8de2-f58da037dd0f` |

Updating the file _libs/core/webhook/src/lib/webhook.environments.ts_

```typescript
import { BooleanTransformer, EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class WebhookEnvironments {
  @EnvModelProperty({
    description: 'Use guards.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useGuards?: boolean;

  @EnvModelProperty({
    description: 'Use filters.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;

  @EnvModelProperty({
    description: 'Auto create user from guard.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  autoCreateUser?: boolean;

  @EnvModelProperty({
    description: 'Search tenantId and userId in headers.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  checkHeaders?: boolean;

  @EnvModelProperty({
    description: 'Skip any guard errors.',
    transform: new BooleanTransformer(),
    default: false,
    hidden: true,
  })
  skipGuardErrors?: boolean;

  @EnvModelProperty({
    description: 'User ID with super admin role.',
  })
  superAdminExternalUserId?: string;
}
```

**Module configuration**

Environment variables can be changed from stand to stand, but there are also settings that are set when building the application, they are the same between all stands.

These settings include the types of events that can be sent as webhooks, as well as the names of the header keys to identify the current user or the current company.

Updating the file _libs/core/webhook/src/lib/webhook.configuration.ts_

```typescript
import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { WebhookEvent } from './types/webhook-event-object';

@ConfigModel()
export class WebhookConfiguration {
  @ConfigModelProperty({
    description: 'List of available events.',
  })
  events!: WebhookEvent[];

  @ConfigModelProperty({
    description: 'The name of the header key that stores the external user ID.',
    default: 'x-external-user-id',
  })
  externalUserIdHeaderName?: string;

  @ConfigModelProperty({
    description: 'The name of the header key that stores the external tenant ID.',
    default: 'x-external-tenant-id',
  })
  externalTenantIdHeaderName?: string;
}
```

**Class with module errors**

Since at this stage the project is being developed as a `REST` backend, which is available on the frontend as an `OpenAPI` library, the class with errors is also published in the `Swagger` schema.

In order for the error description to be more detailed, it uses decorators that add meta information that will be output to the `Swagger` schema.

Creating a file _libs/core/webhook/src/lib/webhook.errors.ts_

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WebhookErrorEnum {
  COMMON = 'WEBHOOK-000',
  FORBIDDEN = 'WEBHOOK-001',
  EXTERNAL_USER_ID_NOT_SET = 'WEBHOOK-002',
  EXTERNAL_TENANT_ID_NOT_SET = 'WEBHOOK-003',
  USER_NOT_FOUND = 'WEBHOOK-004',
  EVENT_NOT_FOUND = 'WEBHOOK-005',
}

export const WEBHOOK_ERROR_ENUM_TITLES: Record<WebhookErrorEnum, string> = {
  [WebhookErrorEnum.COMMON]: 'Webhook error',
  [WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET]: 'Tenant ID not set',
  [WebhookErrorEnum.EXTERNAL_USER_ID_NOT_SET]: 'User ID not set',
  [WebhookErrorEnum.FORBIDDEN]: 'Forbidden',
  [WebhookErrorEnum.USER_NOT_FOUND]: 'User not found',
  [WebhookErrorEnum.EVENT_NOT_FOUND]: 'Event not found',
};

export class WebhookError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(WEBHOOK_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: WEBHOOK_ERROR_ENUM_TITLES[WebhookErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: WebhookErrorEnum,
    enumName: 'WebhookErrorEnum',
    example: WebhookErrorEnum.COMMON,
  })
  code = WebhookErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(message?: string | WebhookErrorEnum, code?: WebhookErrorEnum, metadata?: T) {
    const messageAsCode = Boolean(message && Object.values(WebhookErrorEnum).includes(message as WebhookErrorEnum));
    const preparedCode = messageAsCode ? (message as WebhookErrorEnum) : code;
    const preparedMessage = preparedCode ? WEBHOOK_ERROR_ENUM_TITLES[preparedCode] : message;

    code = preparedCode || WebhookErrorEnum.COMMON;
    message = preparedMessage || WEBHOOK_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
```

**Types used**

All available types of events that will be sent via webhooks should be described when connecting the module via the `WebhookModule.forRoot()`, since this list will be displayed on the frontend when creating webhooks.

In the `example` property, you need to pass an example of an object that we will send via webhook.

Creating a file _libs/core/webhook/src/lib/types/webhook-event-object.ts_

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class WebhookEvent {
  @ApiProperty({ type: String })
  eventName!: string;

  @ApiProperty({ type: String })
  description!: string;

  @ApiProperty({ type: Object })
  example!: object;
}
```

Information about all sent events is recorded in the `WebhookLog` table, its generated `DTO` contains fields that we set ourselves in the backend, so we create a new `DTO` based on the generated one and remove these fields.

We also create a `DTO` to form a response to the `CRUD` operation of reading many records.

Creating a file _libs/core/webhook/src/lib/types/webhook-log-object.ts_

```typescript
import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { WebhookLog } from '../generated/rest/dto/webhook_log';

export class WebhookLogObject extends OmitType(WebhookLog, ['id', 'externalTenantId', 'createdAt', 'updatedAt', 'Webhook', 'webhookId']) {}

export class FindManyWebhookLogResponse {
  @ApiProperty({ type: () => [WebhookLogObject] })
  webhookLogs!: WebhookLogObject[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
```

Some of the fields for the `Webhook` entity are exposed and checked on the backend. therefore, we create new `DTO` for interaction with the front based on the `DTO` generated from the database.

Creating a file _libs/core/webhook/src/lib/types/webhook-object.ts_

```typescript
import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Webhook } from '../generated/rest/dto/webhook';

export class WebhookObject extends OmitType(Webhook, ['externalTenantId', 'WebhookLog', 'WebhookUser_Webhook_createdByToWebhookUser', 'WebhookUser_Webhook_updatedByToWebhookUser', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy']) {}

export class CreateWebhookArgs extends OmitType(Webhook, ['id', 'externalTenantId', 'WebhookLog', 'WebhookUser_Webhook_createdByToWebhookUser', 'WebhookUser_Webhook_updatedByToWebhookUser', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy']) {}

export class UpdateWebhookArgs extends PartialType(OmitType(Webhook, ['id', 'externalTenantId', 'WebhookLog', 'WebhookUser_Webhook_createdByToWebhookUser', 'WebhookUser_Webhook_updatedByToWebhookUser', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'])) {}

export class FindManyWebhookResponse {
  @ApiProperty({ type: () => [WebhookObject] })
  webhooks!: WebhookObject[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
```

The `WebhookUser` entity, which is editable by admins, also needs to be limited by available fields.

Creating a file _libs/core/webhook/src/lib/types/webhook-user-object.ts_

```typescript
import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { WebhookUser } from '../generated/rest/dto/webhook_user';

export class WebhookUserObject extends OmitType(WebhookUser, ['Webhook_Webhook_createdByToWebhookUser', 'Webhook_Webhook_updatedByToWebhookUser', 'createdAt', 'updatedAt']) {}

export class UpdateWebhookUserArgs extends PartialType(OmitType(WebhookUser, ['id', 'externalUserId', 'externalTenantId', 'createdAt', 'updatedAt', 'Webhook_Webhook_createdByToWebhookUser', 'Webhook_Webhook_updatedByToWebhookUser'])) {}

export class FindManyWebhookUserResponse {
  @ApiProperty({ type: () => [WebhookUserObject] })
  webhookUsers!: WebhookUserObject[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
```

The module has its own `Guard` that checks for the presence of the user and company ID in the `Request` property or in the `Headers` and also adds the `webhookUser` property in which it stores the created user of the module.

The feature modules that I create always have a table with users, since they can be moved to a separate microservice and a separate database at any time.

Creating a file _libs/core/webhook/src/lib/types/webhook-request.ts_

```typescript
import { WebhookUser } from '../generated/rest/dto/webhook_user';

export type WebhookRequest = {
  webhookUser?: Omit<WebhookUser, 'Webhook_Webhook_createdByToWebhookUser' | 'Webhook_Webhook_updatedByToWebhookUser'> | null;
  externalUserId: string;
  externalTenantId: string;
  headers: Record<string, string>;
};
```

**Module Decorators**

The `SkipWebhookGuard` decorator is needed to exclude the controller method or the entire controller from the`Guard` check.

The `CheckWebhookRole` decorator starts checking the user's role availability.

The decorators `CurrentWebhookRequest` and `CurrentWebhookUser` are used to get information from the Request.

Creating a file _libs/core/webhook/src/lib/webhook.decorators.ts_

```typescript
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WebhookRequest } from './types/webhook-request';
import { WebhookRole } from '@prisma/webhook-client';

export const SkipWebhookGuard = Reflector.createDecorator<true>();
export const CheckWebhookRole = Reflector.createDecorator<WebhookRole[]>();

export const CurrentWebhookRequest = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = getRequestFromExecutionContext(ctx) as WebhookRequest;
  return req;
});

export const CurrentWebhookUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = getRequestFromExecutionContext(ctx) as WebhookRequest;
  return req.webhookUser;
});
```

**Module controllers**

The main controller of the entire module is the `WebhookController`, it has `CRUD` operations to work with the `Webhook` entity, as well as the `profile` method to get the current user of the module.

The controller also has a `findManyLogs` method that returns the history of sent events.

The controller is available to the `Admin` and `User` roles, users with the `Admin` role can see and modify the webhooks of all companies, users with the `User` role can only see their own webhooks.

Creating a file _libs/core/webhook/src/lib/controllers/webhook.controller.ts_

```typescript
import { FindManyArgs, StatusResponse } from '@nestjs-mod-fullstack/common';

import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { WebhookUser } from '../generated/rest/dto/webhook_user';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { WebhookEvent } from '../types/webhook-event-object';
import { FindManyWebhookLogResponse } from '../types/webhook-log-object';
import { CreateWebhookArgs, FindManyWebhookResponse, UpdateWebhookArgs, WebhookObject } from '../types/webhook-object';
import { WebhookRequest } from '../types/webhook-request';
import { WebhookUserObject } from '../types/webhook-user-object';
import { WebhookConfiguration } from '../webhook.configuration';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import { CheckWebhookRole, CurrentWebhookRequest, CurrentWebhookUser } from '../webhook.decorators';
import { WebhookError } from '../webhook.errors';

@ApiExtraModels(WebhookError)
@ApiBadRequestResponse({
  schema: { allOf: refs(WebhookError) },
})
@ApiTags('webhook')
@CheckWebhookRole([WebhookRole.User, WebhookRole.Admin])
@Controller('/webhook')
export class WebhookController {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly webhookToolsService: WebhookToolsService,
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: WebhookUserObject })
  async profile(@CurrentWebhookUser() webhookUser: WebhookUser) {
    return webhookUser;
  }

  @Get('events')
  @ApiOkResponse({ type: WebhookEvent, isArray: true })
  async events() {
    return this.webhookConfiguration.events;
  }

  @Get()
  @ApiOkResponse({ type: FindManyWebhookResponse })
  async findMany(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Query() args: FindManyArgs) {
    const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
      curPage: args.curPage,
      perPage: args.perPage,
    });
    const searchText = args.searchText;

    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        webhooks: await prisma.webhook.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }, { externalTenantId: { equals: searchText } }] : []),
                    { endpoint: { contains: searchText, mode: 'insensitive' } },
                    {
                      eventName: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
          },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
        }),
        totalResults: await prisma.webhook.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }, { externalTenantId: { equals: searchText } }] : []),
                    { endpoint: { contains: searchText, mode: 'insensitive' } },
                    {
                      eventName: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
          },
        }),
      };
    });
    return {
      webhooks: result.webhooks,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: WebhookObject })
  async createOne(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Body() args: CreateWebhookArgs) {
    return await this.prismaClient.webhook.create({
      data: {
        ...args,
        WebhookUser_Webhook_createdByToWebhookUser: {
          connect: { id: webhookUser.id },
        },
        WebhookUser_Webhook_updatedByToWebhookUser: {
          connect: { id: webhookUser.id },
        },
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: WebhookObject })
  async updateOne(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string, @Body() args: UpdateWebhookArgs) {
    return await this.prismaClient.webhook.update({
      data: { ...args },
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
      },
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.prismaClient.webhook.delete({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
      },
    });
    return { message: 'ok' };
  }

  @Get(':id')
  @ApiOkResponse({ type: WebhookObject })
  async findOne(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return await this.prismaClient.webhook.findFirstOrThrow({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
      },
    });
  }

  @Get(':id/logs')
  @ApiOkResponse({ type: FindManyWebhookLogResponse, isArray: true })
  async findManyLogs(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string, @Query() args: FindManyArgs) {
    const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
      curPage: args.curPage,
      perPage: args.perPage,
    });
    const searchText = args.searchText;
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        webhookLogs: await prisma.webhookLog.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }, { externalTenantId: { equals: searchText } }, { webhookId: { equals: searchText } }] : []),
                    { response: { string_contains: searchText } },
                    { request: { string_contains: searchText } },
                    {
                      responseStatus: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
            webhookId: id,
          },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
        }),
        totalResults: await prisma.webhookLog.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }, { externalTenantId: { equals: searchText } }, { webhookId: { equals: searchText } }] : []),
                    { response: { string_contains: searchText } },
                    { request: { string_contains: searchText } },
                    {
                      responseStatus: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                  ],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
            webhookId: id,
          },
        }),
      };
    });
    return {
      webhookLogs: result.webhookLogs,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }
}
```

The `WebhookUsersController` controller is only available to the `Admin` role, this controller has `CRUD` methods for displaying all users and methods for updating and deleting module users.

Creating a file _libs/core/webhook/src/lib/controllers/webhook-users.controller.ts_

```typescript
import { FindManyArgs, StatusResponse } from '@nestjs-mod-fullstack/common';

import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { WebhookUser } from '../generated/rest/dto/webhook_user';
import { WebhookToolsService } from '../services/webhook-tools.service';
import { WebhookRequest } from '../types/webhook-request';
import { FindManyWebhookUserResponse, UpdateWebhookUserArgs, WebhookUserObject } from '../types/webhook-user-object';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import { CheckWebhookRole, CurrentWebhookRequest, CurrentWebhookUser } from '../webhook.decorators';
import { WebhookError } from '../webhook.errors';

@ApiExtraModels(WebhookError)
@ApiBadRequestResponse({
  schema: { allOf: refs(WebhookError) },
})
@ApiTags('webhook')
@CheckWebhookRole([WebhookRole.Admin])
@Controller('/webhook/users')
export class WebhookUsersController {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly webhookToolsService: WebhookToolsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyWebhookUserResponse })
  async findMany(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Query() args: FindManyArgs) {
    const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
      curPage: args.curPage,
      perPage: args.perPage,
    });
    const searchText = args.searchText;
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        webhookUsers: await prisma.webhookUser.findMany({
          where: {
            ...(isUUID(searchText)
              ? {
                  OR: [{ id: { equals: searchText } }, { externalTenantId: { equals: searchText } }, { externalUserId: { equals: searchText } }],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
          },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
        }),
        totalResults: await prisma.webhookUser.count({
          where: {
            ...(isUUID(searchText)
              ? {
                  OR: [{ id: { equals: searchText } }, { externalTenantId: { equals: searchText } }, { externalUserId: { equals: searchText } }],
                }
              : {}),
            ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
          },
        }),
      };
    });
    return {
      webhookUsers: result.webhookUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Put(':id')
  @ApiOkResponse({ type: WebhookUserObject })
  async updateOne(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string, @Body() args: UpdateWebhookUserArgs) {
    return await this.prismaClient.webhookUser.update({
      data: { ...args },
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
      },
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.prismaClient.webhookUser.delete({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
      },
    });
    return { message: 'ok' };
  }

  @Get(':id')
  @ApiOkResponse({ type: WebhookUserObject })
  async findOne(@CurrentWebhookRequest() webhookRequest: WebhookRequest, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return await this.prismaClient.webhookUser.findFirstOrThrow({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookRequest.externalTenantId),
      },
    });
  }
}
```

**Module Services**

Events are sent from the code using the `sendEvent` method of the `WebhookService` service.

Creating a file _libs/core/webhook/src/lib/services/webhook.service.ts_

```typescript
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { WebhookConfiguration } from '../webhook.configuration';
import { WebhookError, WebhookErrorEnum } from '../webhook.errors';

@Injectable()
export class WebhookService<TEventName extends string = string, TEventBody = object> {
  events$ = new Subject<{
    eventName: TEventName;
    eventBody: TEventBody;
  }>();

  constructor(private readonly webhookConfiguration: WebhookConfiguration) {}

  async sendEvent(eventName: TEventName, eventBody: TEventBody) {
    const event = this.webhookConfiguration.events.find((e) => e.eventName === eventName);
    if (!event) {
      throw new WebhookError(WebhookErrorEnum.EVENT_NOT_FOUND);
    }
    this.events$.next({ eventName, eventBody });
  }
}
```

The module also has a service with additional utilities, the service is available only within the services and controllers of this module.

Creating a file _libs/core/webhook/src/lib/services/webhook-tools.service.ts_

```typescript
import { Injectable } from '@nestjs/common';
import { WebhookUser } from '../generated/rest/dto/webhook_user';

@Injectable()
export class WebhookToolsService {
  externalTenantIdQuery(
    webhookUser: Pick<WebhookUser, 'userRole' | 'externalTenantId'> | null,
    externalTenantId: string,
  ): {
    externalTenantId: string;
  } {
    const q =
      webhookUser?.userRole === 'User'
        ? {
            externalTenantId: webhookUser.externalTenantId,
          }
        : { externalTenantId };
    if (!q.externalTenantId) {
      return {} as {
        externalTenantId: string;
      };
    }
    return q;
  }
}
```

Event processing occurs asynchronously in the `WebhookServiceBootstrap` service, listening for new events starts after the application starts, various module parameters are also created in this service at startup.

Creating a file _libs/core/webhook/src/lib/services/webhook-bootstrap.service.ts_

```typescript
import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/webhook-client';
import { AxiosHeaders } from 'axios';
import { randomUUID } from 'crypto';
import { concatMap, firstValueFrom, Subscription, timeout, TimeoutError } from 'rxjs';
import { WebhookConfiguration } from '../webhook.configuration';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import { WebhookEnvironments } from '../webhook.environments';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookServiceBootstrap implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(WebhookServiceBootstrap.name);
  private eventsRef?: Subscription;

  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookEnvironments: WebhookEnvironments,
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly httpService: HttpService,
    private readonly webhookService: WebhookService,
  ) {}

  onModuleDestroy() {
    if (this.eventsRef) {
      this.eventsRef.unsubscribe();
      this.eventsRef = undefined;
    }
  }

  async onApplicationBootstrap() {
    if (isInfrastructureMode()) {
      return;
    }

    await this.createDefaultUsers();

    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    this.eventsRef = this.webhookService.events$
      .pipe(
        concatMap(async ({ eventName, eventBody }) => {
          this.logger.debug({ eventName, eventBody });

          const webhooks = await this.prismaClient.webhook.findMany({
            where: { eventName: { contains: eventName }, enabled: true },
          });

          for (const webhook of webhooks) {
            const webhookLog = await this.prismaClient.webhookLog.create({
              data: {
                externalTenantId: webhook.externalTenantId,
                request: eventBody as object,
                responseStatus: '',
                webhookStatus: 'Pending',
                response: {},
                webhookId: webhook.id,
              },
            });
            try {
              await this.prismaClient.webhookLog.update({
                where: { id: webhookLog.id },
                data: { webhookStatus: 'Process' },
              });
              const request = await firstValueFrom(
                this.httpService
                  .post(webhook.endpoint, eventBody, {
                    ...(webhook.headers
                      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        { headers: new AxiosHeaders(webhook.headers as any) }
                      : {}),
                  })
                  .pipe(timeout(webhook.requestTimeout || 5000)),
              );
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let response: any, responseStatus: string;
              try {
                response = request.data;
                responseStatus = request.statusText;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err: any) {
                response = String(err.message);
                responseStatus = 'unhandled';
              }
              await this.prismaClient.webhookLog.update({
                where: { id: webhookLog.id },
                data: { responseStatus, response, webhookStatus: 'Success' },
              });
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let response: any, responseStatus: string;
              try {
                response = err.response?.data || String(err.message);
                responseStatus = err.response?.statusText;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err2: any) {
                response = String(err2.message);
                responseStatus = 'unhandled';
              }
              try {
                await this.prismaClient.webhookLog.update({
                  where: { id: webhookLog.id },
                  data: {
                    responseStatus,
                    response,
                    webhookStatus: err instanceof TimeoutError ? 'Timeout' : 'Error',
                  },
                });
              } catch (err) {
                //
              }
            }
          }
        }),
      )
      .subscribe();
  }

  private async createDefaultUsers() {
    try {
      if (this.webhookEnvironments.superAdminExternalUserId) {
        const existsUser = await this.prismaClient.webhookUser.findFirst({
          where: {
            externalUserId: this.webhookEnvironments.superAdminExternalUserId,
            userRole: 'Admin',
          },
        });
        if (!existsUser) {
          await this.prismaClient.webhookUser.create({
            data: {
              externalTenantId: randomUUID(),
              externalUserId: this.webhookEnvironments.superAdminExternalUserId,
              userRole: 'Admin',
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
    }
  }
}
```

**Filter for module errors**

To convert module errors to an `Http` error, create a `WebhookExceptionsFilter`.

Creating a file _libs/core/webhook/src/lib/webhook.filter.ts_

```typescript
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WebhookError } from './webhook.errors';

@Catch()
export class WebhookExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(WebhookExceptionsFilter.name);

  override catch(exception: WebhookError | HttpException, host: ArgumentsHost) {
    if (exception instanceof WebhookError) {
      super.catch(
        new HttpException(
          {
            code: exception.code,
            message: exception.message,
            metadata: exception.metadata,
          },
          HttpStatus.BAD_REQUEST,
        ),
        host,
      );
    } else {
      this.logger.error(exception, exception.stack);
      super.catch(exception, host);
    }
  }
}
```

**Module Defender**

The verification and creation of users takes place in `WebhookGuard`, in addition, the roles of the module users are also checked here.

Creating a file _libs/core/webhook/src/lib/webhook.guard.ts_

```typescript
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import { isUUID } from 'class-validator';
import { WebhookRequest } from './types/webhook-request';
import { WebhookConfiguration } from './webhook.configuration';
import { WEBHOOK_FEATURE } from './webhook.constants';
import { CheckWebhookRole, SkipWebhookGuard } from './webhook.decorators';
import { WebhookEnvironments } from './webhook.environments';
import { WebhookError, WebhookErrorEnum } from './webhook.errors';

@Injectable()
export class WebhookGuard implements CanActivate {
  private logger = new Logger(WebhookGuard.name);

  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly reflector: Reflector,
    private readonly webhookEnvironments: WebhookEnvironments,
    private readonly webhookConfiguration: WebhookConfiguration,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const { skipWebhookGuard, checkWebhookRole } = this.getHandlersReflectMetadata(context);

      if (skipWebhookGuard) {
        return true;
      }

      const req = this.getRequestFromExecutionContext(context);
      const externalUserId = this.getExternalUserIdFromRequest(req);
      const externalTenantId = this.getExternalTenantIdFromRequest(req);

      await this.tryGetCurrentSuperAdminUserWithExternalUserId(req, externalUserId);
      await this.tryGetOrCreateCurrentUserWithExternalUserId(req, externalTenantId, externalUserId);

      this.throwErrorIfCurrentUserNotSet(req);
      this.throwErrorIfCurrentUserNotHaveNeededRoles(checkWebhookRole, req);
    } catch (err) {
      this.throwAllGuardErrorsIfItNeeded(err);
    }
    return true;
  }

  private throwAllGuardErrorsIfItNeeded(err: unknown) {
    if (!this.webhookEnvironments.skipGuardErrors) {
      throw err;
    } else {
      this.logger.error(err, (err as Error).stack);
    }
  }

  private throwErrorIfCurrentUserNotHaveNeededRoles(checkWebhookRole: WebhookRole[] | undefined, req: WebhookRequest) {
    if (checkWebhookRole && req.webhookUser && !checkWebhookRole?.includes(req.webhookUser.userRole)) {
      throw new WebhookError(WebhookErrorEnum.FORBIDDEN);
    }
  }

  private throwErrorIfCurrentUserNotSet(req: WebhookRequest) {
    if (!req.webhookUser) {
      throw new WebhookError(WebhookErrorEnum.USER_NOT_FOUND);
    }
  }

  private async tryGetOrCreateCurrentUserWithExternalUserId(req: WebhookRequest, externalTenantId: string | undefined, externalUserId: string) {
    if (!req.webhookUser) {
      if (!externalTenantId || !isUUID(externalTenantId)) {
        throw new WebhookError(WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET);
      }
      if (this.webhookEnvironments.autoCreateUser) {
        req.webhookUser = await this.prismaClient.webhookUser.upsert({
          create: { externalTenantId, externalUserId, userRole: 'User' },
          update: {},
          where: {
            externalTenantId_externalUserId: {
              externalTenantId,
              externalUserId,
            },
          },
        });
      } else {
        req.webhookUser = await this.prismaClient.webhookUser.findFirst({
          where: {
            externalTenantId,
            externalUserId,
          },
        });
      }
    }
  }

  private async tryGetCurrentSuperAdminUserWithExternalUserId(req: WebhookRequest, externalUserId: string) {
    if (this.webhookEnvironments.superAdminExternalUserId) {
      req.webhookUser = await this.prismaClient.webhookUser.findFirst({
        where: {
          AND: [
            { externalUserId },
            {
              externalUserId: this.webhookEnvironments.superAdminExternalUserId,
            },
          ],
          userRole: 'Admin',
        },
      });
    }
  }

  private getExternalTenantIdFromRequest(req: WebhookRequest) {
    const externalTenantId = req.externalTenantId || this.webhookEnvironments.checkHeaders ? this.webhookConfiguration.externalTenantIdHeaderName && req.headers?.[this.webhookConfiguration.externalTenantIdHeaderName] : undefined;
    if (externalTenantId) {
      req.externalTenantId = externalTenantId;
    }
    return externalTenantId;
  }

  private getExternalUserIdFromRequest(req: WebhookRequest) {
    const externalUserId = req.externalUserId || this.webhookEnvironments.checkHeaders ? this.webhookConfiguration.externalUserIdHeaderName && req.headers?.[this.webhookConfiguration.externalUserIdHeaderName] : undefined;
    if (externalUserId) {
      req.externalUserId = externalUserId;
    }

    if (!externalUserId || !isUUID(externalUserId)) {
      throw new WebhookError(WebhookErrorEnum.EXTERNAL_USER_ID_NOT_SET);
    }
    return externalUserId;
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as WebhookRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const skipWebhookGuard = (typeof context.getHandler === 'function' && this.reflector.get(SkipWebhookGuard, context.getHandler())) || (typeof context.getClass === 'function' && this.reflector.get(SkipWebhookGuard, context.getClass())) || undefined;

    const checkWebhookRole = (typeof context.getHandler === 'function' && this.reflector.get(CheckWebhookRole, context.getHandler())) || (typeof context.getClass === 'function' && this.reflector.get(CheckWebhookRole, context.getClass())) || undefined;
    return { skipWebhookGuard, checkWebhookRole };
  }
}
```

**NestJS-mod module**

Unlike `PrismaToolsModule` (example: SERVER_USE_FILTERS), the environment variables of the current module will have a prefix (example: SERVER_WEBHOOK_USE_FILTERS), this is done by overriding `getFeatureDotEnvPropertyNameFormatter`.

Turning off the `Guard` and `Filter` on the controllers occurs by wrapping them in special decorators when the module is connected.

Creating a file _libs/core/webhook/src/lib/webhook.module.ts_

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
import { WebhookService } from './services/webhook.service';
import { WebhookConfiguration } from './webhook.configuration';
import { WEBHOOK_FEATURE, WEBHOOK_MODULE } from './webhook.constants';
import { WebhookEnvironments } from './webhook.environments';
import { WebhookExceptionsFilter } from './webhook.filter';
import { WebhookGuard } from './webhook.guard';
import { WebhookToolsService } from './services/webhook-tools.service';

export const { WebhookModule } = createNestModule({
  moduleName: WEBHOOK_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: WebhookEnvironments,
  staticConfigurationModel: WebhookConfiguration,
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
  providers: [WebhookToolsService, WebhookServiceBootstrap],
  controllers: [WebhookUsersController, WebhookController],
  sharedProviders: [WebhookService],
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
    const staticConfiguration = current.staticConfiguration as WebhookConfiguration;

    for (const ctrl of [WebhookController, WebhookUsersController]) {
      if (staticEnvironments.useFilters) {
        UseFilters(WebhookExceptionsFilter)(ctrl);
      }
      if (staticEnvironments.useGuards) {
        UseGuards(WebhookGuard)(ctrl);
      }
      if (staticEnvironments.checkHeaders && staticConfiguration.externalUserIdHeaderName && staticConfiguration.externalTenantIdHeaderName) {
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

### 15. We add the "WebhookModule" and "PrismaToolsModule" modules to the start file of the project and pass the necessary parameters to them

Updating the file _apps/server/src/main.ts_

```typescript
import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import {
  WEBHOOK_FEATURE,
  WEBHOOK_FOLDER,
  WebhookModule,
} from '@nestjs-mod-fullstack/webhook';

// ...

bootstrapNestApplication({
  modules: {
    // ...
    core: [
      PrismaToolsModule.forRoot(),
      PrismaModule.forRoot({
        contextName: appFeatureName,
        staticConfiguration: {
          featureName: appFeatureName,
          schemaFile: join(
            appFolder,
            'src',
            'prisma',
            `${appFeatureName}-${PRISMA_SCHEMA_FILE}`
          ),
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@prisma/app-client`),
          addMigrationScripts: false,
        },
      }),
      PrismaModule.forRoot({
        contextName: WEBHOOK_FEATURE,
        staticConfiguration: {
          featureName: WEBHOOK_FEATURE,
          schemaFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            'src',
            'prisma',
            PRISMA_SCHEMA_FILE
          ),
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@prisma/webhook-client`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),
        },
      }),
    ],
    feature: [
      AppModule.forRoot(),
      WebhookModule.forRoot({
        staticConfiguration: {
          events: ['create', 'update', 'delete'].map((key) => ({
            eventName: `app-demo.${key}`,
            description: `${key}`,
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          })),
        },
      }),
    ],
  })
```

### 16. Adding the "Web hook Module.forFeature()" to the application module "AppModule" so that the module's services can run webhooks

Updating the file _apps/server/src/app/app.module.ts_

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from '@nestjs-mod-fullstack/webhook';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    WebhookModule.forFeature({
      featureModuleName: 'app',
    }),
    PrismaModule.forFeature({
      contextName: 'app',
      featureModuleName: 'app',
    }),
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'browser'),
          }),
        ]),
  ],
  controllers: [AppController],
  providers: [AppService],
});
```

### 17. We add the "WebhookService" service to the "AppController" controller and call the "sendEvent" method for the data we want to send via webhooks

Updating the file _apps/server/src/app/app.controller.ts_

```typescript
import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';

import { WebhookService } from '@nestjs-mod-fullstack/webhook';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { ApiCreatedResponse, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
import { AppDemo } from './generated/rest/dto/app_demo';

export class AppData {
  @ApiProperty({ type: String })
  message!: string;
}

enum AppDemoEventName {
  'app-demo.create' = 'app-demo.create',
  'app-demo.update' = 'app-demo.update',
  'app-demo.delete' = 'app-demo.delete',
}

@Controller()
export class AppController {
  constructor(
    @InjectPrismaClient('app')
    private readonly appPrismaClient: AppPrismaClient,
    private readonly appService: AppService,
    private readonly webhookService: WebhookService<AppDemoEventName, AppDemo>,
  ) {}

  @Get()
  @ApiOkResponse({ type: AppData })
  getData() {
    return this.appService.getData();
  }

  @Post('/demo')
  @ApiCreatedResponse({ type: AppDemo })
  async demoCreateOne() {
    return await this.appPrismaClient.appDemo
      .create({
        data: { name: 'demo name' + randomUUID() },
      })
      .then(async (result) => {
        await this.webhookService.sendEvent(AppDemoEventName['app-demo.create'], result);
        return result;
      });
  }

  @Get('/demo/:id')
  @ApiOkResponse({ type: AppDemo })
  async demoFindOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.appPrismaClient.appDemo.findFirstOrThrow({
      where: { id },
    });
  }

  @Delete('/demo/:id')
  @ApiOkResponse({ type: AppDemo })
  async demoDeleteOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.appPrismaClient.appDemo.delete({ where: { id } }).then(async (result) => {
      await this.webhookService.sendEvent(AppDemoEventName['app-demo.delete'], result);
      return result;
    });
  }

  @Put('/demo/:id')
  @ApiOkResponse({ type: AppDemo })
  async demoUpdateOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.appPrismaClient.appDemo.update({ data: { name: 'new demo name' + randomUUID() }, where: { id } }).then(async (result) => {
      await this.webhookService.sendEvent(AppDemoEventName['app-demo.update'], result);
      return result;
    });
  }

  @Get('/demo')
  @ApiOkResponse({ type: AppDemo, isArray: true })
  async demoFindMany() {
    return await this.appPrismaClient.appDemo.findMany();
  }
}
```

### 18. Adding E2E tests for CRUD methods under the "User" role

Creating a file _apps/server-e2e/src/server/webhook-crud-as-user.spec.ts_

```typescript
import { Configuration, WebhookApi, WebhookErrorEnum } from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';

describe('CRUD operations with Webhook as "User" role', () => {
  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const user1Headers = getRandomExternalHeaders();
  const user2Headers = getRandomExternalHeaders();

  let createEventName: string;

  afterAll(async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    for (const webhook of manyWebhooks.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id'],
      );
    }
    //

    const { data: manyWebhooks2 } = await webhookApi.webhookControllerFindMany(user2Headers['x-external-user-id'], user2Headers['x-external-tenant-id']);
    for (const webhook of manyWebhooks2.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        user2Headers['x-external-user-id'],
        user2Headers['x-external-tenant-id'],
      );
    }
  });

  it('should return a list of available event names', async () => {
    const { data: events } = await webhookApi.webhookControllerEvents(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    createEventName = events.find((e) => e.eventName.includes('create'))?.eventName || 'create';
    expect(events.map((e) => e.eventName)).toEqual(['app-demo.create', 'app-demo.update', 'app-demo.delete']);
  });

  it('should return error "WEBHOOK-002" about empty user', async () => {
    await expect(webhookApi.webhookControllerProfile(undefined, user1Headers['x-external-tenant-id'])).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum._002,
      message: 'User ID not set',
    });
  });

  it('should return error "WEBHOOK-003" about empty tenant', async () => {
    await expect(webhookApi.webhookControllerProfile(user1Headers['x-external-user-id'], undefined)).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum._003,
      message: 'Tenant ID not set',
    });
  });

  it('should return profile of webhook auto created user1', async () => {
    const { data: profile } = await webhookApi.webhookControllerProfile(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    expect(profile).toMatchObject({
      externalTenantId: user1Headers['x-external-tenant-id'],
      externalUserId: user1Headers['x-external-user-id'],
      userRole: 'User',
    });
  });

  it('should return profile of webhook auto created user2', async () => {
    const { data: profile } = await webhookApi.webhookControllerProfile(user2Headers['x-external-user-id'], user2Headers['x-external-tenant-id']);
    expect(profile).toMatchObject({
      externalTenantId: user2Headers['x-external-tenant-id'],
      externalUserId: user2Headers['x-external-user-id'],
      userRole: 'User',
    });
  });

  it('should create new webhook as user1', async () => {
    const { data: newWebhook } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: false,
        endpoint: 'http://example.com',
        eventName: createEventName,
      },
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id'],
    );
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should create new webhook as user2', async () => {
    const { data: newWebhook } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: false,
        endpoint: 'http://example.com',
        eventName: createEventName,
      },
      user2Headers['x-external-user-id'],
      user2Headers['x-external-tenant-id'],
    );
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should read all webhooks', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 1 },
      webhooks: [
        {
          enabled: false,
          endpoint: 'http://example.com',
          eventName: createEventName,
        },
      ],
    });
  });

  it('should read one webhook by id', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    const { data: oneWebhook } = await webhookApi.webhookControllerFindOne(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id'],
    );
    expect(oneWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should update webhook endpoint', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    const { data: updatedWebhook } = await webhookApi.webhookControllerUpdateOne(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
      {
        endpoint: 'http://example.com/new',
      },
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id'],
    );
    expect(updatedWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com/new',
      eventName: createEventName,
    });
  });

  it('should delete updated webhook', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    const { data: deletedWebhook } = await webhookApi.webhookControllerDeleteOne(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id'],
    );
    expect(deletedWebhook).toMatchObject({ message: 'ok' });

    const { data: manyWebhooksAfterDeleteOne } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    expect(manyWebhooksAfterDeleteOne).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 0 },
      webhooks: [],
    });
  });
});
```

Creating a file _apps/server-e2e/src/server/webhook-crud-as-user.spec.ts_

```typescript
import { Configuration, DefaultApi, WebhookApi } from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';
import { randomUUID } from 'crypto';

import express, { Express } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { setTimeout } from 'timers/promises';

describe('CRUD and business operations with WebhookLog as "User" role', () => {
  jest.setTimeout(60000);
  const appId = randomUUID();

  const appHandler = '/api/callback-user';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appHandlerLogs: any[] = [];

  let app: Express;
  let server: Server;
  let endpoint: string;
  let wrongEndpoint: string;

  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const defaultApi = new DefaultApi(new Configuration({ basePath: '/api' }));

  const headers = getRandomExternalHeaders();

  let createEventName: string;
  let updateEventName: string;
  let deleteEventName: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post(appHandler, async (req, res) => {
      if (req.headers['app-id'] === appId) {
        appHandlerLogs.push(req.body);
      }
      res.send(req.body);
    });
    server = app.listen(0);
    endpoint = `http://localhost:${(server.address() as AddressInfo).port}${appHandler}`;
    wrongEndpoint = `http://localhost:${(server.address() as AddressInfo).port}${appHandler}-is-wrong`;
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(headers['x-external-user-id'], headers['x-external-tenant-id']);
    for (const webhook of manyWebhooks.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        headers['x-external-user-id'],
        headers['x-external-tenant-id'],
      );
    }
    server.close();
  });

  it('should return a list of available event names', async () => {
    const { data: events } = await webhookApi.webhookControllerEvents(headers['x-external-user-id'], headers['x-external-tenant-id']);
    createEventName = events.find((e) => e.eventName.includes('create'))?.eventName || 'create';
    updateEventName = events.find((e) => e.eventName.includes('update'))?.eventName || 'update';
    deleteEventName = events.find((e) => e.eventName.includes('delete'))?.eventName || 'delete';

    expect(events.map((e) => e.eventName)).toEqual(['app-demo.create', 'app-demo.update', 'app-demo.delete']);
  });

  it('should create new webhooks', async () => {
    const { data: newWebhook1 } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: true,
        endpoint,
        eventName: createEventName,
        headers: { 'app-id': appId },
      },
      headers['x-external-user-id'],
      headers['x-external-tenant-id'],
    );
    expect(newWebhook1).toMatchObject({
      enabled: true,
      endpoint,
      eventName: createEventName,
    });

    //////

    const { data: newWebhook2 } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: true,
        endpoint,
        eventName: deleteEventName,
        headers: { 'app-id': appId },
      },
      headers['x-external-user-id'],
      headers['x-external-tenant-id'],
    );
    expect(newWebhook2).toMatchObject({
      enabled: true,
      endpoint,
      eventName: deleteEventName,
    });
    //////

    const { data: newWebhook3 } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: true,
        endpoint: wrongEndpoint,
        eventName: updateEventName,
        headers: { 'app-id': appId },
      },
      headers['x-external-user-id'],
      headers['x-external-tenant-id'],
    );
    expect(newWebhook3).toMatchObject({
      enabled: true,
      endpoint: wrongEndpoint,
      eventName: updateEventName,
    });
  });

  it('should create webhook log info after create app-demo', async () => {
    const { data } = await defaultApi.appControllerDemoCreateOne();

    // wait event processing
    await setTimeout(1000);

    expect(data).toEqual(appHandlerLogs[0]);
    expect(appHandlerLogs).toHaveLength(1);

    const { data: findMany } = await defaultApi.appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === appHandlerLogs[0].id)).toHaveLength(1);
  });

  it('should create webhook log info after update app-demo', async () => {
    await defaultApi.appControllerDemoUpdateOne(appHandlerLogs[0].id);

    // wait event processing
    await setTimeout(1000);

    expect(appHandlerLogs).toHaveLength(1);

    const { data: findMany } = await defaultApi.appControllerDemoFindMany();

    // wait event processing
    await setTimeout(1000);

    expect(findMany.filter((d) => d.id === appHandlerLogs[0].id)).toHaveLength(1);
  });

  it('should create webhook log info after delete app-demo', async () => {
    const { data } = await defaultApi.appControllerDemoDeleteOne(appHandlerLogs[0].id);

    // wait event processing
    await setTimeout(1000);

    expect(data).not.toEqual(appHandlerLogs[0]);
    expect(appHandlerLogs).toHaveLength(2);

    const { data: findMany } = await defaultApi.appControllerDemoFindMany();
    expect(findMany.filter((d) => d.id === appHandlerLogs[0].id)).toHaveLength(0);
  });

  it('should read all created webhook logs for "create" event', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(headers['x-external-user-id'], headers['x-external-tenant-id']);
    const { data: manyWebhookLogs } = await webhookApi.webhookControllerFindManyLogs(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      manyWebhooks.webhooks.find((w) => w.eventName === createEventName)!.id,
      headers['x-external-user-id'],
      headers['x-external-tenant-id'],
    );

    expect(manyWebhookLogs).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'OK',
          webhookStatus: 'Success',
          webhookId: manyWebhooks.webhooks.find((w) => w.eventName === createEventName)?.id,
          externalTenantId: headers['x-external-tenant-id'],
        },
      ],
      meta: { totalResults: 1, curPage: 1, perPage: 5 },
    });
  });

  it('should read all created webhook logs for "delete" event', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(headers['x-external-user-id'], headers['x-external-tenant-id']);
    const { data: manyWebhookLogs } = await webhookApi.webhookControllerFindManyLogs(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      manyWebhooks.webhooks.find((w) => w.eventName === deleteEventName)!.id,
      headers['x-external-user-id'],
      headers['x-external-tenant-id'],
    );

    expect(manyWebhookLogs).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'OK',
          webhookStatus: 'Success',
          webhookId: manyWebhooks.webhooks.find((w) => w.eventName === deleteEventName)?.id,
          externalTenantId: headers['x-external-tenant-id'],
        },
      ],
      meta: { totalResults: 1, curPage: 1, perPage: 5 },
    });
  });
  it('should read all created webhook logs for "update" event', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(headers['x-external-user-id'], headers['x-external-tenant-id']);
    const { data: manyWebhookLogs } = await webhookApi.webhookControllerFindManyLogs(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      manyWebhooks.webhooks.find((w) => w.eventName === updateEventName)!.id,
      headers['x-external-user-id'],
      headers['x-external-tenant-id'],
    );

    expect(manyWebhookLogs).toMatchObject({
      webhookLogs: [
        {
          responseStatus: 'Not Found',
          response: '<!DOCTYPE html>\n' + '<html lang="en">\n' + '<head>\n' + '<meta charset="utf-8">\n' + '<title>Error</title>\n' + '</head>\n' + '<body>\n' + '<pre>Cannot POST /api/callback-user-is-wrong</pre>\n' + '</body>\n' + '</html>\n',
          webhookStatus: 'Error',
          webhookId: manyWebhooks.webhooks.find((w) => w.eventName === updateEventName)?.id,
          externalTenantId: headers['x-external-tenant-id'],
        },
      ],
      meta: { totalResults: 1, curPage: 1, perPage: 5 },
    });
  });
});
```

### 19. Adding E2E tests for CRUD methods under the "Admin" role

Creating a file _apps/server-e2e/src/server/webhook-crud-as-admin.spec.ts_

```typescript
import { Configuration, WebhookApi } from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';

describe('CRUD operations with Webhook as "Admin" role', () => {
  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const user1Headers = getRandomExternalHeaders();
  const adminHeaders = {
    ...getRandomExternalHeaders(),
    ['x-external-user-id']: process.env.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID,
  };

  let createEventName: string;

  beforeAll(async () => {
    const { data: events } = await webhookApi.webhookControllerEvents(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    createEventName = events.find((e) => e.eventName.includes('create'))?.eventName || 'create';
    expect(events.map((e) => e.eventName)).toEqual(['app-demo.create', 'app-demo.update', 'app-demo.delete']);
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    for (const webhook of manyWebhooks.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        user1Headers['x-external-user-id'],
        user1Headers['x-external-tenant-id'],
      );
    }
    //

    const { data: manyWebhooks2 } = await webhookApi.webhookControllerFindMany(adminHeaders['x-external-user-id'], adminHeaders['x-external-tenant-id']);
    for (const webhook of manyWebhooks2.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        adminHeaders['x-external-user-id'],
        adminHeaders['x-external-tenant-id'],
      );
    }
  });

  it('should create new webhook as user1', async () => {
    const { data: newWebhook } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: false,
        endpoint: 'http://example.com',
        eventName: createEventName,
      },
      user1Headers['x-external-user-id'],
      user1Headers['x-external-tenant-id'],
    );
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should create new webhook as admin', async () => {
    const { data: newWebhook } = await webhookApi.webhookControllerCreateOne(
      {
        enabled: false,
        endpoint: 'http://example.com',
        eventName: createEventName,
      },
      adminHeaders['x-external-user-id'],
      adminHeaders['x-external-tenant-id'],
    );
    expect(newWebhook).toMatchObject({
      enabled: false,
      endpoint: 'http://example.com',
      eventName: createEventName,
    });
  });

  it('should read one webhooks as user', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5, totalResults: 1 },
      webhooks: [
        {
          enabled: false,
          endpoint: 'http://example.com',
          eventName: createEventName,
        },
      ],
    });
  });

  it('should read all webhooks as admin', async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(adminHeaders['x-external-user-id']);
    expect(manyWebhooks.meta.totalResults).toBeGreaterThan(1);
    expect(manyWebhooks).toMatchObject({
      meta: { curPage: 1, perPage: 5 },
    });
  });
});
```

Creating a file _apps/server-e2e/src/server/webhook-user-crud-as-admin.spec.ts_

```typescript
import { Configuration, WebhookApi, WebhookErrorEnum } from '@nestjs-mod-fullstack/app-rest-sdk';
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';

describe('CRUD operations with WebhookUser as "Admin" role', () => {
  const webhookApi = new WebhookApi(new Configuration({ basePath: '/api' }));
  const user1Headers = getRandomExternalHeaders();
  const adminHeaders = {
    ...getRandomExternalHeaders(),
    ['x-external-user-id']: process.env.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID,
  };

  beforeAll(async () => {
    // on any request we create new user
    await webhookApi.webhookControllerEvents(adminHeaders['x-external-user-id'], adminHeaders['x-external-tenant-id']);

    // on any request we create new user
    await webhookApi.webhookControllerEvents(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
  });

  afterAll(async () => {
    const { data: manyWebhooks } = await webhookApi.webhookControllerFindMany(adminHeaders['x-external-user-id'], adminHeaders['x-external-tenant-id']);
    for (const webhook of manyWebhooks.webhooks) {
      await webhookApi.webhookControllerUpdateOne(
        webhook.id,
        {
          enabled: false,
        },
        adminHeaders['x-external-user-id'],
        adminHeaders['x-external-tenant-id'],
      );
    }
  });

  it('should return error when we try read webhook users as user', async () => {
    await expect(webhookApi.webhookUsersControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id'])).rejects.toHaveProperty('response.data', {
      code: WebhookErrorEnum._001,
      message: 'Forbidden',
    });
  });

  it('should update webhook user role to admin as admin', async () => {
    const { data: userProfile } = await webhookApi.webhookControllerProfile(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    const { data: newWebhook } = await webhookApi.webhookUsersControllerUpdateOne(userProfile.id, { userRole: 'Admin' }, adminHeaders['x-external-user-id']);
    expect(newWebhook).toMatchObject({
      userRole: 'Admin',
    });
  });

  it('should read webhook users as user', async () => {
    const webhookUsersControllerFindManyResult = await webhookApi.webhookUsersControllerFindMany(user1Headers['x-external-user-id'], user1Headers['x-external-tenant-id']);
    expect(webhookUsersControllerFindManyResult.data.webhookUsers[0]).toMatchObject({
      userRole: 'Admin',
    });
  });
});
```

### 20. We start generating additional code for the infrastructure, restart the application and run verification through E2E tests

_Commands_

```bash
npm run pm2-full:dev:stop
npm run manual:prepare
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

{% spoiler Console output %}

```bash
$ npm run pm2-full:dev:stop

> @nestjs-mod-fullstack/source@0.0.8 pm2-full:dev:stop
> npm run docker-compose:stop-prod:server && npm run pm2:dev:stop


> @nestjs-mod-fullstack/source@0.0.8 docker-compose:stop-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down

WARN[0000] /home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/docker-compose-prod.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 2/2
 ✔ Container server-postgre-sql   Removed                                                                                                              10.2s
 ✔ Network server_server-network  Removed                                                                                                               0.1s

> @nestjs-mod-fullstack/source@0.0.8 pm2:dev:stop
> ./node_modules/.bin/pm2 delete all

[PM2] Applying action deleteProcessId on app [all](ids: [ 0, 1 ])
[PM2] [client](1) ✓
[PM2] [server](0) ✓
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
[PM2][WARN] Current process list is not synchronized with saved list. App server client differs. Type 'pm2 save' to synchronize.

$ npm run manual:prepare

> @nestjs-mod-fullstack/source@0.0.8 manual:prepare
> npm run generate && npm run docs:infrastructure && npm run test


> @nestjs-mod-fullstack/source@0.0.8 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run webhook:generate (2s)
   ✔  nx run server:generate (17s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for 2 projects (17s)


> @nestjs-mod-fullstack/source@0.0.8 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.8 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.8 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server:lint (1s)
   ✔  nx run app-angular-rest-sdk:lint (1s)
   ✔  nx run server-e2e:lint (1s)
   ✔  nx run client:lint (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (3s)

      With additional flags:
        --fix=true


> @nestjs-mod-fullstack/source@0.0.8 docs:infrastructure
> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source,client* --all -t=serve --parallel=false -- --watch=false --inspect=false


 NX   Running target serve for project server:

- server

With additional flags:
  --watch=false
  --inspect=false

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run server:serve:development --watch=false --inspect=false

chunk (runtime: main) main.js (main) 98.6 KiB [entry] [rendered]
webpack compiled successfully (d2ebec4a135c5c51)
[19:19:21.382] INFO (328666): Starting Nest application...
    context: "NestFactory"
[19:19:21.383] INFO (328666): DefaultNestApp dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationInitializerSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationInitializerShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): NestjsPinoLoggerModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): NestjsPinoLoggerModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): TerminusHealthCheckModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaToolsModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): AppModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): AppModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): WebhookModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): WebhookModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaToolsModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): Pm2Settings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): Pm2Shared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposeSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerCompose dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): FlywayShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): InfrastructureMarkdownReportStorage dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): InfrastructureMarkdownReportStorageSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerCompose dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): FlywayShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): FlywayShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): HttpModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): WebhookModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposeShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): InfrastructureMarkdownReportStorageShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationInitializer dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaToolsModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): Flyway dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): Flyway dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): NestjsPinoLoggerModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): TerminusModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): TerminusModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ServeStaticModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): PrismaToolsModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): Pm2 dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerCompose dependencies initialized
    context: "InstanceLoader"
[19:19:21.383] INFO (328666): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): PrismaModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): PrismaModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): Flyway dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): Flyway dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): LoggerModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): TerminusHealthCheckModuleShared dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): TerminusHealthCheckModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): AppModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.384] INFO (328666): WebhookModule dependencies initialized
    context: "InstanceLoader"
[19:19:21.411] INFO (328666): TerminusHealthCheckController {/api/health}:
    context: "RoutesResolver"
[19:19:21.412] INFO (328666): Mapped {/api/health, GET} route
    context: "RouterExplorer"
[19:19:21.412] INFO (328666): AppController {/api}:
    context: "RoutesResolver"
[19:19:21.412] INFO (328666): Mapped {/api, GET} route
    context: "RouterExplorer"
[19:19:21.412] INFO (328666): Mapped {/api/demo, POST} route
    context: "RouterExplorer"
[19:19:21.413] INFO (328666): Mapped {/api/demo/:id, GET} route
    context: "RouterExplorer"
[19:19:21.413] INFO (328666): Mapped {/api/demo/:id, DELETE} route
    context: "RouterExplorer"
[19:19:21.413] INFO (328666): Mapped {/api/demo/:id, PUT} route
    context: "RouterExplorer"
[19:19:21.413] INFO (328666): Mapped {/api/demo, GET} route
    context: "RouterExplorer"
[19:19:21.413] INFO (328666): WebhookController {/api/webhook}:
    context: "RoutesResolver"
[19:19:21.414] INFO (328666): Mapped {/api/webhook/profile, GET} route
    context: "RouterExplorer"
[19:19:21.414] INFO (328666): Mapped {/api/webhook/events, GET} route
    context: "RouterExplorer"
[19:19:21.414] INFO (328666): Mapped {/api/webhook, POST} route
    context: "RouterExplorer"
[19:19:21.415] INFO (328666): Mapped {/api/webhook/:id, PUT} route
    context: "RouterExplorer"
[19:19:21.415] INFO (328666): Mapped {/api/webhook/:id, DELETE} route
    context: "RouterExplorer"
[19:19:21.415] INFO (328666): Mapped {/api/webhook/:id, GET} route
    context: "RouterExplorer"
[19:19:21.415] INFO (328666): Mapped {/api/webhook, GET} route
    context: "RouterExplorer"
[19:19:21.415] INFO (328666): Mapped {/api/webhook/:id/logs, GET} route
    context: "RouterExplorer"
[19:19:21.415] INFO (328666): WebhookUsersController {/api/webhook/users}:
    context: "RoutesResolver"
[19:19:21.415] INFO (328666): Mapped {/api/webhook/users/:id, PUT} route
    context: "RouterExplorer"
[19:19:21.415] INFO (328666): Mapped {/api/webhook/users/:id, DELETE} route
    context: "RouterExplorer"
[19:19:21.416] INFO (328666): Mapped {/api/webhook/users/:id, GET} route
    context: "RouterExplorer"
[19:19:21.416] INFO (328666): Mapped {/api/webhook/users, GET} route
    context: "RouterExplorer"
[19:19:21.417] INFO (328666): Connected to database!
    context: "PrismaClient"
[19:19:21.418] INFO (328666): Connected to database!
    context: "PrismaClient"

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target serve for project server



> @nestjs-mod-fullstack/source@0.0.8 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run common:test --passWithNoTests


> nx run prisma-tools:test --passWithNoTests


> nx run webhook:test --passWithNoTests

 NX   Running target test for 8 projects
   ✔  nx run prisma-tools:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


   ✔  nx run common:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 8 projects
   ✔  nx run webhook:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


   ✔  nx run app-angular-rest-sdk:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


   ✔  nx run app-rest-sdk:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 8 projects
   ✔  nx run testing:test (2s)


————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 8 projects

      With additional flags:
        --passWithNoTests=true

   →  Executing 2/2 remaining tasks in parallel...
   ✔  nx run client:test (5s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 8 projects

      With additional flags:
   ✔  nx run server:test (6s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for 8 projects (9s)

      With additional flags:
        --passWithNoTests=true

$ npm run pm2-full:dev:start

> @nestjs-mod-fullstack/source@0.0.8 pm2-full:dev:start
> npm run generate && npm run docker-compose:start-prod:server && npm run db:create-and-fill && npm run pm2:dev:start


> @nestjs-mod-fullstack/source@0.0.8 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run webhook:generate (2s)
   ✔  nx run server:generate (14s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for 2 projects (14s)


> @nestjs-mod-fullstack/source@0.0.8 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.8 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.8 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (119ms)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 4 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.8 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

WARN[0000] /home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/apps/server/docker-compose-prod.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 2/2
 ✔ Network server_server-network  Created                                                                                                                               0.1s
 ✔ Container server-postgre-sql   Started                                                                                                                               0.3s

> @nestjs-mod-fullstack/source@0.0.8 db:create-and-fill
> npm run db:create && npm run flyway:migrate


> @nestjs-mod-fullstack/source@0.0.8 db:create
> ./node_modules/.bin/nx run-many -t=db-create


   ✔  nx run webhook:db-create (712ms)
   ✔  nx run server:db-create (713ms)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target db-create for 2 projects (745ms)


> @nestjs-mod-fullstack/source@0.0.8 flyway:migrate
> ./node_modules/.bin/nx run-many -t=flyway-migrate


   ✔  nx run webhook:flyway-migrate (2s)
   ✔  nx run server:flyway-migrate (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-migrate for 2 projects (2s)


> @nestjs-mod-fullstack/source@0.0.8 pm2:dev:start
> ./node_modules/.bin/pm2 start ./ecosystem.config.json && npm run wait-on -- --log http://localhost:3000/api/health --log http://localhost:4200

[PM2][WARN] Applications server, client not running, starting...
[PM2] App [server] launched (1 instances)
[PM2] App [client] launched (1 instances)
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 1  │ client    │ default     │ N/A     │ fork    │ 330772   │ 0s     │ 0    │ online    │ 0%       │ 13.1mb   │ endy     │ disabled │
│ 0  │ server    │ default     │ N/A     │ fork    │ 330771   │ 0s     │ 0    │ online    │ 0%       │ 25.2mb   │ endy     │ disabled │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

> @nestjs-mod-fullstack/source@0.0.8 wait-on
> ./node_modules/.bin/wait-on --timeout=240000 --interval=1000 --window --verbose --log http://localhost:3000/api/health --log http://localhost:4200

waiting for 2 resources: http://localhost:3000/api/health, http://localhost:4200
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
  HTTP(S) error for http://localhost:4200 Error: connect ECONNREFUSED 127.0.0.1:4200
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:4200 Error: connect ECONNREFUSED 127.0.0.1:4200
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:4200 Error: connect ECONNREFUSED 127.0.0.1:4200
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to  url:http://localhost:4200 ...
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
  HTTP(S) error for http://localhost:4200 AxiosError: Request failed with status code 404
  HTTP(S) error for http://localhost:4200 AxiosError: Request failed with status code 404
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
  HTTP(S) error for http://localhost:4200 AxiosError: Request failed with status code 404
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:4200 AxiosError: Request failed with status code 404
  HTTP(S) result for http://localhost:3000/api/health: {
  status: 200,
  statusText: 'OK',
  headers: Object [AxiosHeaders] {
    'x-powered-by': 'Express',
    vary: 'Origin',
    'access-control-allow-credentials': 'true',
    'x-request-id': 'ee9519ae-fd7d-45cb-847a-7218ab59b6a3',
    'cache-control': 'no-cache, no-store, must-revalidate',
    'content-type': 'application/json; charset=utf-8',
    'content-length': '107',
    etag: 'W/"6b-ouXVoNOXyOxnMfI7caewF8/p97A"',
    date: 'Thu, 03 Oct 2024 15:22:00 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  data: ''
}
waiting for 1 resources: http://localhost:4200
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) result for http://localhost:4200: {
  status: 200,
  statusText: 'OK',
  headers: Object [AxiosHeaders] {
    'x-powered-by': 'Express',
    'access-control-allow-origin': '*',
    'accept-ranges': 'bytes',
    'content-type': 'text/html; charset=utf-8',
    'content-length': '586',
    date: 'Thu, 03 Oct 2024 15:22:32 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  data: ''
}
wait-on(330809) complete

$  npm run pm2-full:dev:test:e2e

> @nestjs-mod-fullstack/source@0.0.8 pm2-full:dev:test:e2e
> npm run test:e2e


> @nestjs-mod-fullstack/source@0.0.8 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes



> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects


 NX   Running target e2e for 2 projects

   →  Executing 1/2 remaining tasks...

   ⠦  nx run client-e2e:e2e
  Slow test file: [webkit] › example.spec.ts (21.4s)
  Consider splitting slow test files to speed up parallel execution
   ✔  nx run client-e2e:e2e (26s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————






————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects

   →  Executing 1/1 remaining tasks...

   ⠋  nx run server-e2e:e2e

   ✔  1/1 succeeded [0 read from cache]

node:internal/child_process/serialization:159
    const string = JSONStringify(message) + '\n';

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects

   →  Executing 1/1 remaining tasks...

   ✔  nx run server-e2e:e2e (12s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects (38s)
```

{% endspoiler %}

### Conclusion

The `createNestModule` utility from the `@nestjs-mod/common` package provides various module configuration options for `NestJS-mod` and `NestJS` applications, this allows us not to invent our own configuration options.

Since the `WebhookModule` module has its own database, it can be moved to a separate microservice or reused in various projects.

### Plans

In the next post, I will write a frontend for the webhooks module in `Angular`...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/460257364bb4ce8e23fe761fbc9ca7462bc89b61..ec8de9d574a6dbcef3c3339e876ce156a3974aae - current changes

#nestjs #webhook #nestjsmod #fullstack
