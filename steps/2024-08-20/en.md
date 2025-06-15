## [2024-08-20] Build applications on NestJS and Angular and run them in two versions: via PM2 and via Docker Compose.

To run the built applications in PM2 mode, the frontend will be embedded in the backend in the form of static files.

To run in the "Docker Compose" mode, the backend will be built as a Docker image, and the built-in static of the frontend will be transmitted via Nginx.

The database is start via "Docker Compose".

### 1. We install all the necessary packages and regenerate Prisma clients

After installing the packages, the generated Prisma clients are deleted, so you need to run the generation again.

_Commands_

```bash
# Install all need dependencies
npm install --save @nestjs/serve-static dotenv wait-on

# After installing the packages, the generated Prisma clients are deleted, so you need to run their generation again
npm i && npm run generate
```

{% spoiler Console output %}

```bash
npm install --save @nestjs/serve-static dotenv wait-on

added 3 packages, and audited 2770 packages in 11s

331 packages are looking for funding
  run `npm fund` for details

18 vulnerabilities (6 moderate, 12 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

{% endspoiler %}

### 2. Adding a module for connecting static to the NestJS application

The NestJS-mod application has a special section for connecting this type of modules [Core modules] (https://nestjs-mod.com/docs/guides/info/module-types#core-modules ), but at this stage, to simplify understanding, such global things will be connected at the `AppModule` level.

Updated file `apps/server/src/app/app.module.ts`

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    PrismaModule.forFeature({ featureModuleName: 'app' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
});
```

### 3. Adding a new PM2 configuration file to run the built backend and frontend application

There will be only one application, since the static of the frontend application lies next to the built backend application.

Creating the file `ecosystem-prod.config.json`

```json
{
  "apps": [
    {
      "name": "nestjs-mod-fullstack",
      "script": "node dist/apps/server/main.js",
      "node_args": "-r dotenv/config"
    }
  ]
}
```

### 4. Adding new scripts and updating existing ones

There are a lot of scripts, but they are all needed for various application launch modes.

Groups of scripts similar in scope are combined into a certain header `_____group name_____`.

Updating the section with scripts in the `package' file.json`

```json
{
  "scripts": {
    "_____pm2-full dev infra_____": "_____pm2-full dev infra_____",
    "pm2-full:dev:start": "npm run generate && npm run docker-compose:start-prod:server && npm run db:create && npm run flyway:migrate && npm run pm2:dev:start",
    "pm2-full:dev:stop": "npm run docker-compose:stop-prod:server && npm run pm2:dev:stop",
    "_____dev infra_____": "_____dev infra_____",
    "serve:dev": "./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=serve",
    "serve:dev:server": "./node_modules/.bin/nx serve server --host=0.0.0.0",
    "_____pm2 dev infra_____": "_____pm2 dev infra_____",
    "pm2:dev:start": "./node_modules/.bin/pm2 start ./ecosystem.config.json && npm run wait-on -- --log http://localhost:3000/api/health --log http://localhost:4200",
    "pm2:dev:stop": "./node_modules/.bin/pm2 delete all",
    "_____pm2-full prod infra_____": "_____pm2-full prod infra_____",
    "pm2-full:prod:start": "npm run generate && npm run build -- -c production && npm run copy-front-to-backend && npm run docker-compose:start-prod:server && npm run db:create && npm run flyway:migrate && npm run pm2:start",
    "pm2-full:prod:stop": "npm run docker-compose:stop-prod:server && npm run pm2:stop",
    "_____prod infra_____": "_____prod infra_____",
    "start": "./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start",
    "build": "npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true",
    "start:prod:server": "./node_modules/.bin/nx start server",
    "_____pm2 prod infra_____": "_____pm2 prod infra_____",
    "pm2:start": "./node_modules/.bin/pm2 start ./ecosystem-prod.config.json && npm run wait-on -- --log http://localhost:3000/api/health --log http://localhost:3000",
    "pm2:stop": "./node_modules/.bin/pm2 delete all",
    "_____docker-compose-full prod infra_____": "_____docker-compose-full prod infra_____",
    "docker-compose-full:prod:start": "npm run generate && npm run build -- -c production && npm run docker:build:server:latest && export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility up -d",
    "docker-compose-full:prod:stop": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility down",
    "docker-compose-full:prod:only-start": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility up -d",
    "docker-compose-full:prod:test:e2e": "export BASE_URL=http://localhost:8080 && npm run test:e2e",
    "_____docs_____": "_____docs_____",
    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source,client* --all -t=serve --parallel=1 -- --watch=false --inspect=false",
    "_____docker-compose infra_____": "_____docker-compose infra_____",
    "docker-compose:start:server": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose.yml --compatibility up -d",
    "docker-compose:stop:server": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose.yml down",
    "_____docker-compose prod-infra_____": "_____docker-compose prod-infra_____",
    "docker-compose:start-prod:server": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d",
    "docker-compose:stop-prod:server": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down",
    "_____docker_____": "_____docker_____",
    "docker:build:server:latest": "docker build -t nestjs-mod-fullstack-server:latest -f ./.docker/server.Dockerfile . --progress=plain",
    "_____tests_____": "_____tests_____",
    "test": "./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes",
    "test:e2e": "./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes",
    "test:server": "./node_modules/.bin/nx test server --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes",
    "_____lint_____": "_____lint_____",
    "lint": "npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint",
    "lint:fix": "npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix",
    "tsc:lint": "./node_modules/.bin/tsc --noEmit -p tsconfig.base.json",
    "_____db_____": "_____db_____",
    "db:create": "./node_modules/.bin/nx run-many -t=db-create",
    "_____flyway_____": "_____flyway_____",
    "flyway:create:server": "./node_modules/.bin/nx run server:flyway-create-migration",
    "flyway:migrate:server": "./node_modules/.bin/nx run server:flyway-migrate",
    "flyway:migrate": "./node_modules/.bin/nx run-many -t=flyway-migrate",
    "_____prisma_____": "_____prisma_____",
    "prisma:pull:server": "./node_modules/.bin/nx run server:prisma-pull",
    "prisma:pull": "./node_modules/.bin/nx run-many -t=prisma-pull",
    "prisma:generate": "./node_modules/.bin/nx run-many -t=prisma-generate",
    "_____utils_____": "_____utils_____",
    "copy-front-to-backend": "rm -rf dist/apps/server/assets/client && cp -r dist/apps/client/browser dist/apps/server/assets/client",
    "generate": "./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix",
    "tsc": "tsc",
    "nx": "nx",
    "dep-graph": "./node_modules/.bin/nx dep-graph",
    "make-ts-list": "./node_modules/.bin/rucken make-ts-list",
    "manual:prepare": "npm run generate && npm run docs:infrastructure && npm run test",
    "update:nestjs-mod-versions": "npx -y npm-check-updates @nestjs-mod/* nestjs-mod -u",
    "rucken": "rucken",
    "wait-on": "./node_modules/.bin/wait-on --timeout=240000 --interval=1000 --window --verbose"
  },
  "scriptsComments": {
    "pm2-full:dev:start": ["Launching infrastructure and all applications in watch mode via PM2"],
    "pm2-full:dev:stop": ["Stopping infrastructure and all applications in watch mode via PM2"],
    "pm2:dev:start": ["Launching all applications in watch mode via PM2"],
    "pm2:dev:stop": ["Stopping all applications in watch mode via PM2"],
    "pm2-full:prod:start": ["Launching the infrastructure and building all applications, followed by launching them via PM2"],
    "pm2-full:prod:stop": ["Stopping infrastructure and all applications running through PM2"],
    "test:e2e": ["Running E2E tests for all applications"],
    "copy-dist-front-to-dist-backend": ["Copying a built frontend application to a built backend"],
    "wait-on": ["Utility for checking and waiting for site availability"],
    "docker-compose-full:prod:start": ["Build and launching Docker Compose infrastructure with a backend in the form of a Docker container and frontend statics transmitted via Nginx"],
    "docker-compose-full:prod:stop": ["Stopping Docker Compose infrastructure and all applications"],
    "docker-compose-full:prod:only-start": ["Launching Docker Compose infrastructure with a backend in the form of a Docker container and frontend statics transmitted via Nginx"],
    "docker-compose-full:prod:test:e2e": ["Launching E2E tests on an application launched via Docker Compose"],
    "docker:build:server:latest": ["Building a Docker backend image"]
  }
}
```

