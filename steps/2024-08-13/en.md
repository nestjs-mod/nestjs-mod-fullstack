## [2024-08-13] Connecting PrismaORM to the NestJS-mod application and checking its operation via REST.

Prisma is connected to NestJS via a package https://www.npmjs.com/package/@nestjs-mod/prisma .

The verification of the work takes place through the launch of E2E tests for REST-endpoints.

### 1. Install all the necessary packages

_Commands_

```bash
# Install all need dependencies
npm i --save @prisma/client @nestjs-mod/prisma

# Install all need dev-dependencies
npm i --save-dev prisma
```

{% spoiler Console output %}

```bash
$ npm i --save @prisma/client @nestjs-mod/prisma

added 2 packages, and audited 2501 packages in 27s

300 packages are looking for funding
  run `npm fund` for details

45 vulnerabilities (6 moderate, 39 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

$ npm i --save-dev prisma

added 6 packages, and audited 2507 packages in 8s

300 packages are looking for funding
  run `npm fund` for details

45 vulnerabilities (6 moderate, 39 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

{% endspoiler %}

### 2. Adding the PrismaModule module to the server code

Updated file `apps/server/src/main.ts`

```typescript
import { DefaultNestApplicationInitializer, DefaultNestApplicationListener, InfrastructureMarkdownReportGenerator, PACKAGE_JSON_FILE, ProjectUtils, bootstrapNestApplication, isInfrastructureMode } from '@nestjs-mod/common';
import { DOCKER_COMPOSE_FILE, DockerCompose, DockerComposePostgreSQL } from '@nestjs-mod/docker-compose';
import { FLYWAY_JS_CONFIG_FILE, Flyway } from '@nestjs-mod/flyway';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { FakePrismaClient, PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';

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
        },
      }),
    ],
    core: [
      PrismaModule.forRoot({
        staticConfiguration: {
          schemaFile: join(appFolder, 'src', 'prisma', `${appFeatureName}-${PRISMA_SCHEMA_FILE}`),
          featureName: appFeatureName,
          prismaModule: isInfrastructureMode()
            ? { PrismaClient: FakePrismaClient }
            : // remove after first run docs:infrastructure
              { PrismaClient: FakePrismaClient },
          // uncomment after first run docs:infrastructure
          // import(`@prisma/prisma-user-client`),
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

### 3. We create documentation for the project and simultaneously create additional code and scripts to work with PrismaORM

_Commands_

```bash
# Build all applications and library
npm run build

# Generate markdown report
npm run docs:infrastructure
```

{% spoiler Console output %}

```bash
$ npm run build

> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix

 NX   Successfully ran target generate for 0 projects (34ms)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server-e2e:lint (2s)
   ✔  nx run server:lint (3s)
   ✔  nx run client:lint (3s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 3 projects (3s)

      With additional flags:
        --fix=true


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server:build:production (4s)
   ✔  nx run client:build:production (9s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for 2 projects (9s)

 $ npm run docs:infrastructure

> @nestjs-mod-fullstack/source@0.0.0 docs:infrastructure
> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start --parallel=1


 NX   Running target start for project server:

- server

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run server:start

> node dist/apps/server/main.js

[15:57:26.274] INFO (24548): Starting Nest application...
    context: "NestFactory"
[15:57:26.274] INFO (24548): DefaultNestApp dependencies initialized
    context: "InstanceLoader"
[15:57:26.274] INFO (24548): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.274] INFO (24548): DefaultNestApplicationInitializerSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.274] INFO (24548): DefaultNestApplicationInitializerShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.274] INFO (24548): NestjsPinoLoggerModuleSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.274] INFO (24548): NestjsPinoLoggerModuleShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.274] INFO (24548): TerminusHealthCheckModuleSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): AppModuleSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): AppModuleShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): Pm2Settings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): Pm2Shared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposeSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerCompose dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): FlywayShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportStorage dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportStorageSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerCompose dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): FlywayShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposeShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportStorageShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): AppModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DefaultNestApplicationInitializer dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): PrismaModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): Flyway dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): NestjsPinoLoggerModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): TerminusModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): TerminusModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): Pm2 dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerCompose dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): PrismaModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): Flyway dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): LoggerModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): TerminusHealthCheckModuleShared dependencies initialized
    context: "InstanceLoader"
[15:57:26.275] INFO (24548): TerminusHealthCheckModule dependencies initialized
    context: "InstanceLoader"
[15:57:26.282] INFO (24548): TerminusHealthCheckController {/health}:
    context: "RoutesResolver"
[15:57:26.284] INFO (24548): Mapped {/health, GET} route
    context: "RouterExplorer"
[15:57:26.284] INFO (24548): AppController {/}:
    context: "RoutesResolver"
[15:57:26.284] INFO (24548): Mapped {/, GET} route
    context: "RouterExplorer"
[15:57:26.286] INFO (24548): Connected to database!
    context: "PrismaClient"
[15:57:26.305] DEBUG (24548):
    0: "SERVER_ROOT_DATABASE_URL: Description='Connection string for PostgreSQL with root credentials (example: postgres://postgres:postgres_password@localhost:5432/postgres?schema=public, username must be \"postgres\")', Original Name='rootDatabaseUrl'"
    1: "SERVER_PORT: Description='The port on which to run the server.', Default='3000', Original Name='port'"
    2: "SERVER_HOSTNAME: Description='Hostname on which to listen for incoming packets.', Original Name='hostname'"
    3: "SERVER_APP_DATABASE_URL: Description='Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)', Original Name='databaseUrl'"
    context: "All application environments"
[15:57:26.331] INFO (24548): Nest application successfully started
    context: "NestApplication"

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target start for project server

```

{% endspoiler %}

### 4. After the first generation of the infrastructure code, it is necessary to modify the main application file

Updated file `apps/server/src/main.ts`

```typescript
import { DefaultNestApplicationInitializer, DefaultNestApplicationListener, InfrastructureMarkdownReportGenerator, PACKAGE_JSON_FILE, ProjectUtils, bootstrapNestApplication, isInfrastructureMode } from '@nestjs-mod/common';
import { DOCKER_COMPOSE_FILE, DockerCompose, DockerComposePostgreSQL } from '@nestjs-mod/docker-compose';
import { FLYWAY_JS_CONFIG_FILE, Flyway } from '@nestjs-mod/flyway';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { FakePrismaClient, PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';

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
        },
      }),
    ],
    core: [
      PrismaModule.forRoot({
        staticConfiguration: {
          schemaFile: join(appFolder, 'src', 'prisma', `${appFeatureName}-${PRISMA_SCHEMA_FILE}`),
          featureName: appFeatureName,
          prismaModule: isInfrastructureMode() ? { PrismaClient: FakePrismaClient } : import(`@prisma/app-client`), // <-- updates
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

### 5. Launch the database, generate a PrismaORM schema from an existing database and generate a PrismaORM client

_Commands_

```bash
# Start database
npm run docker-compose:start-prod:server

# Pull database-schema to prisma-schema (options --force rewirite exists prisma-schema)
npm run prisma:pull --force

# Generate prisma-client
npm run generate
```

{% spoiler Console output %}

```bash
$ npm run docker-compose:start-prod:server

> @nestjs-mod-fullstack/source@0.0.0 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

Creating network "server_server-network" with driver "bridge"
Creating server-postgre-sql ... done

$ npm run prisma:pull --force
npm WARN using --force Recommended protections disabled.

> @nestjs-mod-fullstack/source@0.0.0 prisma:pull
> ./node_modules/.bin/nx run-many -t=prisma-pull


   ✔  nx run server:prisma-pull (583ms)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target prisma-pull for project server (612ms)


 NX   Nx detected a flaky task

  server:prisma-pull

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks

$ npm run generate

> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (1s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 3 projects (1s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 2 out of 3 tasks.
```

{% endspoiler %}

### 6. Open the created one and make sure that the PrismaORM schema completely repeats the schema of the application database

Updated file `apps/server/src/prisma/app-schema.prisma`

```prisma
generator client {
  provider   = "prisma-client-js"
  output     = "../../../../node_modules/@prisma/app-client"
  engineType = "binary"
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

### 7. Since by default the pm2 configuration contains the launch of an already built application on NestJS, we change the command to launch the application in watch mode

Updated file `ecosystem.config.json`

```json
{
  "apps": [
    {
      "name": "server",
      "script": "./node_modules/.bin/nx serve server",
      "node_args": "-r dotenv/config"
    },
    {
      "name": "client",
      "script": "./node_modules/.bin/nx serve client --host=0.0.0.0 --disable-host-check",
      "node_args": "-r dotenv/config"
    }
  ]
}
```

### 8. Restarting all applications

_Commands_

```bash
# Stop all applications
npm run pm2:stop

# Start all applications
npm run pm2:start
```

{% spoiler Console output %}

```bash
$ npm run pm2:stop

> @nestjs-mod-fullstack/source@0.0.0 pm2:stop
> ./node_modules/.bin/pm2 delete all


>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 3.1.3
Local PM2 version: 5.4.2

[PM2] Applying action deleteProcessId on app [all](ids: [ 0, 1 ])
[PM2] [client](1) ✓
[PM2] [server](0) ✓
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

$ npm run pm2:start

> @nestjs-mod-fullstack/source@0.0.0 pm2:start
> ./node_modules/.bin/pm2 start ./ecosystem.config.json


>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 3.1.3
Local PM2 version: 5.4.2

[PM2][WARN] Applications server, client not running, starting...
[PM2] App [server] launched (1 instances)
[PM2] App [client] launched (1 instances)
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 1  │ client    │ default     │ N/A     │ fork    │ 53570    │ 0s     │ 0    │ online    │ 0%       │ 16.2mb   │ endy     │ disabled │
│ 0  │ server    │ default     │ N/A     │ fork    │ 53569    │ 0s     │ 0    │ online    │ 0%       │ 27.4mb   │ endy     │ disabled │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

{% endspoiler %}

### 9. Adding a module for working with the prism to the AppModule

Updated file `apps/server/src/app/app.module.ts`

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@nestjs-mod/prisma';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [PrismaModule.forFeature({ featureModuleName: 'app' })],
  controllers: [AppController],
  providers: [AppService],
});
```

### 10. Adding additional methods to the AppController to work with the data of the AppDemo table

Updated file `apps/server/src/app/app.controller.ts`

```typescript
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(
    @InjectPrismaClient()
    private readonly appPrismaClient: AppPrismaClient,
    private readonly appService: AppService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('/demo')
  async demoCreateOne() {
    return await this.appPrismaClient.appDemo.create({ data: { name: 'demo name' + randomUUID() } });
  }

  @Get('/demo/:id')
  async demoFindOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.findFirstOrThrow({ where: { id } });
  }

  @Delete('/demo/:id')
  async demoDeleteOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.delete({ where: { id } });
  }

  @Get('/demo')
  async demoFindMany() {
    return await this.appPrismaClient.appDemo.findMany();
  }
}
```

### 11. Adding verification of new methods in the E2E test

Updated file `apps/server-e2e/src/server/server.spec.ts`

```typescript
import axios from 'axios';

describe('GET /api', () => {
  let newDemoObject: { id: string };

  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });

  it('should create and return a demo object', async () => {
    const res = await axios.post(`/api/demo`);

    expect(res.status).toBe(201);
    expect(res.data.name).toContain('demo name');

    newDemoObject = res.data;
  });

  it('should get demo object by id', async () => {
    const res = await axios.get(`/api/demo/${newDemoObject.id}`);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(newDemoObject);
  });

  it('should get all demo object', async () => {
    const res = await axios.get(`/api/demo`);

    expect(res.status).toBe(200);
    expect(res.data.filter((row) => row.id === newDemoObject.id)).toMatchObject([newDemoObject]);
  });

  it('should delete demo object by id', async () => {
    const res = await axios.delete(`/api/demo/${newDemoObject.id}`);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(newDemoObject);
  });

  it('should get all demo object', async () => {
    const res = await axios.get(`/api/demo`);

    expect(res.status).toBe(200);
    expect(res.data.filter((row) => row.id === newDemoObject.id)).toMatchObject([]);
  });
});
```

### 12. Launching e2e tests

_Commands_

```bash
./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes


> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...

   ⠙  nx run client-e2e:e2e
   ✔  nx run client-e2e:e2e (15s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
   ✔  nx run server:build:production (3s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/1 remaining tasks...

   ⠧  nx run server-e2e:e2e

   ✔  2/2 succeeded [0 read from cache]

 PASS   server-e2e  apps/server-e2e/src/server/server.spec.ts
  GET /api
    ✓ should return a message (43 ms)
   ✔  nx run server-e2e:e2e (2s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (21s)
```

{% endspoiler %}

### 13. Since now some of the methods of the AppController controller use PrismaClient, we need to change the unit tests

Updated file `apps/server/src/app/app.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { FakePrismaClient, PrismaModule } from '@nestjs-mod/prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  const appFeatureName = 'app';
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        PrismaModule.forRoot({
          environments: { databaseUrl: 'fake' },
          staticConfiguration: {
            featureName: appFeatureName,
            prismaModule: { PrismaClient: FakePrismaClient },
          },
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
```

### 14. Running unit tests of the server application

_Commands_

```bash
./node_modules/.bin/nx run server:test --passWithNoTests
```

{% spoiler Console output %}

```bash
$  ./node_modules/.bin/nx run server:test --passWithNoTests

> nx run server:test --passWithNoTests

 PASS   server  apps/server/src/app/app.service.spec.ts
 PASS   server  apps/server/src/app/app.controller.spec.ts

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.07 s, estimated 5 s
Ran all test suites.

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for project server (3s)

      With additional flags:
        --passWithNoTests=true
```

{% endspoiler %}

In the next post, I will add Swagger documentation generation to the NestJS application and create a REST client with which the Angular application will interact...

### Links

https://nestjs.com - the official website of the framework
https://nestjs-mod.com - the official website of additional utilities
https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/a8b7f6ae2660a21730860b384c30da9fc82e9238 - commit to current changes

#nestjs #prisma #nestjsmod #fullstack