_Descriptions of new scripts_
| Script | Comment |
| ------------------------------ | ------- |
| pm2-full:dev:start | Launching the infrastructure and all applications in watch mode via PM2 |
| pm2-full:dev:stop | Stopping infrastructure and all applications in watch mode via PM2 |
| pm2:dev:start | Launch all applications in watch mode via PM2 |
| pm2:dev:stop | Stopping all applications in watch mode via PM2 |
| pm2-full:prod:start | Launching the infrastructure and building all applications, followed by launching them via PM2 |
| pm2-full:prod:stop | Stopping the infrastructure and all applications running through PM2 |
| test:e2e | Running E2E tests for all applications |
| copy-dist-front-to-dist-backend | Copying a built frontend application to a built backend |
| wait-on | A utility for checking and waiting for site availability |
| docker-compose-full:prod:start | Build and launch of the "Docker Compose" infrastructure with a backend in the form of a Docker container and frontend statics transmitted via Nginx |
| docker-compose-full:prod:stop | Stopping the "Docker Compose" infrastructure and all applications |
| docker-compose-full:prod:only-start | Launching the "Docker Compose" infrastructure with a backend in the form of a Docker container and frontend statics transmitted via Nginx |
| docker-compose-full:prod:test:e2e | Launching E2E tests on an application launched via "Docker Compose" |
| docker:build:server:latest | Building a Docker backend image |

### 5. We run unit tests, then run the entire infrastructure with all applications in watch mode and run E2E tests

_Commands_

```bash
npm run test
npm run pm2-full:dev:start
npm run test:e2e
```

{% spoiler Console output %}

```bash
$ npm run test

> @nestjs-mod-fullstack/source@0.0.0 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run app-angular-rest-sdk:test --passWithNoTests


> nx run app-rest-sdk:test --passWithNoTests


> nx run client:test --passWithNoTests

 NX   Running target test for 4 projects
   ✔  nx run app-rest-sdk:test (2s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects
   ✔  nx run app-angular-rest-sdk:test (2s)


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

      With additional flags:
        --passWithNoTests=true

   ✔  nx run client:test (5s)



——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

   ✔  nx run server:test (4s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for 4 projects (6s)

      With additional flags:
        --passWithNoTests=true

$ npm run pm2-full:dev:start

> @nestjs-mod-fullstack/source@0.0.0 pm2-full:dev:start
> npm run generate && npm run docker-compose:start-prod:server && npm run db:create && npm run flyway:migrate && npm run pm2:dev:start


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (13s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (13s)


 NX   Nx detected a flaky task

  server:generate

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint (1s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (1s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 3 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

server-postgre-sql is up-to-date

> @nestjs-mod-fullstack/source@0.0.0 db:create
> ./node_modules/.bin/nx run-many -t=db-create


   ✔  nx run server:db-create (746ms)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target db-create for project server (775ms)


> @nestjs-mod-fullstack/source@0.0.0 flyway:migrate
> ./node_modules/.bin/nx run-many -t=flyway-migrate


   ✔  nx run server:flyway-migrate (1s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-migrate for project server (2s)


> @nestjs-mod-fullstack/source@0.0.0 pm2:dev:start
> ./node_modules/.bin/pm2 start ./ecosystem.config.json && npm run wait-on -- --log http://localhost:3000/api/health --log http://localhost:4200

[PM2][WARN] Applications server, client not running, starting...
[PM2] App [server] launched (1 instances)
[PM2] App [client] launched (1 instances)
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 1  │ client    │ default     │ N/A     │ fork    │ 175791   │ 0s     │ 0    │ online    │ 0%       │ 13.1mb   │ endy     │ disabled │
│ 0  │ server    │ default     │ N/A     │ fork    │ 175790   │ 0s     │ 0    │ online    │ 0%       │ 18.7mb   │ endy     │ disabled │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

> @nestjs-mod-fullstack/source@0.0.0 wait-on
> ./node_modules/.bin/wait-on --timeout=240000 --interval=1000 --window --verbose --log http://localhost:3000/api/health --log http://localhost:4200

waiting for 2 resources: http://localhost:3000/api/health, http://localhost:4200
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
  HTTP(S) error for http://localhost:4200 Error: connect ECONNREFUSED 127.0.0.1:4200
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
  HTTP(S) error for http://localhost:4200 Error: connect ECONNREFUSED 127.0.0.1:4200
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to  url:http://localhost:4200 ...
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to  url:http://localhost:4200 ...
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:4200 ...
  HTTP(S) result for http://localhost:3000/api/health: {
  status: 200,
  statusText: 'OK',
  headers: Object [AxiosHeaders] {
    'x-powered-by': 'Express',
    vary: 'Origin',
    'access-control-allow-credentials': 'true',
    'x-request-id': '72cc7a93-98b5-4e60-8c4e-65e9458385bf',
    'cache-control': 'no-cache, no-store, must-revalidate',
    'content-type': 'application/json; charset=utf-8',
    'content-length': '107',
    etag: 'W/"6b-ouXVoNOXyOxnMfI7caewF8/p97A"',
    date: 'Sat, 17 Aug 2024 04:02:41 GMT',
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
    'content-type': 'text/html; charset=utf-8',
    'accept-ranges': 'bytes',
    'content-length': '586',
    date: 'Sat, 17 Aug 2024 04:02:42 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  data: ''
}
wait-on(175826) complete

$ npm run test:e2e

> @nestjs-mod-fullstack/source@0.0.0 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes



> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...

   ⠧  nx run client-e2e:e2e
   ✔  nx run client-e2e:e2e (7s)

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
    ✓ should return a message (28 ms)
   ✔  nx run server-e2e:e2e (2s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (12s)
```

{% endspoiler %}

### 6. We are stopping the entire infrastructure with all applications in watch mode

_Commands_

```bash
npm run pm2-full:dev:stop
```

{% spoiler Console output %}

```bash
$  npm run pm2-full:dev:stop

> @nestjs-mod-fullstack/source@0.0.0 pm2-full:dev:stop
> npm run docker-compose:stop-prod:server && npm run pm2:dev:stop


> @nestjs-mod-fullstack/source@0.0.0 docker-compose:stop-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down

Stopping server-postgre-sql ... done
Removing server-postgre-sql ... done
Removing network server_server-network

> @nestjs-mod-fullstack/source@0.0.0 pm2:dev:stop
> ./node_modules/.bin/pm2 delete all

[PM2] Applying action deleteProcessId on app [all](ids: [ 0, 1 ])
[PM2] [client](1) ✓
[PM2] [server](0) ✓
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

{% endspoiler %}

### 7. We run unit tests, then run the entire infrastructure with all applications via PM2 in built mode and run E2E tests

_Commands_

```bash
npm run test
npm run pm2-full:prod:start
npm run test:e2e
```

{% spoiler Console output %}

```bash
$ npm run test

> @nestjs-mod-fullstack/source@0.0.0 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run app-angular-rest-sdk:test --passWithNoTests


> nx run app-rest-sdk:test --passWithNoTests


> nx run client:test --passWithNoTests

 NX   Running target test for 4 projects
   ✔  nx run app-rest-sdk:test (2s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects
   ✔  nx run app-angular-rest-sdk:test (2s)


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

      With additional flags:
        --passWithNoTests=true

   ✔  nx run client:test (5s)



——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

   ✔  nx run server:test (4s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for 4 projects (6s)

      With additional flags:
        --passWithNoTests=true

$ npm run pm2-full:prod:start

> @nestjs-mod-fullstack/source@0.0.0 pm2-full:prod:start
> npm run generate && npm run build -- -c production && npm run copy-front-to-backend && npm run docker-compose:start-prod:server && npm run db:create && npm run flyway:migrate && npm run pm2:start


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (12s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (12s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (110ms)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 4 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true -c production


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (12s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (12s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (113ms)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 4 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-rest-sdk:build (2s)
   ✔  nx run app-angular-rest-sdk:build:production (2s)
   ✔  nx run server:build:production (4s)
   ✔  nx run client:build:production (5s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for 4 projects (7s)


> @nestjs-mod-fullstack/source@0.0.0 copy-front-to-backend
> rm -rf dist/apps/server/assets/client && cp -r dist/apps/client/browser dist/apps/server/assets/client


> @nestjs-mod-fullstack/source@0.0.0 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

Creating network "server_server-network" with driver "bridge"
Creating server-postgre-sql ... done

> @nestjs-mod-fullstack/source@0.0.0 db:create
> ./node_modules/.bin/nx run-many -t=db-create


   ✔  nx run server:db-create (733ms)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target db-create for project server (763ms)


> @nestjs-mod-fullstack/source@0.0.0 flyway:migrate
> ./node_modules/.bin/nx run-many -t=flyway-migrate


   ✔  nx run server:flyway-migrate (1s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-migrate for project server (1s)


 NX   Nx detected a flaky task

  server:flyway-migrate

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks


> @nestjs-mod-fullstack/source@0.0.0 pm2:start
> ./node_modules/.bin/pm2 start ./ecosystem-prod.config.json && npm run wait-on -- --log http://localhost:3000/api/health --log http://localhost:3000


>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 3.1.3
Local PM2 version: 5.4.2

[PM2][WARN] Applications nestjs-mod-fullstack not running, starting...
[PM2] App [nestjs-mod-fullstack] launched (1 instances)
┌────┬─────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                    │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ nestjs-mod-fullstack    │ default     │ N/A     │ fork    │ 106436   │ 0s     │ 0    │ online    │ 0%       │ 11.6mb   │ endy     │ disabled │
└────┴─────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

> @nestjs-mod-fullstack/source@0.0.0 wait-on
> ./node_modules/.bin/wait-on --timeout=240000 --interval=1000 --window --verbose --log http://localhost:3000/api/health --log http://localhost:3000

waiting for 2 resources: http://localhost:3000/api/health, http://localhost:3000
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:3000 ...
  HTTP(S) error for http://localhost:3000/api/health Error: connect ECONNREFUSED 127.0.0.1:3000
  HTTP(S) error for http://localhost:3000 Error: connect ECONNREFUSED 127.0.0.1:3000
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:3000 ...
  HTTP(S) result for http://localhost:3000/api/health: {
  status: 200,
  statusText: 'OK',
  headers: Object [AxiosHeaders] {
    'x-powered-by': 'Express',
    vary: 'Origin',
    'access-control-allow-credentials': 'true',
    'x-request-id': '011863a0-2444-40d4-a012-93c3dd9d3d96',
    'cache-control': 'no-cache, no-store, must-revalidate',
    'content-type': 'application/json; charset=utf-8',
    'content-length': '107',
    etag: 'W/"6b-ouXVoNOXyOxnMfI7caewF8/p97A"',
    date: 'Tue, 20 Aug 2024 06:04:02 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  data: ''
}
waiting for 1 resources: http://localhost:3000
  HTTP(S) result for http://localhost:3000: {
  status: 200,
  statusText: 'OK',
  headers: Object [AxiosHeaders] {
    'x-powered-by': 'Express',
    vary: 'Origin',
    'access-control-allow-credentials': 'true',
    'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=0',
    'last-modified': 'Tue, 20 Aug 2024 06:03:56 GMT',
    etag: 'W/"8e8-1916e62868f"',
    'content-type': 'text/html; charset=UTF-8',
    'content-length': '2280',
    date: 'Tue, 20 Aug 2024 06:04:02 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  data: ''
}
wait-on(106462) complete

$ npm run test:e2e

> @nestjs-mod-fullstack/source@0.0.0 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes



> nx run client-e2e:e2e

> playwright test



 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...

   ⠼  nx run client-e2e:e2e
   ✔  nx run client-e2e:e2e (13s)

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

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (18s)

```

{% endspoiler %}

### 8. We are stopping the entire infrastructure and all applications built and launched through PM2

_Commands_

```bash
npm run pm2-full:prod:stop
```

{% spoiler Console output %}

```bash
$  npm run pm2-full:prod:stop

> @nestjs-mod-fullstack/source@0.0.0 pm2-full:prod:stop
> npm run docker-compose:stop-prod:server && npm run pm2:stop


> @nestjs-mod-fullstack/source@0.0.0 docker-compose:stop-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down

Stopping server-postgre-sql ... done
Removing server-postgre-sql ... done
Removing network server_server-network

> @nestjs-mod-fullstack/source@0.0.0 pm2:stop
> ./node_modules/.bin/pm2 delete all

[PM2] Applying action deleteProcessId on app [all](ids: [ 0 ])
[PM2] [nestjs-mod-fullstack](0) ✓
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

{% endspoiler %}

### 9. Adding a Docker file that will build an image with the running backend

Сборка происходит в несколько этапов:

1. Install only npm dependencies
2. Install npm devDependencies necessary to generate additional code and packages
3. Generating SDK for Prisma
4. Removing unnecessary packages from node_modules
5. Copy node_modules and applications to a new clean image

Creating the `.docker/server' file.Dockerfile`

```Dockerfile

FROM node:20.16.0-alpine AS builder
WORKDIR /usr/src/app
COPY . .
# To work as a PID 1
RUN apk add dumb-init
# Remove dev dependencies
RUN apk add jq
RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
# Removing unnecessary settings
RUN rm -rf nx.json package-lock.json .dockerignore && \
    # Replacing the settings
    cp .docker/nx.json nx.json && \
    cp .docker/.dockerignore .dockerignore && \
    # Install dependencies
    npm install && \
    # Installing utilities to generate additional files
    npm install --save-dev nx@19.5.3 prisma@5.18.0 prisma-class-generator@0.2.11 && \
    # Some utilities require a ".env" file
    echo '' > .env && \
    # Generating additional code
    npm run prisma:generate && \
    # Remove unnecessary packages
    rm -rf /usr/src/app/node_modules/@nx && \
    rm -rf /usr/src/app/node_modules/@prisma-class-generator && \
    rm -rf /usr/src/app/node_modules/@angular  && \
    rm -rf /usr/src/app/node_modules/@swc  && \
    rm -rf /usr/src/app/node_modules/@babel  && \
    rm -rf /usr/src/app/node_modules/@angular-devkit && \
    rm -rf /usr/src/app/node_modules/@ngneat && \
    rm -rf /usr/src/app/node_modules/@types && \
    rm -rf /usr/src/app/node_modules/@ng-packagr

FROM node:20.16.0-alpine
WORKDIR /usr/src/app
# Copy all project files
COPY --from=builder /usr/src/app/ /usr/src/app/
# Copy utility for "To work as a PID 1"
COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
# Set server port
ENV SERVER_PORT=8080
# Share port
EXPOSE 8080
# Run server
CMD ["dumb-init","node", "dist/apps/server/main.js"]


```

### 10. Building a backend image

The script for starting the build is described in the `package.json`, since we have only one application that can be assembled into a Docker image, in the future, after the appearance of new Docker applications, the image building team will go to `project.json`

_Commands_

```bash
npm run docker:build:server:latest
```

{% spoiler Console output %}

```bash
$ npm run docker:build:server:latest

> @nestjs-mod-fullstack/source@0.0.0 docker:build:server:latest
> docker build -t nestjs-mod-fullstack-server:latest -f ./.docker/server.Dockerfile . --progress=plain

#0 building with "default" instance using docker driver

#1 [internal] load build definition from server.Dockerfile
#1 transferring dockerfile: 1.65kB done
#1 DONE 0.0s

#2 [internal] load .dockerignore
#2 transferring context: 79B done
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:20.16.0-alpine
#3 DONE 2.7s

#4 [internal] load build context
#4 transferring context: 7.08MB 0.1s done
#4 DONE 0.1s

#5 [builder 1/7] FROM docker.io/library/node:20.16.0-alpine@sha256:eb8101caae9ac02229bd64c024919fe3d4504ff7f329da79ca60a04db08cef52
#5 resolve docker.io/library/node:20.16.0-alpine@sha256:eb8101caae9ac02229bd64c024919fe3d4504ff7f329da79ca60a04db08cef52 done
#5 sha256:e2997a3fdff8b88aee369a7de727d89bff21c0e2927d7c0487dbbaab6eaf8f14 6.38kB / 6.38kB done
#5 sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fea8cb9e5ba2e5e6673fde9f6 0B / 3.62MB 0.1s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 0B / 42.24MB 0.1s
#5 sha256:0150f131fd2fb613a281e43d320d5772ad190446bcbb177a28f53838f53fdd3c 0B / 1.39MB 0.1s
#5 sha256:eb8101caae9ac02229bd64c024919fe3d4504ff7f329da79ca60a04db08cef52 7.67kB / 7.67kB done
#5 sha256:375518d70893d14665b99393079e77bd4947884f123a66ade28744eb8340d229 1.72kB / 1.72kB done
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 3.15MB / 42.24MB 0.7s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 7.34MB / 42.24MB 1.1s
#5 sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fea8cb9e5ba2e5e6673fde9f6 1.05MB / 3.62MB 1.3s
#5 sha256:0150f131fd2fb613a281e43d320d5772ad190446bcbb177a28f53838f53fdd3c 1.05MB / 1.39MB 1.4s
#5 sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fea8cb9e5ba2e5e6673fde9f6 2.10MB / 3.62MB 1.6s
#5 sha256:0150f131fd2fb613a281e43d320d5772ad190446bcbb177a28f53838f53fdd3c 1.39MB / 1.39MB 1.5s done
#5 sha256:c0ce3bd8f30377d0ed394d1177e5009ffc3f6907a980562779583174e8b04acc 0B / 446B 1.6s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 10.49MB / 42.24MB 1.7s
#5 sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fea8cb9e5ba2e5e6673fde9f6 3.15MB / 3.62MB 1.8s
#5 extracting sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fea8cb9e5ba2e5e6673fde9f6
#5 sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fea8cb9e5ba2e5e6673fde9f6 3.62MB / 3.62MB 1.8s done
#5 extracting sha256:c6a83fedfae6ed8a4f5f7cbb6a7b6f1c1ec3d86fea8cb9e5ba2e5e6673fde9f6 0.1s done
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 14.68MB / 42.24MB 2.1s
#5 sha256:c0ce3bd8f30377d0ed394d1177e5009ffc3f6907a980562779583174e8b04acc 446B / 446B 2.0s done
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 17.83MB / 42.24MB 2.4s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 20.97MB / 42.24MB 2.6s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 24.12MB / 42.24MB 2.9s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 28.31MB / 42.24MB 3.3s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 32.51MB / 42.24MB 3.6s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 35.65MB / 42.24MB 3.9s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 39.85MB / 42.24MB 4.2s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 42.24MB / 42.24MB 4.4s
#5 sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 42.24MB / 42.24MB 4.4s done
#5 extracting sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 0.1s
#5 extracting sha256:d9aac50bc34e2a0199701ebddca85c36acd90c4d1ad915ca0849364c41547d70 1.4s done
#5 extracting sha256:0150f131fd2fb613a281e43d320d5772ad190446bcbb177a28f53838f53fdd3c 0.0s done
#5 extracting sha256:c0ce3bd8f30377d0ed394d1177e5009ffc3f6907a980562779583174e8b04acc done
#5 DONE 6.0s

#6 [builder 2/7] WORKDIR /usr/src/app
#6 DONE 0.2s

#7 [builder 3/7] COPY . .
#7 DONE 0.0s

#8 [builder 4/7] RUN apk add dumb-init
#8 0.175 fetch https://dl-cdn.alpinelinux.org/alpine/v3.20/main/x86_64/APKINDEX.tar.gz
#8 0.739 fetch https://dl-cdn.alpinelinux.org/alpine/v3.20/community/x86_64/APKINDEX.tar.gz
#8 1.241 (1/1) Installing dumb-init (1.2.5-r3)
#8 1.292 Executing busybox-1.36.1-r29.trigger
#8 1.298 OK: 11 MiB in 17 packages
#8 DONE 1.4s

#9 [builder 5/7] RUN apk add jq
#9 0.504 (1/2) Installing oniguruma (6.9.9-r0)
#9 1.036 (2/2) Installing jq (1.7.1-r0)
#9 1.178 Executing busybox-1.36.1-r29.trigger
#9 1.183 OK: 12 MiB in 19 packages
#9 DONE 1.3s

#10 [builder 6/7] RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
#10 DONE 0.3s

#11 [builder 7/7] RUN rm -rf nx.json package-lock.json .dockerignore &&     cp .docker/nx.json nx.json &&     cp .docker/.dockerignore .dockerignore &&     npm install &&     npm install --save-dev nx@19.5.3 prisma@5.18.0 prisma-class-generator@0.2.11 &&     echo '' > .env &&     npm run prisma:generate &&     rm -rf /usr/src/app/node_modules/@nx &&     rm -rf /usr/src/app/node_modules/@prisma-class-generator &&     rm -rf /usr/src/app/node_modules/@angular  &&     rm -rf /usr/src/app/node_modules/@swc  &&     rm -rf /usr/src/app/node_modules/@babel  &&     rm -rf /usr/src/app/node_modules/@angular-devkit &&     rm -rf /usr/src/app/node_modules/@ngneat &&     rm -rf /usr/src/app/node_modules/@types &&     rm -rf /usr/src/app/node_modules/@ng-packagr
#11 51.71
#11 51.71 added 408 packages, and audited 409 packages in 51s
#11 51.72
#11 51.72 53 packages are looking for funding
#11 51.72   run `npm fund` for details
#11 51.72
#11 51.72 1 moderate severity vulnerability
#11 51.72
#11 51.72 To address all issues, run:
#11 51.72   npm audit fix --force
#11 51.72
#11 51.72 Run `npm audit` for details.
#11 51.72 npm notice
#11 51.72 npm notice New patch version of npm available! 10.8.1 -> 10.8.2
#11 51.72 npm notice Changelog: https://github.com/npm/cli/releases/tag/v10.8.2
#11 51.72 npm notice To update run: npm install -g npm@10.8.2
#11 51.72 npm notice
#11 67.47
#11 67.47 added 106 packages, and audited 515 packages in 16s
#11 67.47
#11 67.47 66 packages are looking for funding
#11 67.47   run `npm fund` for details
#11 67.47
#11 67.47 1 moderate severity vulnerability
#11 67.47
#11 67.47 To address all issues, run:
#11 67.47   npm audit fix --force
#11 67.47
#11 67.47 Run `npm audit` for details.
#11 67.64
#11 67.64 > @nestjs-mod-fullstack/source@0.0.0 prisma:generate
#11 67.64 > ./node_modules/.bin/nx run-many -t=prisma-generate
#11 67.64
#11 68.24
#11 68.24  NX   Running target prisma-generate for project server:
#11 68.24
#11 68.24 - server
#11 68.24
#11 68.24
#11 71.85
#11 71.85 > nx run server:prisma-generate
#11 71.85
#11 71.85 > ./node_modules/.bin/prisma generate --schema=./apps/server/src/prisma/app-schema.prisma
#11 71.85
#11 71.85 Environment variables loaded from .env
#11 71.85 Prisma schema loaded from apps/server/src/prisma/app-schema.prisma
#11 71.85 prisma:info [Prisma Class Generator]:Handler Registered.
#11 71.85 prisma:info [Prisma Class Generator]:Generate /usr/src/app/apps/server/src/app/generated/rest/dto/app_demo.ts
#11 71.85 prisma:info [Prisma Class Generator]:Generate /usr/src/app/apps/server/src/app/generated/rest/dto/migrations.ts
#11 71.85
#11 71.85 ✔ Generated Prisma Client (v5.18.0, engine=binary) to ./node_modules/@prisma/app-client in 81ms
#11 71.85
#11 71.85 ✔ Generated Prisma Class Generator to ./apps/server/src/app/generated/rest/dto in 92ms
#11 71.85
#11 71.85 Start by importing your Prisma Client (See: http://pris.ly/d/importing-client)
#11 71.85
#11 71.85 Tip: Want to react to database changes in your app as they happen? Discover how with Pulse: https://pris.ly/tip-1-pulse
#11 71.85
#11 71.85
#11 71.85
#11 71.85
#11 71.85  NX   Successfully ran target prisma-generate for project server
#11 71.85
#11 71.85
#11 DONE 72.5s

#12 [stage-1 3/4] COPY --from=builder /usr/src/app/ /usr/src/app/
#12 DONE 2.1s

#13 [stage-1 4/4] COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
#13 DONE 0.0s

#14 exporting to image
#14 exporting layers
#14 exporting layers 1.7s done
#14 writing image sha256:96ba78126a32f2aaa3cdf6a793ad2adbee5077adb7dcded7ca3cef270d68fbfe
#14 writing image sha256:96ba78126a32f2aaa3cdf6a793ad2adbee5077adb7dcded7ca3cef270d68fbfe done
#14 naming to docker.io/library/nestjs-mod-fullstack-server:latest done
#14 DONE 1.7s
```

{% endspoiler %}

### 11. Adding an Nginx config file to work with the frontend and backend through a single entry point

A typical config is used here, which I usually use in my projects, and other options can be found on the Internet.

Creating the file `.docker/nginx/nginx.conf`

```bash
map $sent_http_content_type $expires {
    "text/html" epoch;
    "text/html; charset=utf-8" epoch;
    default off;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream nestjs-mod-fullstack-server {
    server nestjs-mod-fullstack-server:8080;
}

server {
    listen 8080;
    server_name localhost;

    gzip on;
    gzip_proxied any;
    gzip_types text/plain application/xml text/css application/javascript application/json;
    gzip_min_length 1000;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";

    client_max_body_size 50m;
    proxy_connect_timeout 5m;
    proxy_send_timeout 5m;
    proxy_read_timeout 5m;
    send_timeout 5m;

    proxy_max_temp_file_size 0;

    root /usr/share/nginx/html;
    index index.html;


    location /api {
        proxy_pass http://nestjs-mod-fullstack-server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # kill cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        if_modified_since off;
        expires off;
        etag off;
    }

    location / {
        expires $expires;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 1m;
        proxy_connect_timeout 1m;
        proxy_intercept_errors on;
        error_page 404 =200 /index.html;
        root /usr/share/nginx/html;
    }
}

```

### 12. Adding a new "Docker Compose" file with a single entry point that will launch the infrastructure and all applications

At the moment, 3 containers will be launched:

1. Database Server
2. Container for creating application databases and filling them through application migrations
3. Backend application
4. Nginx with built-in frontend files for routing requests to the backend

Creating the file `.docker/docker-compose-full.yml`

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-postgre-sql:
    image: 'bitnami/postgresql:15.5.0'
    container_name: 'nestjs-mod-fullstack-postgre-sql'
    networks:
      - 'nestjs-mod-fullstack-network'
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
    ports:
      - '5432:5432'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'pg_isready -U postgres'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
    environment:
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'node:20-bullseye-slim'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    working_dir: '/app'
    volumes:
      - './../:/app'
    command: 'npm run db:create && npm run flyway:migrate'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
  nestjs-mod-fullstack-server:
    image: 'nestjs-mod-fullstack-server:latest'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:8080/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: nginx:alpine
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    volumes:
      - ../.docker/nginx:/etc/nginx/conf.d
      - ../dist/apps/client/browser:/usr/share/nginx/html
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '8080:8080'
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
```

### 13. Creating a new file with environment variables, where instead of the names of servers with localhost, the names of docker containers will stand

In this project, there will be manual duplication of all available variables from the root env file and substitution of server names, in a real project it will be necessary to automate this.

When deploying to a dedicated server, the environment variables are taken not from the file that lies inside the repository, but from the server environment variables.

Creating the file `.docker/docker-compose-full.env`

```bash
SERVER_ROOT_DATABASE_URL=postgres://postgres:postgres_password@nestjs-mod-fullstack-postgre-sql:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:app_password@nestjs-mod-fullstack-postgre-sql:5432/app?schema=public
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
```

### 14. Creating a file with environment variables for watch mode in an Angular application

In this series of posts, various stands with dynamic domain names will not be considered, so for each variant of the stand it will be enough to create your own file with frontend environment variables and configure `project.json`.

Creating the file `apps/client/src/environments/environment.ts`

```typescript
export const serverUrl = 'http://localhost:3000';
```

### 15. Creating a file with environment variables for production mode in an Angular application

Since the frontend and backend are on the same domain, we leave the server address empty and the frontend will work with the backend at the address `/api`.

If the frontend and backend are divided into different domains, then you need to specify the domain and configure CORS policies on the backend and nginx, in these posts this point is omitted to simplify understanding of what is happening.

Creating the file `apps/client/src/environments/environment.prod.ts`

```typescript
export const serverUrl = '';
```

### 16. Adding rules for replacing files when building an Angular application in production mode

The config is very large, so below we show only what has been added.

Adding a few lines to the `apps/client/project.json`

```json
{
  // ...
  "targets": {
    "build": {
      // ...
      "configurations": {
        "production": {
          // ...
          "fileReplacements": [
            {
              "replace": "apps/client/src/environments/environment.ts",
              "with": "apps/client/src/environments/environment.prod.ts"
            }
          ]
        }
      }
    }
  }
}
```

### 17. Updating the configuration of the Angular application to support multiple environment variables

Updating the file `apps/client/src/app/app.config.ts`

```typescript
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RestClientApiModule, RestClientConfiguration } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { appRoutes } from './app.routes';
import { serverUrl } from '../environments/environment';

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
            basePath: serverUrl,
          }),
      ),
    ),
  ],
};
```

### 18. We run unit tests and run applications in watch mode via PM2, followed by checking applications through E2E tests

_Commands_

```bash
npm run test
npm run pm2-full:dev:start
npm run test:e2e
npm run pm2-full:dev:stop
```

### 19. Прогоняем юнит-тесты и запускаем приложения в прод-режиме через PM2 с последующей проверкой приложений через E2E-тесты

_Commands_

```bash
npm run test
npm run pm2-full:prod:start
npm run test:e2e
npm run pm2-full:prod:stop
```

### 20. We are changing the settings of E2E tests for the backend, since in the prod mode via Docker Compose, applications have a single entry point and the port differs from what is specified in watch mode

The ports are specifically used differently in each mode in order to show more different cases in the development and deployment of applications.

Updated file `apps/server-e2e/src/support/test-setup.ts`

```typescript
/* eslint-disable */

import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';

  axios.defaults.baseURL = process.env['BASE_URL'] || `http://${host}:${port}`;
};
```

### 21. We run unit tests and run applications in prod mode through Docker Compose, followed by checking applications through E2E tests

_Commands_

```bash
npm run test
npm run docker-compose-full:prod:start
npm run docker-compose-full:prod:test:e2e
npm run docker-compose-full:prod:stop
```

### 22. After the current developments and before the commit, we run through all the generation, formatting of the code and running unit tests

_Commands_

```bash
npm run manual:prepare
```

{% spoiler Console output %}

```bash
$ npm run manual:prepare


> @nestjs-mod-fullstack/source@0.0.0 manual:prepare
> npm run generate && npm run docs:infrastructure && npm run test


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (15s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (15s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint (1s)
   ✔  nx run server:lint (1s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (1s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 2 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 docs:infrastructure
> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source,client* --all -t=serve --parallel=1 -- --watch=false --inspect=false


 NX   Running target serve for project server:

- server

With additional flags:
  --watch=false
  --inspect=false

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run server:serve:development --watch=false --inspect=false

chunk (runtime: main) main.js (main) 12.5 KiB [entry] [rendered]
webpack compiled successfully (1e208138c6e6150d)
[11:17:23.908] INFO (163227): Starting Nest application...
    context: "NestFactory"
[11:17:23.908] INFO (163227): DefaultNestApp dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): DefaultNestApplicationInitializerSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): DefaultNestApplicationInitializerShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): NestjsPinoLoggerModuleSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): NestjsPinoLoggerModuleShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): TerminusHealthCheckModuleSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): AppModuleSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): AppModuleShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): PrismaModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): Pm2Settings dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): Pm2Shared dependencies initialized
    context: "InstanceLoader"
[11:17:23.908] INFO (163227): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposeSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerCompose dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposePostgreSQLSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): FlywayShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): PrismaModuleSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportStorage dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportStorageSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerCompose dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): FlywaySettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): FlywayShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposeShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportStorageShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DefaultNestApplicationInitializer dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): PrismaModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): Flyway dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): NestjsPinoLoggerModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): TerminusModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): TerminusModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ServeStaticModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): Pm2 dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerCompose dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposePostgreSQL dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): PrismaModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): Flyway dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): LoggerModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): DockerComposePostgreSQLShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): PrismaModuleShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): TerminusHealthCheckModuleShared dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): TerminusHealthCheckModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.909] INFO (163227): AppModule dependencies initialized
    context: "InstanceLoader"
[11:17:23.927] INFO (163227): TerminusHealthCheckController {/api/health}:
    context: "RoutesResolver"
[11:17:23.929] INFO (163227): Mapped {/api/health, GET} route
    context: "RouterExplorer"
[11:17:23.929] INFO (163227): AppController {/api}:
    context: "RoutesResolver"
[11:17:23.929] INFO (163227): Mapped {/api, GET} route
    context: "RouterExplorer"
[11:17:23.929] INFO (163227): Mapped {/api/demo, POST} route
    context: "RouterExplorer"
[11:17:23.929] INFO (163227): Mapped {/api/demo/:id, GET} route
    context: "RouterExplorer"
[11:17:23.930] INFO (163227): Mapped {/api/demo/:id, DELETE} route
    context: "RouterExplorer"
[11:17:23.930] INFO (163227): Mapped {/api/demo, GET} route
    context: "RouterExplorer"
[11:17:23.932] INFO (163227): Connected to database!
    context: "PrismaClient"
[11:17:23.964] DEBUG (163227):
    0: "SERVER_ROOT_DATABASE_URL: Description='Connection string for PostgreSQL with root credentials (example: postgres://postgres:postgres_password@localhost:5432/postgres?schema=public, username must be \"postgres\")', Original Name='rootDatabaseUrl'"
    1: "SERVER_PORT: Description='The port on which to run the server.', Default='3000', Original Name='port'"
    2: "SERVER_HOSTNAME: Description='Hostname on which to listen for incoming packets.', Original Name='hostname'"
    3: "SERVER_APP_DATABASE_URL: Description='Connection string for PostgreSQL with module credentials (example: postgres://feat:feat_password@localhost:5432/feat?schema=public)', Original Name='databaseUrl'"
    context: "All application environments"
[11:17:23.997] INFO (163227): Nest application successfully started
    context: "NestApplication"

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target serve for project server



> @nestjs-mod-fullstack/source@0.0.0 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run app-angular-rest-sdk:test --passWithNoTests


> nx run app-rest-sdk:test --passWithNoTests


> nx run client:test --passWithNoTests


   ✔  nx run app-angular-rest-sdk:test (2s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects
   ✔  nx run app-rest-sdk:test (2s)


———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

      With additional flags:
        --passWithNoTests=true

   →  Executing 2/2 remaining tasks in parallel...
   ✔  nx run client:test (7s)


———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 4 projects

   ✔  nx run server:test (5s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for 4 projects (7s)

      With additional flags:
        --passWithNoTests=true
```

{% endspoiler %}

In the next post, I will add a deployment to a dedicated server in two modes PM2 (it will work on a specific port) and "Docker Compose" (it will work on a subdomain)...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/d97b4121e910627e19fa55f01919557ae898dc42 - commit to current changes

#pm2 #docker #nestjsmod #fullstack
